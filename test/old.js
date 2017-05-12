"use strict";
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../bin/www');
const should = chai.should();
const Browser = require('zombie');
Browser.localhost('localhost', 3001);
const accesses = require('./accesses.json');
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');
let secretWord = 'hello';

let testUserData = {"email":"test@test.com", "password": "test"};
let token = '';

describe('Session', () => {
    describe('/POST session', () => {
        it('it should respond token', (done) => {
            chai.request(server)
                .post('/session')
                .send(testUserData)
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.should.have.status(200);
                    res.body.message.should.have.property('token');
                    token = res.body.message.token;

                    done();
                });
        });
        it('it should respond error', (done) => {
            chai.request(server)
                .post('/session')
                .send()
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.should.have.status(401);
                    done();
                });
        });
    });
    describe('/GET session', () => {
        it('it should respond current user data', (done) => {
            chai.request(server)
                .get('/session')
                .set('Authorization', 'bearer ' + token)
                .send()
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.should.have.status(200);
                    res.body.message.should.have.property('id').eql('1');
                    done();
                });
        });

    });

    describe('/GET session twitter', () => {
        const browser = new Browser();
        before(function(done) {
            browser.visit('/session/twitter', done);
        });
        describe('submits form', function() {
            before(function(done) {
                browser
                    .fill('session[username_or_email]', accesses.twitter.login)
                    .fill('session[password]',accesses.twitter.password)
                    .pressButton('Sign In', done);
            });
            it('should be successful', function() {
                browser.assert.success();
                browser.assert.url({pathname:'/session/twitter/callback'});
            });

            it('should getvalid token', function() {
                let token = JSON.parse(browser.resources["0"].response.body).message.token;
                let decoded = jwt.verify(token, secretWord, (err)=>{
                    if(err) throw new Error('Invalid token');
                    decoded.should.have.property('id').eql('2');
                });
            });
        });
    });
    describe('/GET session facebook', () => {
        const browser = new Browser();
        before(function(done) {
            browser.visit('/session/facebook', done);
        });
        describe('submit form', function() {
            before(function(done) {
                browser
                    .fill('email',accesses.facebook.login)
                    .fill('pass',accesses.facebook.password)
                    .pressButton('login', done);
            });
            it('should be successful', function() {
                browser.assert.success();
                browser.assert.url({pathname:'/session/facebook/callback'});
            });

            it('should getvalid token', function() {
                let token = JSON.parse(browser.resources["0"].response.body).message.token;
                let decoded = jwt.verify(token, secretWord, (err)=>{
                    if(err) throw new Error('Invalid token');
                    decoded.should.have.property('id').eql('2');
                });
            });
        });
    });
    describe('/GET session google', () => {
        let browser = new Browser();
        browser.on('redirect',(req,res)=>{
            console.log('redirect');
        });
        browser.on('loaded',(document)=>{
            console.log('load -- ',document);
        });


        describe('submit form', function() {
            before(function(done) {
                console.log('before describe');

                browser.visit('/session/google', ()=>{
                    console.log('visit');
                    browser
                        .fill('Email', accesses.google.login)
                        .pressButton('Next', ()=>{

                            browser
                                .fill('Passwd',accesses.google.password)
                                .pressButton('Sign in',()=>{
                                    //console.log('fgfg');
                                    let browser1 = browser.resources;
                                    //console.log(browser.resources);
                                    //console.log('-------',browser1.search('submit_approve_access'));
                                    //console.log(browser1);

                                    browser.assert.element("meta", "No element");

                                    //browser.dump();

                                    setTimeout(function () {
                                        // browser.assert.element("frame", "No element");
                                        browser.click('#submit_approve_access',()=>{
                                            console.log('submit');

                                            done();
                                        });
                                    },2000);


                                });
                        });
                });

            });
            it('should be successful', function() {
                //console.log(browser.resources["0"].response.body);
                //console.log('it');
                browser.assert.success();
                browser.assert.url({pathname:'/session/google/callback'});
            });

            it('should get valid token', function() {
                let token = JSON.parse(browser.resources["0"].response.body).message.token;
                let decoded = jwt.verify(token, secretWord, (err)=>{
                    if(err) throw new Error('Invalid token');
                    decoded.should.have.property('id').eql('2');
                });
            });
        });
    });

});

describe('Users', () => {
    describe('/GET users', () => {
        it('it should respond all users', (done) => {
            chai.request(server)
                .get('/users')
                .set('Authorization', 'bearer ' + token)
                .send()
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.body.message.should.be.a('array');
                    res.should.have.status(200);
                    done();
                });
        });
        it('it should respond error', (done) => {
            chai.request(server)
                .get('/users')
                .send()
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.should.have.status(401);
                    done();
                });
        });
    });
    describe('/GET users:id', () => {
        it('it should respond user', (done) => {
            chai.request(server)
                .get('/users/1')
                .set('Authorization', 'bearer ' + token)
                .send()
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.body.message.should.be.a('object');
                    res.body.message.should.have.property('id');
                    res.body.message.should.have.property('firstName');
                    res.body.message.should.have.property('lastName');
                    res.should.have.status(200);
                    done();
                });
        });
    });
    describe('/DELETE users', () => {
        it('it should delete user', (done) => {
            chai.request(server)
                .delete('/users/1')
                .set('Authorization', 'bearer ' + token)
                .send()
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User 1 has been deleted');
                    res.should.have.status(200);
                    done();
                });
        });
    });
    describe('/patch users', () => {
        it('it should edit user', (done) => {
            let patchUserData = {"email":"test4@test.com"};
            chai.request(server)
                .patch('/users/2')
                .set('Authorization', 'bearer ' + token)
                .send(patchUserData)
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.body.message.should.have.property('email').eql('test4@test.com');
                    res.body.message.should.have.property('id').eql('2');
                    res.should.have.status(200);
                    done();
                });
        });
    });
    describe('/post users', () => {
        it('it should add user and return it', (done) => {

            let postUserData = {
                "email": "test2@test.com",
                "password": "test2",
                "firstName": "Alona2",
                "lastName":"Honcharova2"};

            chai.request(server)
                .post('/users')
                .set('Authorization', 'bearer ' + token)
                .send(postUserData)
                .end((err, res) => {
                    res.body.message.should.be.a('object');
                    res.body.message.should.have.property('email').eql('test2@test.com');
                    res.body.message.should.have.property('password').eql('test2');
                    res.body.message.should.have.property('firstName').eql('Alona2');
                    res.body.message.should.have.property('lastName').eql('Honcharova2');
                    res.should.have.status(200);
                    done();
                });
        });
    });
});

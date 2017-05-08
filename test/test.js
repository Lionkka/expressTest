"use strict";
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../bin/www');
let should = chai.should();
let testUserData = {"email":"test@test.com", "password": "test"};
let token = '';
chai.use(chaiHttp);

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
                    res.body.should.have.property('error');
                    res.body.should.have.property('error').eql('Login or password incorrect');
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
                    res.should.have.status(403);
                    res.body.should.have.property('error');
                    res.body.should.have.property('error').eql('Forbidden');
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
                    res.body.message.should.have.property('email').eql('test2@test.com');
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
                    res.body.should.be.a('object');
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

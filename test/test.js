"use strict";
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../bin/www');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('Users', () => {
    describe('/GET book', () => {

        let obj = {"email":"test@test.com", "password": "test"};
        let token = '';
        it('it should respond token', (done) => {
            chai.request(server)
                .post('/session')
                .send(obj)
                .end((err, res) => {
                    res.body.should.be.a('object');
                    res.should.have.status(200);
                    res.body.message.should.have.property('token');
                    token = res.body.message.token;
                    console.log(token);

                    done();
                });
        });
        it('it should respond user data', (done) => {
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
        it('it should respond users', (done) => {
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
        it('it should respond users', (done) => {
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
    });

});
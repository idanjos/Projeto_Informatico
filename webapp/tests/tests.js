var request = require('supertest');
var app = require('../index.js');

describe('GET /', function(){
	it('respond with test', function(done){

		request(app).get('/test').expect('test', done);
	})
});
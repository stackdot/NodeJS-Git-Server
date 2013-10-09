var assert = require('assert');
var expect = require('expect.js');
var git_server = require('../host');
var server;

describe('git_server',function() {
	it('Should expose a function', function() {
		expect(git_server).to.be.a('function');
	});
	it('Should return an object', function() {
		expect(server = new git_server()).to.be.an('object');
		describe('server', function() {
			describe('#repos', function() {
				expect(server.repos).to.be.an('array');
			});
			describe('#logging', function() {
				expect(server.logging).to.be.a('boolean');
			});
		});
	});
});
var assert = require('assert');
var expect = require('expect.js');
var git_server = require('../host');
var server;
var opts = {
	repos: [],
	logging: true,
	repoLocation: '/tmp/test_repos',
	port: 8000
}

describe('git_server',function() {
	it('Should expose a function', function() {
		expect(git_server).to.be.a('function');
	});
	it('Should return an object', function() {
		expect(server = new git_server(opts.repos, opts.logging, opts.repoLocation, opts.port)).to.be.an('object');
		describe('server', function() {
			describe('#repos', function() {
				it('Should be an Array', function() {
					expect(server.repos).to.be.an('array');
				});
			});
			describe('#logging', function() {
				it('Should be a boolean', function() {
					expect(server.logging).to.be.a('boolean');
				});
			});
			describe('#repoLocation', function() {
				it('Should be a string equals to'+, function() {
					expect(server.logging).to.be.a('boolean');
				});
			});
		});
	});
});
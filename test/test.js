var assert = require('assert');
var expect = require('expect.js');
var git_server = require('../host');
var server;
var user = {
	username: 'demo',
	password: 'demo'
}
var repo = {
	name: 'test',
	anonRead: true,
	users: [{ user:user, permissions:['R','W'] }]
}
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
				it('Should be a string equals to '+opts.repoLocation, function() {
					expect(server.repoLocation).to.be.a('string').and.to.be.equal(opts.repoLocation);
				});
			});
			describe('#port', function() {
				it('Should be an integer equals to '+opts.port, function() {
					expect(server.port).to.be.a('number').and.to.be.equal(opts.port);
				});
			});
			describe('#getRepo()', function() {
				it('Should be a function', function() {
					expect(server.getRepo).to.be.a('function');
					expect(server.getRepo(repo.name)).to.have.property(['name', 'anonRead', 'users', ]);
				});
			});
		});
	});
});
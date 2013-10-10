var assert = require('assert');
var expect = require('expect.js');
var git_server = require('../host');
var server;
var user = {
	username: 'demo',
	password: 'demo'
};
var repo = {
	name: 'test',
	anonRead: true,
	users: [{ user:user, permissions:['R','W'] }]
};
var opts = {
	repos: [repo],
	logging: true,
	repoLocation: '/tmp/test_repos',
	port: 8000
};

describe('git_server',function() {
	it('Should expose a function', function() {
		expect(git_server).to.be.a('function');
	});
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
		describe('#on()', function() {
			it('Should be a function', function() {
				expect(server.on).to.be.a('function');
			});
		});
		describe('#getRepo()', function() {
			it('Should be a function and return repo object', function() {
				expect(server.getRepo).to.be.a('function');
				expect(server.getRepo(repo.name+".git")).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ]);
			});
		});
		describe('#getUser()', function() {
			it('Should be a function and return user object', function() {
				expect(server.getUser).to.be.a('function');
				expect(server.getUser(user.username, user.password, repo)).to.be.an('object').and.to.have.keys(['user']);
				expect(server.getUser(user.username, user.password, repo).user).to.be.an('object').and.to.have.keys(['username', 'password']);
			});
		});
		describe('#checkTriggers()', function() {
			it('Should be a function', function() {
				expect(server.checkTriggers).to.be.a('function');
			});
		});
		describe('#onPush()', function() {
			it('Should be a function', function() {
				expect(server.onPush).to.be.a('function');
			});
		});
		describe('#onFetch()', function() {
			it('Should be a function', function() {
				expect(server.onFetch).to.be.a('function');
			});
		});
		describe('#makeReposIfNull()', function() {
			it('Should be a function', function() {
				expect(server.makeReposIfNull).to.be.a('function');
			});
		});
		describe('#gitListeners()', function() {
			it('Should be a function', function() {
				expect(server.gitListeners).to.be.a('function');
			});
		});
		describe('#permissableMethod()', function() {
			it('Should be a function', function() {
				expect(server.permissableMethod).to.be.a('function');
			});
		});
		describe('#processSecurity()', function() {
			it('Should be a function', function() {
				expect(server.processSecurity).to.be.a('function');
			});
		});
		describe('#log()', function() {
			it('Should be a function', function() {
				expect(server.log).to.be.a('function');
			});
		});
		describe('#createRepo()', function() {
			it('Should be a function', function() {
				expect(server.createRepo).to.be.a('function');
			});
		});
		describe('#git', function() {
			it('Should be an object', function() {
				expect(server.git).to.be.an('object').and.to.have.keys(['dirMap', 'autoCreate', 'checkout']);
			});
		});
		describe('#permMap', function() {
			it('Should be an object', function() {
				expect(server.permMap).to.be.an('object').and.to.be.eql({ fetch: 'R', push: 'W' });
			});
		});
		describe('#server', function() {
			it('Should be an object', function() {
				expect(server.server).to.be.an('object');
			});
		});
	});
});
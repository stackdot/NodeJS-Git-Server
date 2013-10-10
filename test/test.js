var assert = require('assert');
var exec = require('child_process').exec;
var expect = require('expect.js');
var helper = require('./helper');
var git_server = require('../host');
var test_rails_name = helper.random();
var test_repo_name = helper.random();
var server;
var user = {
	username: 'demo',
	password: 'demo'
};
var repo = {
	name: helper.random(),
	anonRead: true,
	users: [{ user:user, permissions:['R','W'] }]
};
var opts = {
	repos: [repo],
	logging: false,
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

describe('behaviour', function() {
	describe('Clone a rails repo', function() {
		it('Should clone a repo', function(done) {
			exec('git clone https://github.com/rails/rails.git /tmp/'+test_rails_name, function (error, stdout, stderr) {
				expect(stdout).to.be.a('string');
				expect(stderr).to.be.a('string').and.to.be.equal('');
				done(error);
			});
		});
	});
	describe('Events', function() {
		describe('Abortable events', function() {
			describe('Fetch', function() {
				it('Should emit fetch event', function(done) {
					server.once('fetch', function(update, repo) {
						expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ]);
						expect(update).to.be.an('object').and.to.have.keys(['canAbort']);
						expect(update.accept).to.be.a('function');
						expect(update.reject).to.be.a('function');
						expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true);
						update.reject();
						done();
					});
					exec('cd /tmp/'+test_rails_name+' && git push http://'+user.username+':'+user.password+'@localhost:'+server.port+'/'+repo.name+'.git master', function (error, stdout, stderr) {
						expect(stdout).to.be.a('string');
						expect(stderr).to.be.a('string');
					});
				});
			});
			describe('Pre-receive', function() {
				it('Should emit pre-receive event', function(done) {
					server.once('pre-receive', function(update, repo) {
						expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ]);
						expect(update).to.be.an('object');
						expect(update.accept).to.be.a('function');
						expect(update.reject).to.be.a('function');
						expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true);
						update.reject();
						done();
					});
					exec('cd /tmp/'+test_rails_name+' && git push http://'+user.username+':'+user.password+'@localhost:'+server.port+'/'+repo.name+'.git master', function (error, stdout, stderr) {
						expect(stdout).to.be.a('string');
						expect(stderr).to.be.a('string');
					});
				});
			});
			describe('Update', function() {
				it('Should emit update event', function(done) {
					server.once('update', function(update, repo) {
						expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ]);
						expect(update).to.be.an('object');
						expect(update.accept).to.be.a('function');
						expect(update.reject).to.be.a('function');
						expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true);
						update.reject();
						done();
					});
					exec('cd /tmp/'+test_rails_name+' && git push http://'+user.username+':'+user.password+'@localhost:'+server.port+'/'+repo.name+'.git master', function (error, stdout, stderr) {
						expect(stdout).to.be.a('string');
						expect(stderr).to.be.a('string');
					});
				});
			});
			describe('Pre-auto-gc', function() {
				it('Should emit pre-auto-gc event', function(done) {
					server.once('pre-auto-gc', function(update, repo) {
						expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ]);
						expect(update).to.be.an('object');
						expect(update.accept).to.be.a('function');
						expect(update.reject).to.be.a('function');
						expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true);
						update.reject();
						done();
					});
					exec('cd /tmp/'+test_rails_name+' && git gc --auto', function (error, stdout, stderr) {
						expect(stdout).to.be.a('string');
						expect(stderr).to.be.a('string');
					});
				});
			});
			describe('Push', function() {
				it('Should emit push event', function(done) {
					server.once('push', function(update, repo) {
						expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ]);
						expect(update).to.be.an('object').and.to.have.keys(['canAbort']);
						expect(update.accept).to.be.a('function');
						expect(update.reject).to.be.a('function');
						expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true);
						update.accept();
						done();
					});
					exec('cd /tmp/'+test_rails_name+' && git push http://'+user.username+':'+user.password+'@localhost:'+server.port+'/'+repo.name+'.git master', function (error, stdout, stderr) {
						expect(stdout).to.be.a('string');
						expect(stderr).to.be.a('string');
					});
				});
			});
			describe('Applypatch-msg', function() {
				it('Should emit applypatch-msg event', function(done) {
					server.once('applypatch-msg', function(update, repo) {
						expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ]);
						expect(update).to.be.an('object');
						expect(update.accept).to.be.a('function');
						expect(update.reject).to.be.a('function');
						expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true);
						update.reject();
						done();
					});
					exec('cd /tmp/'+test_rails_name+' && git rm ./Rakefile && git add . && git commit -m \'Avesome changes\' && git push http://'+user.username+':'+user.password+'@localhost:'+server.port+'/'+repo.name+'.git master', function (error, stdout, stderr) {
						expect(stdout).to.be.a('string');
						expect(stderr).to.be.a('string');
					});
				});
			});
			describe('Pre-applypatch', function() {
				it('Should emit pre-applypatch event', function(done) {
					server.once('pre-applypatch', function(update, repo) {
						expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ]);
						expect(update).to.be.an('object');
						expect(update.accept).to.be.a('function');
						expect(update.reject).to.be.a('function');
						expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true);
						update.reject();
						done();
					});
					exec('cd /tmp/'+test_rails_name+' && git push http://'+user.username+':'+user.password+'@localhost:'+server.port+'/'+repo.name+'.git master', function (error, stdout, stderr) {
						expect(stdout).to.be.a('string');
						expect(stderr).to.be.a('string');
					});
				});
			});
			describe('Pre-commit', function() {
				it('Should emit pre-commit event', function(done) {
					server.once('pre-commit', function(update, repo) {
						expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ]);
						expect(update).to.be.an('object');
						expect(update.accept).to.be.a('function');
						expect(update.reject).to.be.a('function');
						expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true);
						update.reject();
						done();
					});
					exec('cd /tmp/'+test_rails_name+' && git push http://'+user.username+':'+user.password+'@localhost:'+server.port+'/'+repo.name+'.git master', function (error, stdout, stderr) {
						expect(stdout).to.be.a('string');
						expect(stderr).to.be.a('string');
					});
				});
			});
			describe('Prepare-commit-msg', function() {
				it('Should emit prepare-commit-msg event', function(done) {
					server.once('prepare-commit-msg', function(update, repo) {
						expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ]);
						expect(update).to.be.an('object');
						expect(update.accept).to.be.a('function');
						expect(update.reject).to.be.a('function');
						expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true);
						update.reject();
						done();
					});
					exec('cd /tmp/'+test_rails_name+' && git push http://'+user.username+':'+user.password+'@localhost:'+server.port+'/'+repo.name+'.git master', function (error, stdout, stderr) {
						expect(stdout).to.be.a('string');
						expect(stderr).to.be.a('string');
					});
				});
			});
			describe('Commit-msg', function() {
				it('Should emit commit-msg event', function(done) {
					server.once('commit-msg', function(update, repo) {
						expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ]);
						expect(update).to.be.an('object');
						expect(update.accept).to.be.a('function');
						expect(update.reject).to.be.a('function');
						expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true);
						update.reject();
						done();
					});
					exec('cd /tmp/'+test_rails_name+' && git push http://'+user.username+':'+user.password+'@localhost:'+server.port+'/'+repo.name+'.git master', function (error, stdout, stderr) {
						expect(stdout).to.be.a('string');
						expect(stderr).to.be.a('string');
					});
				});
			});
			describe('Pre-rebase', function() {
				it('Should emit pre-rebase event', function(done) {
					server.once('pre-rebase', function(update, repo) {
						expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ]);
						expect(update).to.be.an('object');
						expect(update.accept).to.be.a('function');
						expect(update.reject).to.be.a('function');
						expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true);
						update.reject();
						done();
					});
					exec('cd /tmp/'+test_rails_name+' && git push http://'+user.username+':'+user.password+'@localhost:'+server.port+'/'+repo.name+'.git master', function (error, stdout, stderr) {
						expect(stdout).to.be.a('string');
						expect(stderr).to.be.a('string');
					});
				});
			});
});
});
describe('Push', function() {
	it('Should push rails repo to '+repo.name+' repo', function(done) {
		exec('cd /tmp/'+test_rails_name+' && git push http://'+user.username+':'+user.password+'@localhost:'+server.port+'/'+repo.name+'.git master', function (error, stdout, stderr) {
			expect(stdout).to.be.a('string');
			expect(stderr).to.be.a('string');
			done(error);
		});
	});
});
describe('Clone local repo', function() {
	it('Should clone a local repo', function(done) {
		exec('git clone http://'+user.username+':'+user.password+'@localhost:'+server.port+'/'+repo.name+'.git /tmp/'+test_repo_name, function (error, stdout, stderr) {
			expect(stdout).to.be.a('string');
			expect(stderr).to.be.a('string').and.to.be.equal('');
			done(error);
		});
	});
});
});
});
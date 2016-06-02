var exec = require('child_process').exec
var expect = require('expect.js')
var helper = require('./helper')
var git_server = require('../main')
var gitServer = require('../git-server.js')

var test_octocat_name = helper.random()
var server

var user = {
  username: helper.random(),
  password: helper.random()
}

var user2 = {
  username: helper.random(),
  password: helper.random()
}

var user3 = {
  username: helper.random(),
  password: helper.random()
}

var test = {
  username: 'test',
  password: 'test'
}

var repo = {
  name: helper.random(),
  anonRead: true,
  users: [{user: user, permissions: ['R', 'W']}]
}

var repo2 = {
  name: helper.random(),
  anonRead: false,
  users: [{user: user, permissions: ['R', 'W']}, {user: user2, permissions: ['W']}, {user: user3, permissions: ['R']}]
}

var repo3 = {
  name: helper.random(),
  anonRead: false,
  users: [{user: user, permissions: ['R', 'W']}]
}

var opts = {
  repos: [repo, repo2],
  logging: false,
  repoLocation: '/tmp/test/' + helper.random(),
  port: 8000,
  certs: false,
  httpApi: true
}

// server = new git_server(opts)
gitServer.createUser(user.username, user.password, opts.repoLocation)
gitServer.createUser(user2.username, user2.password, opts.repoLocation)
gitServer.createUser(user3.username, user3.password, opts.repoLocation)
gitServer.createUser(test.username, test.password, opts.repoLocation)

server = gitServer.listen(opts.repos, opts.logging, opts.repoLocation, opts.port, opts.certs, opts.httpApi)

describe('git_server', function () {
  it('Should expose a function', function () {
    expect(git_server).to.be.a('function')
  })

  describe('server', function () {
    it('Should be an object', function () {
      expect(server).to.be.an('object')
    })
    describe('#repos', function () {
      it('Should be an Array', function () {
        expect(server.repos).to.be.an('array')
      })
    })
    describe('#logging', function () {
      it('Should be a boolean', function () {
        expect(server.logging).to.be.a('boolean')
      })
    })
    describe('#repoLocation', function () {
      it('Should be a string equals to ' + opts.repoLocation, function () {
        expect(server.repoLocation).to.be.a('string').and.to.be.equal(opts.repoLocation)
      })
    })
    describe('#port', function () {
      it('Should be an integer equals to ' + opts.port, function () {
        expect(server.port).to.be.a('number').and.to.be.equal(opts.port)
      })
    })
    describe('#on()', function () {
      it('Should be a function', function () {
        expect(server.on).to.be.a('function')
      })
    })
    describe('#getRepo()', function () {
      it('Should be a function and return repo object', function () {
        expect(server.getRepo).to.be.a('function')
        expect(server.getRepo(repo.name + '.git')).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users',])
      })
    })
    describe('#getUser()', function () {
      it('Should be a function and return user object', function () {
        expect(server.getUser).to.be.a('function')
        expect(server.getUser(user.username, user.password, repo)).to.be.an('object').and.to.have.keys(['user'])
        expect(server.getUser(user.username, user.password, repo).user).to.be.an('object').and.to.have.keys(['username', 'password'])
      })
    })
    describe('#checkTriggers()', function () {
      it('Should be a function', function () {
        expect(server.checkTriggers).to.be.a('function')
      })
    })
    describe('#onPush()', function () {
      it('Should be a function', function () {
        expect(server.onPush).to.be.a('function')
      })
    })
    describe('#onFetch()', function () {
      it('Should be a function', function () {
        expect(server.onFetch).to.be.a('function')
      })
    })
    describe('#makeReposIfNull()', function () {
      it('Should be a function', function () {
        expect(server.makeReposIfNull).to.be.a('function')
      })
    })
    describe('#gitListeners()', function () {
      it('Should be a function', function () {
        expect(server.gitListeners).to.be.a('function')
      })
    })
    describe('#permissableMethod()', function () {
      it('Should be a function', function () {
        expect(server.permissableMethod).to.be.a('function')
      })
    })
    describe('#processSecurity()', function () {
      it('Should be a function', function () {
        expect(server.processSecurity).to.be.a('function')
      })
    })
    describe('#log()', function () {
      it('Should be a function', function () {
        expect(server.log).to.be.a('function')
      })
      it('Should log an empty line', function (done) {
        logging = server.logging
        log = console.log
        server.logging = true
        global.console.log = function () {
          server.logging = logging
          global.console.log = log
          expect(arguments[0]).to.be.a('string').and.to.be.eql('LOG: ')
          done()
        }
        server.log('')
      })
    })
    describe('#createRepo()', function () {
      it('Should be a function', function () {
        expect(server.createRepo).to.be.a('function')
      })
      it('Should create a repo', function (done) {
        server.createRepo(repo3, done)
      })
      it('Should not create a repo', function (done) {
        var repo4 = repo3
        delete repo4.anonRead
        server.createRepo(repo4, function (err, success) {
          expect(err).not.to.be('')
          done()
        })
      })
      it('Should not create a repo, because this repo should exist', function (done) {
        server.createRepo(repo, function (err, success) {
          expect(err).not.to.be('')
          done()
        })
      })
    })
    describe('#git', function () {
      it('Should be an object', function () {
        expect(server.git).to.be.an('object').and.to.have.keys(['dirMap', 'autoCreate', 'checkout'])
      })
    })
    describe('#permMap', function () {
      it('Should be an object', function () {
        expect(server.permMap).to.be.an('object').and.to.be.eql({ fetch: 'R', push: 'W' })
      })
    })
    describe('#server', function () {
      it('Should be an object', function () {
        expect(server.server).to.be.an('object')
      })
    })
  })

describe('behaviour', function () {
  describe('Clone a Spoon-Knife repo', function () {
    it('Should clone a repo', function (done) {
      this.timeout(7000)
      exec('git clone https://github.com/octocat/Spoon-Knife.git /tmp/test/' + test_octocat_name, function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        // expect(stderr).to.be.a('string').and.to.be.equal('')
        done(error)
      })
    })
  })
  describe('Events', function () {
    describe('Abortable events', function () {
      describe('Fetch', function () {
        it('Should emit fetch event', function (done) {
          server.once('fetch', function (update, repo) {
            expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users',])
            expect(update).to.be.an('object').and.to.have.keys(['canAbort'])
            expect(update.accept).to.be.a('function')
            expect(update.reject).to.be.a('function')
            expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true)
            update.reject()
            done()
          })
          exec('cd /tmp/test/' + test_octocat_name + ' && git push http://' + user.username + ':' + user.password + '@localhost:' + server.port + '/' + repo.name + '.git master', function (error, stdout, stderr) {
            expect(stdout).to.be.a('string')
            expect(stderr).to.be.a('string')
						expect(stderr).to.be.a('string')
          })
        })
      })
      describe('Pre-receive', function () {
        it('Should emit pre-receive event', function (done) {
          server.once('pre-receive', function (update, repo) {
            expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users',])
            expect(update).to.be.an('object')
            expect(update.accept).to.be.a('function')
            expect(update.reject).to.be.a('function')
            expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true)
            update.reject()
            done()
          })
          exec('cd /tmp/test/' + test_octocat_name + ' && git push http://' + user.username + ':' + user.password + '@localhost:' + server.port + '/' + repo.name + '.git master', function (error, stdout, stderr) {
            expect(stdout).to.be.a('string')
            expect(stderr).to.be.a('string')
          })
        })
      })
      describe('Update', function () {
        it('Should emit update event', function (done) {
          server.once('update', function (update, repo) {
            expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users',])
            expect(update).to.be.an('object')
            expect(update.accept).to.be.a('function')
            expect(update.reject).to.be.a('function')
            expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true)
            update.reject()
            done()
          })
          exec('cd /tmp/test/' + test_octocat_name + ' && git push http://' + user.username + ':' + user.password + '@localhost:' + server.port + '/' + repo.name + '.git master', function (error, stdout, stderr) {
            expect(stdout).to.be.a('string')
            expect(stderr).to.be.a('string')
          })
        })
      })
      describe('Push', function () {
        it('Should emit push event', function (done) {
          server.once('push', function (update, repo) {
            expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users',])
            expect(update).to.be.an('object').and.to.have.keys(['canAbort'])
            expect(update.accept).to.be.a('function')
            expect(update.reject).to.be.a('function')
            expect(update.canAbort).to.be.a('boolean').and.to.be.equal(true)
            update.reject()
            done()
          })
          exec('cd /tmp/test/' + test_octocat_name + ' && git push http://' + user.username + ':' + user.password + '@localhost:' + server.port + '/' + repo.name + '.git master', function (error, stdout, stderr) {
            expect(stdout).to.be.a('string')
            expect(stderr).to.be.a('string')
          })
        })
      })
    })

describe('Passive events', function () {
  describe('Post-receive', function () {
    it('Should emit post-receive event', function (done) {
      server.once('post-receive', function (update, repo) {
        expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users',])
        expect(update).to.be.an('object').and.to.have.keys(['canAbort'])
        expect(update.canAbort).to.be.a('boolean').and.to.be.equal(false)
        done()
      })
      exec('cd /tmp/test/' + test_octocat_name + ' && git push http://' + user.username + ':' + user.password + '@localhost:' + server.port + '/' + repo.name + '.git master', function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        expect(stderr).to.be.a('string')
      })
    })
  })
  describe('Post-update', function () {
    it('Should emit post-update event', function (done) {
      server.once('post-update', function (update, repo) {
        expect(repo).to.be.an('object').and.to.have.keys(['name', 'anonRead', 'users', ])
        expect(update).to.be.an('object').and.to.have.keys(['canAbort'])
        expect(update.canAbort).to.be.a('boolean').and.to.be.equal(false)
        done()
      })
      exec('cd /tmp/test/' + test_octocat_name + ' && git push http://' + user.username + ':' + user.password + '@localhost:' + server.port + '/' + repo.name + '.git master', function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        expect(stderr).to.be.a('string')
      })
    })
  })
})
})
describe('Push', function () {
  describe('Authenticated', function () {
    it('Should push Spoon-Knife repo to ' + repo.name + ' repo', function (done) {
      exec('cd /tmp/test/' + test_octocat_name + ' && git push http://' + user.username + ':' + user.password + '@localhost:' + server.port + '/' + repo2.name + '.git master', function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        expect(stderr).to.be.a('string')
        done(error)
      })
    })
  })
  describe('Anonymously', function () {
    it('Should try to push Spoon-Knife repo anonymously to ' + repo2.name + ' repo and fail', function (done) {
      exec('cd /tmp/test/' + test_octocat_name + ' && git push http://localhost:' + server.port + '/' + repo2.name + '.git master', function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        expect(stderr).to.be.a('string').and.not.to.be.equal('')
        done()
      })
    })
  })
  describe('No write permissions', function () {
    it('Should try to push Spoon-Knife repo with lack of write permissions to ' + repo2.name + ' repo and fail', function (done) {
      exec('cd /tmp/test/' + test_octocat_name + ' && git push http://' + user3.username + ':' + user3.password + '@localhost:' + server.port + '/' + repo2.name + '.git master', function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        expect(stderr).to.be.a('string')
        done(error)
      })
    })
  })
})
describe('Fetch', function () {
  describe('Anonymously', function () {
    it('Should fetch a local repo anonymously', function (done) {
      exec('cd /tmp/test/' + test_octocat_name + ' && git fetch http://localhost:' + server.port + '/' + repo.name + '.git', function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        expect(stderr).to.be.a('string')
        done(error)
      })
    })
    it('Should fetch a local repo anonymously and fail', function (done) {
      exec('cd /tmp/test/' + test_octocat_name + ' && git fetch http://localhost:' + server.port + '/' + repo2.name + '.git', function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        expect(stderr).to.be.a('string').and.not.to.be.equal('')
        done()
      })
    })
  })
  describe('Non existent Repo', function () {
    it('Should try to fetch non existing repo', function (done) {
      exec('git fetch http://localhost:' + server.port + '/' + helper.random() + '.git /tmp/test/' + test_octocat_name, function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        expect(stderr).to.be.a('string').and.not.to.be.equal('')
        done()
      })
    })
  })
})
describe('Clone', function () {
  describe('Anonymously', function () {
    it('Should clone a local repo anonymously', function (done) {
      exec('git clone http://localhost:' + server.port + '/' + repo.name + '.git /tmp/test/' + helper.random(), function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        //expect(stderr).to.be.a('string').and.to.be.equal('')
        done(error)
      })
    })
  })
  describe('Authenticated', function () {
    it('Should clone a local repo with autentication', function (done) {
      exec('git clone http://' + user.username + ':' + user.password + '@localhost:' + server.port + '/' + repo.name + '.git /tmp/test/' + helper.random(), function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        //expect(stderr).to.be.a('string').and.to.be.equal('')
        done(error)
      })
    })
  })
  describe('Wrong credentials', function () {
    it('Should try clone a local repo with wrong credentials', function (done) {
      exec('git clone http://' + helper.random() + ':' + helper.random() + '@localhost:' + server.port + '/' + repo2.name + '.git /tmp/test/' + helper.random(), function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        expect(stderr).to.be.a('string').and.not.to.be.equal('')
        done()
      })
    })
  })
  describe('No read permission', function () {
    it('Should try clone a local repo with lack of read permissions', function (done) {
      exec('git clone http://' + user2.password + ':' + user2.username + '@localhost:' + server.port + '/' + repo2.name + '.git /tmp/test/' + helper.random(), function (error, stdout, stderr) {
        expect(stdout).to.be.a('string')
        expect(stderr).to.be.a('string').and.not.to.be.equal('')
        done()
      })
    })
  })
})
})

describe('gitServer new functions', function () {
  describe('#gitServer.createUser()', function () {
    it('Should be a function', function () {
      expect(gitServer.createUser).to.be.a('function')
    })
    it('Should create a user', function () {
      var createUser1 = gitServer.createUser('user-test', 'pass-test', opts.repoLocation)
      expect(createUser1).to.equal('Creating user')
    })
    it('Should not create a user (missing paramenter)', function () {
      var createUser2 = gitServer.createUser('user-test2')
      expect(createUser2).to.equal('Username and password are necessary')
    })
    it('Should not create a user, because this user should exist', function () {
      var createUser3 = gitServer.createUser('user-test', 'pass-test', opts.repoLocation)
      expect(createUser3).to.equal('This user already exists')
    })
    it('Should create a user although there is no repoLocation parameter', function () {
      var createUser4 = gitServer.createUser(helper.random(), 'pass-testPath')
      expect(createUser4).to.equal('Creating user')
    })
  })

  describe('#gitServer.deleteUser()', function () {
    it('Should be a function', function () {
      expect(gitServer.deleteUser).to.be.a('function')
    })
    it('Should delete a user', function () {
      var deleteUser1 = gitServer.deleteUser('user-test', 'pass-test', opts.repoLocation)
      expect(deleteUser1).to.equal('Deleting user')
    })
    it('Should not delete a user (missing paramenter)', function () {
      var deleteUser2 = gitServer.deleteUser('user-test2')
      expect(deleteUser2).to.equal('Username and password are necessary')

    })
    it('Should not delete a user, because this user shouldn\'t exist', function () {
      var deleteUser3 = gitServer.deleteUser('user-test', 'pass-test', opts.repoLocation)
      expect(deleteUser3).to.equal('This user doesn\'t exist')
    })
  })

  describe('#gitServer.createRepo()', function () {
    it('Should be a function', function () {
      expect(gitServer.createRepo).to.be.a('function')
    })
    it('Should create a repo', function () {
      var repoObject1 = {
        repoName: 'repotest',
        anonRead: true,
        userName: 'test',
        password: 'test',
        R: true,
        W: false
      }
      var createRepo1 = gitServer.createRepo(repoObject1, opts.repoLocation)
      expect(createRepo1).to.equal('Creating repo')
    })
    it('Should not create a repo', function () {
      var repoObject2 = {
        repoName: 'repotest',
        userName: 'test',
        password: 'test',
        R: true,
        W: true
      }
      var createRepo2 = gitServer.createRepo(repoObject2, opts.repoLocation)
      expect(createRepo2).to.equal('.anonRead parameter is missing')
    })
    it('Should not create a repo, because this repo should exist', function () {
      var repoObject3 = {
        repoName: 'repotest',
        anonRead: true,
        userName: 'test',
        password: 'test',
        R: true,
        W: true
      }
      var createRepo3 = gitServer.createRepo(repoObject3, opts.repoLocation)
      expect(createRepo3).to.equal('This repo already exists')
    })
    it('Should not create a repo, because this user doesn\'t exist', function () {
      var repoObject4 = {
        repoName: 'repotest',
        anonRead: true,
        userName: 'test1',
        password: 'test1',
        R: true,
        W: true
      }
      var createRepo4 = gitServer.createRepo(repoObject4, opts.repoLocation)
      expect(createRepo4).to.equal('You have to create test1 user before asociate it to a repo!')
    })
    it('Should not create a repo, because this password is not correct', function () {
      var repoObject5 = {
        repoName: 'repotest',
        anonRead: true,
        userName: 'test',
        password: 'test1',
        R: true,
        W: true
      }
      var createRepo5 = gitServer.createRepo(repoObject5, opts.repoLocation)
      expect(createRepo5).to.equal('Incorrect password')
    })
    it('Should create a repo although there is no repoLocation parameter', function () {
      var repoObject6 = {
        repoName: helper.random(),
        anonRead: true,
        userName: 'test',
        password: 'test',
        R: true,
        W: true
      }
      var createRepo6 = gitServer.createRepo(repoObject6)
      expect(createRepo6).to.equal('Creating repo')
    })
  })
    describe('#gitServer.deleteRepo()', function () {
      it('Should delete a repo', function () {
        gitServer.deleteRepo('repotest', opts.repoLocation, (err) => throw err)
      })
      it('Should not delete a repo, because there are no parameters', function () {
        gitServer.deleteRepo(function (err){ if (err) throw err })
      })
      it('Should not delete a repo, because this repo shouldn\'t exist', function () {
        gitServer.deleteRepo('repotest', opts.repoLocation, done)
      })
    })
})
})

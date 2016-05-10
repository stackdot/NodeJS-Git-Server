// Testeo del servidor e importaciones
// var _git = require('./lib/host.js')
var fs = require('fs')
// var certif, repos, options
// var _git2 = require('./server.js')
var pushover = require('pushover')

/* repos = JSON.parse(fs.readFileSync('/Users/lourdeslirosalinas/git-server/repos.db'))

var readFileSync = fs.readFileSync
var resolve = require('path').resolve

var readFile = function (path) {
  path = resolve(path)
  return readFileSync(path, {encoding: 'utf8'}).toString()
}

certif = {
  key: readFile('/Users/lourdeslirosalinas/privatekey.pem'),
  cert: readFile('/Users/lourdeslirosalinas/certificate.pem')
}

options = {
  repos: repos.repos,
  logging: true,
  repoLocation: '/Users/lourdeslirosalinas/git-server/repos',
  port: 7000,
  httpApi: true,
  certs: certif
}

// Creación del servidor

_git = new GitServer2(options)
*/

if (fs.existsSync('/Users/lourdeslirosalinas/git-server/repos.db')) {
  var repositorios = JSON.parse(fs.readFileSync('/Users/lourdeslirosalinas/git-server/repos.db'))
  var usuarios = JSON.parse(fs.readFileSync('/Users/lourdeslirosalinas/git-server/repos.db')).users
} else {
  repositorios = {
    repos: [],
    users: []
  }
}

getRepo = function (repoName) {
  var repo, _i, _len, _ref, repos
  // _ref = this.repos;
  if (fs.existsSync('/Users/lourdeslirosalinas/git-server/repos.db')) {
    repos = JSON.parse(fs.readFileSync('/Users/lourdeslirosalinas/git-server/repos.db'))
  }else {
    repos = {
      repos: [],
      users: []
    }
  }
  _ref = repos.repos
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    repo = _ref[_i]
    if (repo.name + '.git' === repoName || repoName === repo.name) {
      return repo
    }
  }
  return false
}

getUser = function (userName) {
  var user, _i, _len, _ref, repos
  // _ref = this.repos;
  if (fs.existsSync('/Users/lourdeslirosalinas/git-server/repos.db')) {
    repos = JSON.parse(fs.readFileSync('/Users/lourdeslirosalinas/git-server/repos.db'))
  }else {
    repos = {
      repos: [],
      users: []
    }
  }
  _ref = repos.users
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    user = _ref[_i]
    if (user.username === userName || userName === user.username) {
      return user
    }
  }
  return false
}

function createUser (user, repos, users, callback) {
  this.repos = repos
  if ((user.username == null) || (user.password == null)) {
    callback(new Error('Username and password are necessary'), null)
    console.log('Username and password are necessary')
    return false
  }
  if (!this.getUser(user.username)) {
    console.log('Creating user', user.username)
    repos.users.push(user)
    var reposon = JSON.stringify(
      {
        repos: repos.repos,
        users: repos.users
      }
    )
    fs.writeFileSync('/Users/lourdeslirosalinas/git-server/repos.db', reposon)
  } else {
    // callback(new Error('This repo already exists'), null)
    return console.log('This user already exists')
  }
}

function createRepo (repo, repos, users, callback) {
//  this.repos = JSON.parse(fs.readFileSync('/Users/lourdeslirosalinas/git-server/repos.db')).repos
  this.repos = repos
  if ((repo.name == null) || (repo.anonRead == null)) {
    console.log('Nombre: ' + repo.name + ', Anonimo? ' + repo.anonRead)
    callback(new Error('Not enough details, need atleast .name and .anonRead'), null)
    console.log('Not enough details, need atleast .name and .anonRead')
    return false
  }
  if (!this.getRepo(repo.name)) {
    console.log('Creating repo', repo.name)
    // var reposit = new Array(this.repos)
    // reposit.push(repo)
    repositorios.repos.push(repo)

    var reposon = JSON.stringify(
      {
        repos: repos.repos,
        users: repos.users
      }
    )
    fs.writeFileSync('/Users/lourdeslirosalinas/git-server/repos.db', reposon)

    this.git = pushover('/Users/lourdeslirosalinas/git-server/repos', {
      autoCreate: false
    })

    return this.git.create(repo.name, callback)
  } else {
    // callback(new Error('This repo already exists'), null)
    return console.log('This repo already exists')
  }
}

var repo1 = {
  name: 'repo5',
  anonRead: false,
  users: [
    {
      user: {
        username: 'demo1',
        password: 'demo1'
      },
      permissions: ['R', 'W']
    }
  ],
  onSuccessful: {
    fetch: function () {
      return console.log('Successful fetch on "repo6" repo')
    },
    push: function () {
      return console.log('Success push on "repo6" repo')
    }
  }
}

var user1 = {
  username: 'demo1',
  password: 'demo1'
}

createRepo(repo1, repositorios, usuarios)
createUser(user1, repositorios, usuarios)

// repositorios.push(repo9)
// console.log(repositorios)

// _git.createRepo(repo1)
// _git2.createRepo(repo2)

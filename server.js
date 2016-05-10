var GitServer
var getUserHomeDir
var repos
var certif
var repoDB
var repoLocation
var options
var _git
var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')

GitServer = require('./main.js')

// Obtención de los repositorios

var directory = '/Users/lourdeslirosalinas/git-server/repos'

getUserHomeDir = function () {
  var dir
  if (process.platform === 'win32') {
    dir = 'USERPROFILE'
  } else {
    dir = 'HOME'
  }
  return process.env[dir]
}

repoLocation = directory || path.join(getUserHomeDir(), './git-server/repos')

if (directory !== void 0) {
  repoDB = directory + '.db'
} else {
  repoDB = path.join(getUserHomeDir(), './git-server/repos.db')
}

mkdirp.sync(repoLocation)

if (fs.existsSync(repoDB)) {
  repos = JSON.parse(fs.readFileSync(repoDB))
  console.log(repos.repos)
} else {
  repos = {
    repos: [],
    users: []
  }
  var reposon = JSON.stringify(repos)
  fs.writeFileSync('/Users/lourdeslirosalinas/git-server/repos.db', reposon)
}

// Obtención de los certificados
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
  port: 7002,
  httpApi: true,
  certs: certif
}

// Server

_git = new GitServer(options)
module.exports = _git

/* var repo8 = {
  name: 'repo8',
  anonRead: true,
  users: [
    {
      user: {
        username: 'demo2',
        password: 'demo2'
      },
      permissions: ['R', 'W']
    }
  ]
}

_git.createRepo(repo8) */

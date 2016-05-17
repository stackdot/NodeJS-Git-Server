var GitServer
var getUserHomeDir
var repos
var certif
var repoDB
var repoLocation
var options
var _git
var fs = require('fs-extra')
var path = require('path')
var mkdirp = require('mkdirp')

GitServer = require('./main.js')

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
  repos = fs.readJsonSync(repoDB)
  console.log(repos.repos)
} else {
  repos = {repos: [], users: []}
  fs.writeJsonSync(repoDB, repos)
}

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

_git = new GitServer(options)
module.exports = _git

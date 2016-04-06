#!/usr/bin/env node
/*

	This is the Netbeast GIT repo server.

*/

var EventEmitter, GitServer, Table, async, commander, certs, fs, getUserHomeDir, logging, mkdirp, path, repoDB, repoLocation, repoPort, repos, _g,
  _this = this,
  __hasProp = {}.hasOwnProperty,
  __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key] } function ctor () { this.constructor = child } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child }

EventEmitter = require('events').EventEmitter

GitServer = require('./lib/host.js')

mkdirp = require('mkdirp')

fs = require('fs')

async = require('async')

path = require('path')

Table = require('cli-table')

commander = require('commander')

var mosca = require('mosca')
var mqtt = require('mqtt')

var mqttServ = new mosca.Server({})

var client = mqtt.connect('ws://localhost:7000')

commander.version('0.2.2')
  .option('-p, --port [value]', 'Port to run Git on', parseInt)
  .option('-d, --directory [value]', 'Directory of the repos')
  .option('-l, --logging', 'Verbose logging on or off')
  .option('-s, --ssl', 'Enable SSL support; requires key and cert options')
  .option('-k, --key [value]', 'SSL key path (required for ssl)')
  .option('-c, --cert [value]', 'SSL cert path (required for ssl)')
  .option('-a, --certificate-authority [value]', 'SSL certificate authority path')
  .parse(process.argv)

repoPort = commander.port || 7000

logging = commander.logging || false

if (commander.ssl && commander.key && commander.cert) {
  var readFileSync = fs.readFileSync
  var resolve = require('path').resolve
  var readFile = function (path) {
    path = resolve(path)
    return readFileSync(path, {encoding: 'utf8'}).toString()
  }

  certs = {
    key: readFile(commander.key),
    cert: readFile(commander.cert)
  }

  if (commander.certificateAuthority) {
    // Properly concatinate the ca chain for node https
    var caChain = function caChain (cc) {
      var ca = []
      var cert = []
      var chain = cc.split('\n')
      var _i, _len, line

      for (_i = 0, _len = chain.length; _i < _len; _i++) {
        line = chain[_i]
        if (!(line.length !== 0)) {
          continue
        }
        cert.push(line)
        if (line.match(/-END CERTIFICATE-/)) {
          ca.push(cert.join('\n'))
          cert = []
        }
      }

      return ca
    }
    certs.ca = caChain(readFile(commander.certificateAuthority))
  }
}

getUserHomeDir = function () {
  var dir
  if (process.platform === 'win32') {
    dir = 'USERPROFILE'
  } else {
    dir = 'HOME'
  }
  return process.env[dir]
}

repoLocation = commander.directory || path.join(getUserHomeDir(), './git-server/repos')

if (commander.directory !== void 0) {
  repoDB = commander.directory + '.db'
} else {
  repoDB = path.join(getUserHomeDir(), './git-server/repos.db')
}

mkdirp.sync(repoLocation)

if (fs.existsSync(repoDB)) {
  repos = JSON.parse(fs.readFileSync(repoDB))
} else {
  repos = {
    repos: [],
    users: []
  }
}

// Creamos el servidor
if (!certs) {
  _g = new GitServer(repos.repos, logging, repoLocation, repoPort)
} else {
  _g = new GitServer(repos.repos, logging, repoLocation, repoPort, certs)
}
console.log(repos)

// *****************************************************************************

function saveConfig () {
  console.log('evento emitidoooooooo')
  var config
  config = JSON.stringify({
    repos: this.gitServer.repos,
    users: this.users
  })
  return fs.writeFileSync(repoDB, config)
}

var GitServer
var fs = require('fs-extra')
var pushover = require('pushover')
var path = require('path')
var mkdirp = require('mkdirp')

GitServer = require('./main.js')

var readFile = function (path) {
  path = require('path').resolve(path)
  return fs.readFileSync(path, {encoding: 'utf8'}).toString()
}

var getUserHomeDir = function () {
  var dir
  if (process.platform === 'win32') {
    dir = 'USERPROFILE'
  } else {
    dir = 'HOME'
  }
  return process.env[dir]
}

function getRepositories (repoDB) {
  if (fs.existsSync(repoDB)) {
    var repositories = fs.readJsonSync(repoDB)
  } else {
    repositories = {repos: [], users: []}
  }
  return repositories
}

function getRepoIndex (repoName, repoDB) {
  var repo, _i, _len, _ref, repos
  repos = getRepositories(repoDB)
  _ref = repos.repos
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    repo = _ref[_i]
    if (repo.name + '.git' === repoName || repoName === repo.name) {
      return _i
    }
  }
  return -1
}

function getUserIndex (userName, repoDB) {
  var user, _i, _len, _ref, repos
  repos = getRepositories(repoDB)
  _ref = repos.users
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    user = _ref[_i]
    if (user.username === userName || userName === user.username) {
      return _i
    }
  }
  return -1
}

var createUser = function (username, password, repoLocation) {
  var msg
  var repoPath

  if (typeof repoLocation !== 'string') {
    repoPath = path.join(getUserHomeDir(), './git-server/repos')
    msg = 'Using default repoLocation...'
    console.log(msg)
  }else {
    repoPath = repoLocation
  }
  var repoDB = repoPath + '.db'
  mkdirp.sync(repoPath)
  this.repos = getRepositories(repoDB)

  var user = {username: username, password: password}
  if (arguments.length < 2) {
    return callback(new Error('Username and password are necessary'))
  }

  if (getUserIndex(user.username, repoDB) === -1) {
    this.repos.users.push(user)
    fs.writeJson(repoDB, {repos: this.repos.repos, users: this.repos.users}, callback)
  } else {
    callback()
  }
}

function deleteUser (username, password, repoLocation) {
  var msg
  var repoPath
  if (typeof repoLocation !== 'string') {
    repoPath = path.join(getUserHomeDir(), './git-server/repos')
    console.log(msg)
  } else {
    repoPath = repoLocation
  }

  var repoDB = repoPath + '.db'
  mkdirp.sync(repoPath)
  this.repos = getRepositories(repoDB)

  if (arguments.length < 2) {
    return callback(new Error('Username and password are necessary'))
  }

  var user = {username: username, password: password}

  var index = getUserIndex(user.username, repoDB)
  if (index !== -1) {
    this.repos.users.splice(index, 1)
    fs.writeJson(repoDB, {repos: this.repos.repos, users: this.repos.users}, callback)
  } else {
    callback()
  }
}

var createRepo = function (repoObject, repoLocation) {
  var repoPath
  var permissions
  var users = true
  var pass = true
  var msg

  var repoName = repoObject.repoName
  var anonRead = repoObject.anonRead
  var userName = repoObject.userName
  var password = repoObject.password
  var R = repoObject.R
  var W = repoObject.W

  // If there is not specified repoLocation, it uses default repoLocation
  if (typeof repoLocation !== 'string') {
    repoPath = path.join(getUserHomeDir(), './git-server/repos')
    msg = 'Using default repoLocation...' + repoPath
    console.log(msg)
  }else {
    repoPath = repoLocation
  }
  var repoDB = repoPath + '.db'
  mkdirp.sync(repoPath)
  this.repos = getRepositories(repoDB)

  if (R === true) {
    if (W === true) {
      permissions = ['R', 'W']
    }else {
      permissions = ['R']
    }
  }else {
    if (W === true) {
      permissions = ['W']
    }else {
      permissions = [ ]
    }
  }

  var repo = {name: repoName, anonRead: anonRead, users: [{user: {username: userName, password: password}, permissions: permissions}],
    onSuccessful: {
      fetch: function () {
        return console.log('Successful fetch on this repo')
      },
      push: function () {
        return console.log('Success push on this repo')
      }
    }
  }

  if (typeof repo.anonRead !== 'boolean') {
    msg = '.anonRead parameter is missing'
    console.log(msg)
    return msg
  }

  if (typeof repo.name !== 'string') {
    msg = 'repo name parameter is missing'
    console.log(msg)
    return msg
  }

  if ((repo.name == null) || (repo.anonRead == null)) {
    msg = 'Not enough details, need atleast .name and .anonRead'
    console.log(msg)
    return msg
  }
  var index = getRepoIndex(repo.name, repoDB)
  var index2 = getUserIndex(userName, repoDB)
  if (index2 === -1) {
    users = false
  }else {
    if (this.repos.users[index2].password !== password) {
      pass = false
      msg = 'Incorrect password'
      console.log(msg)
      return msg
    }
  }
  if (index === -1 && users === true && pass === true) {
    this.repos.repos.push(repo)

    fs.writeJsonSync(repoDB, {repos: this.repos.repos, users: this.repos.users})

    this.git = pushover(repoPath, {
      autoCreate: false
    })
    this.git.create(repo.name)
    msg = 'Creating repo'
    console.log(msg)
    return msg
  } else {
    if (users === true) {
      msg = 'This repo already exists'
      console.log(msg)
      return msg
    }else {
      msg = 'You have to create ' + userName + ' user before asociate it to a repo!'
      console.log(msg)
      return msg
    }
  }
}

var deleteRepo = function (repoName, repoLocation) {
  var args = []
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i])
  }

  var msg
  var repoPath

  if (typeof repoName !== 'string') {
    msg = 'Not enough details, need atleast .name'
    console.log(msg)
    return msg
  }

  if (typeof repoLocation !== 'string') {
    repoPath = path.join(getUserHomeDir(), './git-server/repos')
    msg = 'Using default repoLocation...' + repoPath
    console.log(msg)
  }else {
    repoPath = repoLocation
  }
  var repoDB = repoPath + '.db'
  mkdirp.sync(repoPath)
  this.repos = getRepositories(repoDB)

  var index = getRepoIndex(repoName, repoDB)
  if (index !== -1) {
    this.repos.repos.splice(index, 1)
    fs.writeJSONSync(repoDB, {repos: this.repos.repos, users: this.repos.users})
    fs.removeSync(repoLocation + repoName + '.git')

    msg = 'Deleting repo'
    console.log(msg)
    return msg
  } else {
    msg = 'This repo doesn\'t exists'
    console.log(msg)
    return msg
  }
}
/* ********************************************* LISTEN **********************************************************************/
var listen = function (repos, logging, repoLocation, port, certs, enable_http_api, callback) {
  var repositories

  var repoPath = repoLocation || path.join(getUserHomeDir(), './git-server/repos')
  var repoDB = repoPath + '.db'
  mkdirp.sync(repoPath)

  var _i, _len, _ref, _i2, _len2, _ref2, repo, us, users

  if (fs.existsSync(repoDB)) {
    repositories = fs.readJsonSync(repoDB)
    //  Addition of repos to json file
    _ref = repos
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      repo = _ref[_i]
      if ((repo.name == null) || (repo.anonRead == null)) {
        callback(new Error('Not enough details, need atleast .name and .anonRead'), null)
        this.log('Not enough details, need atleast .name and .anonRead')
        return false
      }
      _ref2 = repo.users
      users = true
      for (_i2 = 0, _len2 = _ref2.length; _i2 < _len2; _i2++) {
        us = _ref2[_i2]
        if (getUserIndex(us.user.username, repoDB) === -1) {
          console.log('You have to create ' + us.user.username + ' user before asociate it to a repo!')
          users = false
        }
      }
      if ((getRepoIndex(repo.name, repoDB) === -1) && (users === true)) {
        repositories.repos.push(repo)
        fs.writeJsonSync(repoDB, repositories)
      }
    }
  } else {
    repositories = {repos: [], users: []}

    fs.writeJsonSync(repoDB, repositories)
    //  Addition of repos to json file
    _ref = repos
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      repo = _ref[_i]
      if ((repo.name == null) || (repo.anonRead == null)) {
        callback(new Error('Not enough details, need atleast .name and .anonRead'), null)
        this.log('Not enough details, need atleast .name and .anonRead')
        return false
      }
      _ref2 = repo.users
      users = true
      for (_i2 = 0, _len2 = _ref2.length; _i2 < _len2; _i2++) {
        us = _ref2[_i2]
        if (getUserIndex(us.user.username, repoDB) === -1) {
          console.log('You have to create ' + us.user.username + ' user before asociate it to a repo!')
          users = false
        }
      }
      if ((getRepoIndex(repo.name, repoDB) === -1) && (users === true)) {
        repositories.repos.push(repo)
        fs.writeJsonSync(repoDB, repositories)
      }
    }
  }

  var options = {
    repos: repositories.repos,
    logging: logging || false,
    repoLocation: repoPath,
    port: port || 7002,
    certs: certs || undefined,
    httpApi: enable_http_api || true
  }

  var _git = new GitServer(options)
  if (callback) {
    callback(null, options.repoLocation)
  }

  return _git
}

module.exports.deleteRepo = deleteRepo
module.exports.createUser = createUser
module.exports.createRepo = createRepo
module.exports.deleteUser = deleteUser
module.exports.listen = listen
module.exports.readFile = readFile

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
  return false
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
  return false
}

function createUser (username, password, repoLocation, callback) {
  var repoDB = repoLocation + '.db'
  this.repos = getRepositories(repoDB)
  var user = {username: username, password: password}
  if ((user.username == null) || (user.password == null)) {
    callback(new Error('Username and password are necessary'), null)
    console.log('Username and password are necessary')
    return false
  }
  if (getUserIndex(user.username, repoDB) === false) {
    console.log('Creating user', user.username)
    this.repos.users.push(user)
    fs.writeJsonSync(repoDB, {repos: this.repos.repos, users: this.repos.users})
  } else {
    // callback(new Error('This user already exists'), null)
    return console.log('This user already exists')
  }
}

function deleteUser (username, password, repoLocation, callback) {
  var repoDB = repoLocation + '.db'
  this.repos = getRepositories(repoDB)
  var user = {username: username, password: password}
  if ((user.username == null) || (user.password == null)) {
    callback(new Error('Username and password are necessary'), null)
    console.log('Username and password are necessary')
    return false
  }
  var i = getUserIndex(user.username, repoDB)
  if (i !== false) {
    console.log('Deleting user', user.username)
    this.repos.users.splice(i, 1)
    fs.writeJsonSync(repoDB, {repos: this.repos.repos, users: this.repos.users})
    return console.log('This user has been deleted')
  } else {
    // callback(new Error('This user doesnt exist'), null)
    return console.log('This user doesn\'t exist')
  }
}

var createRepo = function (repoName, anonRead, userName, password, R, W, repoLocation, callback) {
  var repoDB = repoLocation + '.db'
  this.repos = getRepositories(repoDB)
  var permissions

  var args = []
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i])
  }

  callback = args.pop()

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
    if (callback) {
      callback(new Error('.anonRead parameter is missing'), null)
    }else {
      console.log(new Error('.anonRead parameter is missing'))
    }
    return false
  }

  if (typeof repo.name !== 'string') {
    if (callback) {
      callback(new Error('repo name parameter is missing'), null)
    }else {
      console.log(new Error('repo name parameter is missing'))
    }
    return false
  }

  if ((repo.name == null) || (repo.anonRead == null)) {
    callback(new Error('Not enough details, need atleast .name and .anonRead'), null)
    console.log('Not enough details, need atleast .name and .anonRead')
    return false
  }
  var index = getRepoIndex(repo.name, repoDB)
  if (index === false) {
    console.log('Creating repo', repo.name)
    this.repos.repos.push(repo)

    fs.writeJsonSync(repoDB, {repos: this.repos.repos, users: this.repos.users})

    this.git = pushover(repoLocation, {
      autoCreate: false
    })

    return this.git.create(repo.name, callback)
  } else {
    // callback(new Error('This repo already exists'), null)
    callback(new Error('This repo already exists'), null)
    return console.log('This repo already exists')
  }
}

function deleteRepo (repoName, repoLocation, callback) {
  var repoDB = repoLocation + '.db'
  this.repos = getRepositories(repoDB)
  if (repoName == null) {
    callback(new Error('Not enough details, need atleast .name'), null)
    console.log('Not enough details, need atleast .name')
    return false
  }
  var i = getRepoIndex(repoName, repoDB)
  if (i !== false) {
    console.log('Deleting repo', repoName)
    this.repos.repos.splice(i, 1)
    fs.writeJSONSync(repoDB, {repos: this.repos.repos, users: this.repos.users})
    fs.removeSync(repoLocation + repoName + '.git')/*, function (err) {
      throw err
    }*/

    this.git = pushover(repoLocation, {
      autoCreate: false
    })

    return console.log('This repo has been deleted')
  } else {
    // callback(new Error('This repo doesnt exists'), null)
    return console.log('This repo doesn\'t exists')
  }
}
/* ********************************************* LISTEN **********************************************************************/
var listen = function (repos, logging, repoLocation, port, certs, enable_http_api, callback) {
  var getUserHomeDir
  var repositories

  getUserHomeDir = function () {
    var dir
    if (process.platform === 'win32') {
      dir = 'USERPROFILE'
    } else {
      dir = 'HOME'
    }
    return process.env[dir]
  }

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
        if (getUserIndex(us.user.username, repoDB) === false) {
          console.log('You have to create ' + us.user.username + ' user before asociate it to a repo!')
          users = false
        }
      }
      if ((getRepoIndex(repo.name, repoDB) === false) && (users === true)) {
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
        if (getUserIndex(us.user.username, repoDB) === false) {
          console.log('You have to create ' + us.user.username + ' user before asociate it to a repo!')
          users = false
        }
      }
      if ((getRepoIndex(repo.name, repoDB) === false) && (users === true)) {
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
    callback('Lets create repos!', repoLocation)
  }
  return _git
}

module.exports.deleteRepo = deleteRepo
module.exports.createUser = createUser
module.exports.createRepo = createRepo
module.exports.deleteUser = deleteUser
module.exports.listen = listen
module.exports.readFile = readFile

var fs = require('fs-extra')
var pushover = require('pushover')

var repoLocation = '/Users/lourdeslirosalinas/git-server/repos'
var repoDB = '/Users/lourdeslirosalinas/git-server/repos.db'

function getRepositories () {
  if (fs.existsSync(repoDB)) {
    var repositories = fs.readJsonSync(repoDB)
  } else {
    repositories = {repos: [], users: []}
  }
  return repositories
}

function getRepo (repoName) {
  var repo, _i, _len, _ref, repos
  repos = getRepositories()
  _ref = repos.repos
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    repo = _ref[_i]
    if (repo.name + '.git' === repoName || repoName === repo.name) {
      return _i
    }
  }
  return false
}

function getUser (userName) {
  var user, _i, _len, _ref, repos
  repos = getRepositories()
  _ref = repos.users
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    user = _ref[_i]
    if (user.username === userName || userName === user.username) {
      return _i
    }
  }
  return false
}

function createUser (username, password, callback) {
  this.repos = getRepositories()
  var user = {username: username, password: password}
  if ((user.username == null) || (user.password == null)) {
    callback(new Error('Username and password are necessary'), null)
    console.log('Username and password are necessary')
    return false
  }
  if (getUser(user.username) === false) {
    console.log('Creating user', user.username)
    this.repos.users.push(user)
    fs.writeJsonSync(repoDB, {repos: this.repos.repos, users: this.repos.users})
  } else {
    // callback(new Error('This user already exists'), null)
    return console.log('This user already exists')
  }
}

function deleteUser (username, password, callback) {
  this.repos = getRepositories()
  var user = {username: username, password: password}
  if ((user.username == null) || (user.password == null)) {
    callback(new Error('Username and password are necessary'), null)
    console.log('Username and password are necessary')
    return false
  }
  var i = getUser(user.username)
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

function createRepo (repoName, anonRead, userName, password, R, W, callback) {
  this.repos = getRepositories()
  var permissions

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

  if ((repo.name == null) || (repo.anonRead == null)) {
    callback(new Error('Not enough details, need atleast .name and .anonRead'), null)
    console.log('Not enough details, need atleast .name and .anonRead')
    return false
  }
  var i = getRepo(repo.name)
  if (i === false) {
    console.log('Creating repo', repo.name)
    this.repos.repos.push(repo)

    fs.writeJsonSync(repoDB, {repos: this.repos.repos, users: this.repos.users})

    this.git = pushover(repoLocation, {
      autoCreate: false
    })

    return this.git.create(repo.name, callback)
  } else {
    // callback(new Error('This repo already exists'), null)
    return console.log('This repo already exists')
  }
}

function deleteRepo (repoName, callback) {
  this.repos = getRepositories()
  if (repoName == null) {
    callback(new Error('Not enough details, need atleast .name'), null)
    console.log('Not enough details, need atleast .name')
    return false
  }
  var i = getRepo(repoName)
  if (i !== false) {
    console.log('Deleting repo', repoName)
    this.repos.repos.splice(i, 1)
    fs.writeJSONSync(repoDB, {repos: this.repos.repos, users: this.repos.users})
    fs.removeSync('/Users/lourdeslirosalinas/git-server/repos/' + repoName + '.git')/*, function (err) {
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

module.exports.deleteRepo = deleteRepo
module.exports.createUser = createUser
module.exports.createRepo = createRepo
module.exports.deleteUser = deleteUser

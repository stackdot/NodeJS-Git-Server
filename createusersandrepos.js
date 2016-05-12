var fs = require('fs')
var pushover = require('pushover')
var rmdir = require('rmdir')

if (fs.existsSync('/Users/lourdeslirosalinas/git-server/repos.db')) {
  var repositories = JSON.parse(fs.readFileSync('/Users/lourdeslirosalinas/git-server/repos.db'))
} else {
  repositories = {
    repos: [],
    users: []
  }
}

function getRepo (repoName) {
  var repo, _i, _len, _ref, repos
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

function getUser (userName) {
  var user, _i, _len, _ref, repos
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
  if (!getUser(user.username)) {
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
    // callback(new Error('This user already exists'), null)
    return console.log('This user already exists')
  }
}

function deleteUser (user, repos, users, callback) {
  this.repos = repos
  if ((user.username == null) || (user.password == null)) {
    callback(new Error('Username and password are necessary'), null)
    console.log('Username and password are necessary')
    return false
  }
  if (getUser(user.username)) {
    console.log('Deleting user', user.username)
    repos.users.pop(user)
    var reposon = JSON.stringify(
      {
        repos: repos.repos,
        users: repos.users
      }
    )
    fs.writeFileSync('/Users/lourdeslirosalinas/git-server/repos.db', reposon)
    return console.log('This user has been deleted')
  } else {
    // callback(new Error('This user doesnt exist'), null)
    return console.log('This user doesn\'t exist')
  }
}

function createRepo (repo, repos, users, callback) {
  this.repos = repos
  if ((repo.name == null) || (repo.anonRead == null)) {
    callback(new Error('Not enough details, need atleast .name and .anonRead'), null)
    console.log('Not enough details, need atleast .name and .anonRead')
    return false
  }
  if (!getRepo(repo.name)) {
    console.log('Creating repo', repo.name)
    repositories.repos.push(repo)

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

function deleteRepo (repo, repos, users, callback) {
//  this.repos = JSON.parse(fs.readFileSync('/Users/lourdeslirosalinas/git-server/repos.db')).repos
  this.repos = repos
  if (repo.name == null) {
    callback(new Error('Not enough details, need atleast .name'), null)
    console.log('Not enough details, need atleast .name')
    return false
  }
  if (getRepo(repo.name)) {
    console.log('Deleting repo', repo.name)
    repositories.repos.pop(repo)

    var reposon = JSON.stringify(
      {
        repos: repos.repos,
        users: repos.users
      }
    )
    fs.writeFileSync('/Users/lourdeslirosalinas/git-server/repos.db', reposon)
    rmdir('/Users/lourdeslirosalinas/git-server/repos/' + repo.name + '.git', function (err, dirs, files) {
      throw err
    })

    this.git = pushover('/Users/lourdeslirosalinas/git-server/repos', {
      autoCreate: false
    })

    return console.log('This repo has been deleted')
  } else {
    // callback(new Error('This repo doesnt exists'), null)
    return console.log('This repo doesn\'t exists')
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
/*
createRepo(repo1, repositories)
createUser(user1, repositories)
deleteUser(user1, repositories)
deleteRepo(repo1, repositories)

*/

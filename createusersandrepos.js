// Testeo del servidor e importaciones

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

function deleteUser (user, repos, users, callback) {
  this.repos = repos
  if ((user.username == null) || (user.password == null)) {
    callback(new Error('Username and password are necessary'), null)
    console.log('Username and password are necessary')
    return false
  }
  if (this.getUser(user.username)) {
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
    // callback(new Error('This repo already exists'), null)
    return console.log('This user doesnt exist')
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
    console.log('Nombre: ' + repo.name)
    callback(new Error('Not enough details, need atleast .name'), null)
    console.log('Not enough details, need atleast .name')
    return false
  }
  if (this.getRepo(repo.name)) {
    console.log('Deleting repo', repo.name)
    // var reposit = new Array(this.repos)
    // reposit.push(repo)
    repositories.repos.pop(repo)

    var reposon = JSON.stringify(
      {
        repos: repos.repos,
        users: repos.users
      }
    )
    fs.writeFileSync('/Users/lourdeslirosalinas/git-server/repos.db', reposon)

    // Borramos el repositorio
    rmdir('/Users/lourdeslirosalinas/git-server/repos/' + repo.name + '.git', function (err, dirs, files) {
      throw err
    })

    this.git = pushover('/Users/lourdeslirosalinas/git-server/repos', {
      autoCreate: false
    })

    return console.log('This repo has been deleted')
  } else {
    // callback(new Error('This repo already exists'), null)
    return console.log('This repo doesnt exists')
  }
}

/*

**************** How to use it: Example

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

createRepo(repo1, repositories)
createUser(user1, repositories)
deleteUser(user1, repositories)
deleteRepo(repo1, repositories)

*/

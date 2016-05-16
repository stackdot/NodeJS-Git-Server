var fs = require('fs-extra')
var pushover = require('pushover')

var repoLocation = '/Users/lourdeslirosalinas/git-server/repos'
var repoDB = '/Users/lourdeslirosalinas/git-server/repos.db'

function getRepositories () {
  if (fs.existsSync(repoDB)) {
    var repositories = fs.readJsonSync(repoDB)
  } else {
    repositories = {
      repos: [],
      users: []
    }
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
  var user = {
    username: username,
    password: password
  }
  if ((user.username == null) || (user.password == null)) {
    callback(new Error('Username and password are necessary'), null)
    console.log('Username and password are necessary')
    return false
  }
  if (getUser(user.username) === false) {
    console.log('Creating user', user.username)
    this.repos.users.push(user)
    fs.writeJsonSync(repoDB, {
      repos: this.repos.repos,
      users: this.repos.users
    })
  } else {
    // callback(new Error('This user already exists'), null)
    return console.log('This user already exists')
  }
}

function deleteUser (user, callback) {
  this.repos = getRepositories()
  if ((user.username == null) || (user.password == null)) {
    callback(new Error('Username and password are necessary'), null)
    console.log('Username and password are necessary')
    return false
  }
  var i = getUser(user.username)
  if (i !== false) {
    console.log('Deleting user', user.username)
    this.repos.users.splice(i, 1)
    fs.writeJsonSync(repoDB, {
      repos: this.repos.repos,
      users: this.repos.users
    })
    return console.log('This user has been deleted')
  } else {
    // callback(new Error('This user doesnt exist'), null)
    return console.log('This user doesn\'t exist')
  }
}

function createRepo (repo, callback) {
  this.repos = getRepositories()
  if ((repo.name == null) || (repo.anonRead == null)) {
    callback(new Error('Not enough details, need atleast .name and .anonRead'), null)
    console.log('Not enough details, need atleast .name and .anonRead')
    return false
  }
  var i = getRepo(repo.name)
  if (i === false) {
    console.log('Creating repo', repo.name)
    this.repos.repos.push(repo)

    fs.writeJsonSync(repoDB, {
      repos: this.repos.repos,
      users: this.repos.users
    })

    this.git = pushover(repoLocation, {
      autoCreate: false
    })

    return this.git.create(repo.name, callback)
  } else {
    // callback(new Error('This repo already exists'), null)
    return console.log('This repo already exists')
  }
}

function deleteRepo (repo, callback) {
  this.repos = getRepositories()
  if (repo.name == null) {
    callback(new Error('Not enough details, need atleast .name'), null)
    console.log('Not enough details, need atleast .name')
    return false
  }
  var i = getRepo(repo.name)
  if (i !== false) {
    console.log('Deleting repo', repo.name)
    this.repos.repos.splice(i, 1)
    fs.writeJSONSync(repoDB, {
      repos: this.repos.repos,
      users: this.repos.users
    })
    fs.removeSync('/Users/lourdeslirosalinas/git-server/repos/' + repo.name + '.git')/*, function (err) {
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

var repo1 = {
  name: 'repo1',
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

var repo2 = {
  name: 'repo2',
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
      return console.log('Successful fetch on this repo')
    },
    push: function () {
      return console.log('Success push on this repo')
    }
  }
}

var user1 = {
  username: 'demo4',
  password: 'demo4'
}

createRepo(repo1)
//createRepo(repo2))

createUser('demo1', 'demo1')
//deleteUser(user1)
//deleteRepo(repo1)

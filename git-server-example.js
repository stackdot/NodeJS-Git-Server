var gitServer = require('./git-server.js')
var port = 8000
var logging = true
var directory
var certs = {
  key: gitServer.readFile('/Users/lourdeslirosalinas/privatekey.pem'),
  cert: gitServer.readFile('/Users/lourdeslirosalinas/certificate.pem')
}
var enable_http_api = true
var repos = {repos: []}

var repoObject1 = {
  repoName: 'repo',
  anonRead: true,
  userName: 'test',
  password: 'test',
  R: true,
  W: true
}

var repoObject2 = {
  repoName: 'repo',
  anonRead: true,
  userName: 'test',
  password: 'test',
  R: true,
  W: true
}

gitServer.listen(repos, logging, directory, port, certs, enable_http_api, function (error, repoLocation) {
  console.log(repoLocation)
  if (error === null) {
    gitServer.createRepo(repoObject1, repoLocation)
    gitServer.createUser('test', 'test', repoLocation)
    gitServer.createRepo(repoObject2, repoLocation)
  }else {
    console.log(error)
  }
})

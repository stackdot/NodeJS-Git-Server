var gitServer = require('./git-server.js')
var _git
var port = 8000
var logging = true
var directory
var certs = {
  key: gitServer.readFile('/Users/lourdeslirosalinas/privatekey.pem'),
  cert: gitServer.readFile('/Users/lourdeslirosalinas/certificate.pem')
}
var enable_http_api = true
var repos = {repos: []}

_git = gitServer.listen(repos, logging, directory, port, certs, enable_http_api, function (error, repoLocation) {
  console.log(repoLocation)
  if (error === null) {
    gitServer.createRepo('repotest', true, 'test', 'test', true, true, repoLocation, function () {})
    gitServer.createUser('test', 'test', repoLocation, function () {})
    gitServer.createRepo('repotest', true, 'test', 'test', true, true, repoLocation, function () {})
  }else {
    console.log(error)
  }
})

// gitServer.createUser('demo1', 'demo1', repoLocation)
// gitServer.deleteUser('demo1', 'demo1', repoLocation)
// gitServer.createRepo('repo1', false, 'demo1', 'demo1', true, true, repoLocation)
// gitServer.deleteRepo('repo1', repoLocation)

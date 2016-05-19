var gitServer = require('./git-server.js')

var port = 7000
var logging = true
var directory
var certs = {
  key: gitServer.readFile('/Users/lourdeslirosalinas/privatekey.pem'),
  cert: gitServer.readFile('/Users/lourdeslirosalinas/certificate.pem')
}
var enable_http_api = true

gitServer.listen(port, logging, directory, certs, enable_http_api, function (options) {
  gitServer.createRepo('repo1', false, 'demo1', 'demo1', true, true, options.repoLocation)
})

// gitServer.createUser('demo1', 'demo1', repoLocation)
// gitServer.deleteUser('demo1', 'demo1', repoLocation)
// gitServer.createRepo('repo1', false, 'demo1', 'demo1', true, true, repoLocation)
// gitServer.deleteRepo('repo1', repoLocation)

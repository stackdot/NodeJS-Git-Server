var gitServer = require('./git-server.js')

var port = 7000
var logging = true
var directory
var certs = {
  key: gitServer.readFile('/Users/lourdeslirosalinas/privatekey.pem'),
  cert: gitServer.readFile('/Users/lourdeslirosalinas/certificate.pem')
}
var enable_http_api = true

gitServer.listen(port, logging, directory, certs, enable_http_api, function () {
  gitServer.createRepo('repo1', false, 'demo1', 'demo1', true, true)
})

// gitServer.createUser('demo1', 'demo1')
// gitServer.deleteUser('demo1', 'demo1')
// gitServer.createRepo('repo1', false, 'demo1', 'demo1', true, true)
// gitServer.deleteRepo('repo1')

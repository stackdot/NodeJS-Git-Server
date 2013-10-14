var server = require('./lib/host');
module.exports = function(options) {
	if(!options || !options.repos) {
		throw 
		new Error("Options must be object with at least .repos property");
	} else {
		logging = (options.logging) ? options.logging : false;
		repoLocation = (options.repoLocation) ? options.repoLocation : '/tmp/repos';
		port = (options.port) ? options.port : 7000;
		certs = (options.certs) ? options.certs : null;
		return new server(options.repos, logging, repoLocation, port, certs);
	}
}
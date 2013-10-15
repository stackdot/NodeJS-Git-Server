var url = require('url');
var path = require('path');

var api = {
	get: {},
	put: {},
	post: {},
	delete: {}
};

module.exports = function(req, res, git, next) {
	req.path = {};
	req.path.url = url.parse(req.url.toLowerCase());
	req.path.parts = req.path.url.pathname.split("/");
	api.router(req, function(err, isApiCall, fn) {
		if(err) {
			throw new Error(err);
		}
		if(!isApiCall) {
			next();
		} else {
			fn(req, res, git, next);
		}
	});
}

api.router = function(req, callback) {
	if(req.path.parts[0] !== 'api') {
		callback(null, false, null);
		return;
	}
	method = req.method.toLowerCase();
	if(!api[method]) {
		console.log(method);
		callback(null, true, api.method_not_allowed);
	}
}

api.method_not_allowed = function(req, res, git, next) {
	res.writeHead(405, {'Content-Type': 'text/plain'});
	res.end('Method not allowed');
}
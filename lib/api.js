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
	if(req.path.parts[1] !== 'api') {
		callback(null, false, null);
		return;
	}
	method = req.method.toLowerCase();
	if(!api[method]) {
		callback(null, true, api.method_not_allowed);
		return;
	}
	if(!api[method][req.path.parts[2]]) {
		callback(null, true, api.not_found);
		return;
	}
	callback(null, true, api[method][req.path.parts[2]]);
}

api.method_not_allowed = function(req, res) {
	res.writeHead(405, {'Content-Type': 'text/plain'});
	res.end('Method not allowed');
}
api.not_found = function(req, res) {
	res.writeHead(404, {'Content-Type': 'text/plain'});
	res.end('404, Not found');
}

api.get.repo = function(req, res, git) {
	repo = git.getRepo(req.path.parts[2]);
	if(repo) {
		res.end(repo);
	} else {
		api.not_found(req, res);
	}
}
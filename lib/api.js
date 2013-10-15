var url = require('url');
var path = require('path');

var api = {};

module.exports = function(req, res, git, next) {
	req.path = {};
	req.path.url = url.parse(request.url.toLowerCase());
	req.path.parts = req.path.url.split("/");
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

}
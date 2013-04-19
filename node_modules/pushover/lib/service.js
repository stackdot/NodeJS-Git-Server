var spawn = require('child_process').spawn;
var through = require('through');
var inherits = require('inherits');
var HttpDuplex = require('http-duplex');

module.exports = function (opts, req, res) {
    var service = new Service(opts, req, res);
    
    Object.keys(opts).forEach(function (key) {
        service[key] = opts[key];
    });
    return service;
};

var headerRE = {
    'receive-pack' : '([0-9a-fA-F]+) ([0-9a-fA-F]+)'
        + ' refs\/(heads|tags)\/(.*?)( |00|\u0000)'
        + '|^(0000)$'
    ,
    'upload-pack' : '^\\S+ ([0-9a-fA-F]+)'
};

inherits(Service, HttpDuplex);

function Service (opts, req, res) {
    HttpDuplex.call(this, req, res);
    var self = this;
    
    self.headers = req.headers;
    self.method = req.method;
    self.url = req.url;
    
    self.status = 'pending';
    self.repo = opts.repo;
    self.service = opts.service;
    self.cwd = opts.cwd;
    
    var buffered = through().pause();
    req.pipe(buffered);
    
    var data = '';
    req.once('data', function (buf) {
        data += buf;
        
        var ops = data.match(new RegExp(headerRE[self.service], 'gi'));
        if (!ops) return;
        data = undefined;
       
        ops.forEach(function(op) {
            var m = op.match(new RegExp(headerRE[self.service]));
            if (self.service === 'receive-pack') {
                self.last = m[1];
                self.commit = m[2];

                if (m[3] == 'heads') {
                    var type = 'branch';
                    self.evName = 'push';
                } else {
                    var type = 'version';
                    self.evName = 'tag';
                }

                var headers = {
                    last: self.last,
                    commit : self.commit
                };
                headers[type] = self[type] = m[4];
                self.emit('header', headers);
            }
            else if (self.service === 'upload-pack') {
                self.commit = m[1];
                self.evName = 'fetch';
                self.emit('header', { commit : self.commit });
            }
        });
    });
    
    self.once('accept', function () {
        process.nextTick(function () {
            var ps = spawn('git-' + opts.service, [
                '--stateless-rpc',
                opts.cwd
            ]);
            self.emit('service', ps);
            ps.stdout.pipe(res);
            
            buffered.pipe(ps.stdin);
            buffered.resume();
            ps.on('exit', self.emit.bind(self, 'exit'));
        });
    });
    
    self.once('reject', function (code, msg) {
        res.statusCode = code;
        res.end(msg);
    });
}

Service.prototype.accept = function (dir) {
    if (this.status !== 'pending') return;
    
    this.status = 'accepted';
    this.emit('accept', dir);
};

Service.prototype.reject = function (code, msg) {
    if (this.status !== 'pending') return;
    
    if (msg === undefined && typeof code === 'string') {
        msg = code;
        code = 500;
    }
    this.status = 'rejected';
    this.emit('reject', code || 500, msg);
};

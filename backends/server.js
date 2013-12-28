var http = require('http');
var url = require('url');
var zerorpc = require('zerorpc');

var client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:42242");

var qs = require('querystring');

var port = 11112;

http.createServer(function(req, res) {
	var pathname = url.parse(req.url).pathname;
	if (pathname == '/cluster/') {
		if (req.method == 'POST') {
			var body = '';
			req.on('data', function (data) {
				body += data;
			});
			req.on('end', function() {
				client.invoke("run", qs.parse(body), function(error, reply, streaming) {
					if (error) {
					}
					console.log(reply);
				});
			});
		}
	}
}).listen(port);
console.log('Server running at http://127.0.0.1:' + port + '/');

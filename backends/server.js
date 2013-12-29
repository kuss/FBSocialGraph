var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var zerorpc = require('zerorpc');

var qs = require('querystring');

var port = 11112;
var mime_types = {
  ".html": 'text/html',
  ".js": 'application/javascript'
};

function send_file(res, p) {
  fs.readFile(p, function (err, data) {
    res.writeHead(200, {'Content-Type': mime_types[path.extname(p)]});
    res.end(data);
  });
}

http.createServer(function(req, res) {
	var pathname = url.parse(req.url).pathname;
	if (pathname == '/') {
		send_file(res, '../frontends/index.html');
	} else if (pathname == '/cluster') {
		if (req.method == 'POST') {
			var body = '';
			req.on('data', function (data) {
				body += data;
			});
			req.on('end', function() {
				var req_data = qs.parse(body, null, null, {maxKeys: 0});
				var res_data = {};
				for (var row in req_data) {
					if (row.split(/\[|\]/)[1] == 'mutuals') res_data[row.split(/\[|\]/)[0]] = req_data[row];
				}
				
				var client = new zerorpc.Client();
				client.connect("tcp://127.0.0.1:14242");

				client.invoke("run", JSON.stringify(res_data), function(error, reply, streaming) {
					if (error) {
						console.log(error);
					}

					if (reply === undefined || reply === null) {
						res.writeHead(500, {'Content-Type': 'text/plain'});
						res.end("Server error: cluster server is not working correctly");
					}
					else {
						res.writeHead(200, { 'Content-Type': 'application/json' });
						res.write(reply);
						res.end();
					}
				});
			});
		}
	} else {
		send_file(res, '../frontends' + pathname);
	}
}).listen(port);
console.log('Server running at http://127.0.0.1:' + port + '/');

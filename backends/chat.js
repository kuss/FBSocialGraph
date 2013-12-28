var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

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

var users = []

http.createServer(function(req, res) {
  var pathname = url.parse(req.url).pathname;
  if (pathname == "/") {
    send_file(res, './static/chat.html');
  } else if (pathname == "/send") {
    var message = url.parse(req.url, true).query.message;
    for (var i in users) {
      users[i](message);
    }
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end();
  } else if (pathname == "/receive") {
    var callback = url.parse(req.url, true).query.callback;
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.write(new Buffer(1024));
    res.write("<html><body>");
    users.push(function(message) {
      var chunk = '<script>' + callback + '("' + message + '");</script>\r\n';
      res.write(chunk);
    });
  } else {
    send_file(res, './static' + pathname);
  }
}).listen(port);
console.log('Server running at http://127.0.0.1:' + port + '/');

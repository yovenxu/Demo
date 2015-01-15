var http = require('http');
var fs = require('fs');

var port = 1337;
var app = function (request, response) {
	var pathname = request.url.slice(1);
	pathname = !!pathname ? pathname : 'demo.html';

	fs.readFile(pathname, function (err, file) {
		if (err) {
			response.writeHead(404);
			response.end('404 not found.');
			return;
		}

		response.writeHead(200);
		response.end(file);
	});
};

http.createServer(app).listen(port);
console.log('Server listen at '+ port);
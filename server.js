var express = require('express');
var app = express();
var http = require('http').Server(app);
app.use(express.static(__dirname+'/www'));


let server = http.listen(3000,function(){
    let host = server.address().address;
    let port = server.address().port;
    console.log("My First Nodejs Server");
    console.log("Server listening on: " + host + " port: " + port);
});
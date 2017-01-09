var express = require("express");
var app = express();

var port = process.env.PORT || 3000;

var index = require('./routes/index.js');

app.use(express.static('server/public'));

app.use('/',index);

var server = app.listen(port,function(){
   var port = server.address().port;
    console.log('fruit market live on port, ', port);
});

module.exports = app;
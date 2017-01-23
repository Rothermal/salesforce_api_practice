var express = require("express");
var app = express();
var port = process.env.PORT || 3000;

var salesforce = require('./routes/salesforce.js');
var index = require('./routes/index.js');

app.use(express.static('server/public'));

app.use('/',index);
app.get('/salesforce', salesforce);

var server = app.listen(port,function(){
   var port = server.address().port;
    console.log('fruit market live on port, ', port);
});

module.exports = app;
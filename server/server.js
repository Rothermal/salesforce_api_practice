var express = require("express");
var app = express();
var port = process.env.PORT || 3000;

var salesforce = require('./routes/salesforce');
var index = require('./routes/index');

app.use(express.static('server/public'));

app.use('/salesforce', salesforce);




app.use('/',index);

var server = app.listen(port,function(){
   var port = server.address().port;
    console.log('fruit market live on port, ', port);
});

module.exports = app;
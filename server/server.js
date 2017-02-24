var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;

var salesforce = require('./routes/salesforce');
var index = require('./routes/index');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('server/public'));

app.use('/salesforce', salesforce);




app.use('/',index);

var server = app.listen(port,function(){
   var port = server.address().port;
    console.log('fruit market live on port, ', port);
});

module.exports = app;
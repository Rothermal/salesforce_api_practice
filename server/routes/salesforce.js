var express = require('express');
var router = express.Router();
var nforce = require('nforce');
var env = require('dotenv');
env.config();
var sfUser  = process.env.SFUSERNAME;
var sfPass  = process.env.SFPASS;
var sfToken = process.env.SFTOKEN;
var sfclientId = process.env.SFCLIENTID;
var sfsecret = process.env.SFSECRET;
var oauth;
var org = nforce.createConnection({
    clientId: sfclientId,
    clientSecret: sfsecret,
    redirectUri: 'http://localhost:3000/oauth/_callback',
    environment: 'production',
    mode : 'single',
    autoRefresh : true

});

console.log('hit salesforce');


org.authenticate({username:sfUser, password:sfPass}, function(err, response){
   console.log('in authenticate');
    if(err) {
        console.log(err);
    } else {
        oauth = response;
        console.log('oauth response object', response);
        testQuery();
    }
});

var q = 'SELECT id, name FROM Apple__c';

function testQuery () {
    console.log('sending query');
    org.query({query: 'SELECT id, name FROM Apple__c'}, function (err, response) {
        if (err) {
            console.log(err);
        }
        console.log('respnse from query', response);
    });
}


module.exports = router;
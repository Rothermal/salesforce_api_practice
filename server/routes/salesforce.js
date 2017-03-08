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
var gameId;

var org = nforce.createConnection({
    clientId: sfclientId,
    clientSecret: sfsecret,
    redirectUri: 'http://localhost:3000/oauth/_callback',
    environment: 'production',
    mode : 'single',
    autoRefresh : true

});

org.authenticate({username:sfUser, password:sfPass}, function(err, response){
   console.log('in authenticate');
    if(err) {
        console.log(err);
    } else {
        oauth = response;
        console.log('oauth response object', response);
    }
});


router.post('/buyFruit', function (req,res) {
    console.log('request in buyfruit post route', req.body);

 var   fruit = nforce.createSObject('Fruit__c');
    fruit.set('type__c', req.body.name);
    fruit.set('buy_price__c', req.body.price);
    fruit.set('Fruit_Stand__c', gameId);

    org.insert({sobject: fruit}, function (err, response) {
        if (err) {
            console.log('here is the error: ', err);
        } else {
            console.log('buyfruit response id in post route',response.id);
            res.send(response.id);
        }
    });
});

router.put('/sellFruit',function(req,res){
    console.log('req in sellfruit route', req.body);

    var fruit = nforce.createSObject('Fruit__c');
    fruit.set('id', req.body.id);
    fruit.set('sell_price__c', req.body.price);

    org.update({sobject: fruit}, function (err, response) {
        if (err) {
            console.log('here is the error: ', err);
        } else {
            console.log('sellfruit response in put route',response);
            res.send(response);
        }
    });

});
router.get('/gameType',function(req,res){
    console.log('hit gametype route');
    org.query({query:"SELECT name " +
    "FROM Game_Variable__c"},
        function (err, response){
       if (err){
           console.log(err);
       }
          console.log(response.records);
          res.send(response.records);
    });
});


router.get('/gameSettings/:type',function(req, res){
console.log('in variables get route',req.params);
    var type = req.params.type;
    org.query({query: "" +
    "SELECT id, " +
    "name, " +
    "Fruits__c, " +
    "Game_Length__c, " +
    "Starting_Cash__c," +
    "Game_Interval__c," +
    "MaxSwing__c," +
    "MinSwing__c," +
    "Starting_Price__c " +
    "FROM Game_Variable__c " +
    "WHERE name = '"+type+"'"},
        function (err, response) {
        if (err) {
            console.log(err);
        }
        console.log('response from game settings query', response.records[0]._fields);
            res.send(response.records[0]._fields);

        });
});

router.get('/start',function(req, res){
    var fruitStand = nforce.createSObject('Fruit_Stand__c');

    org.insert({ sobject: fruitStand }, function(err, response){
        if(err){
            console.log( 'here is the error: ', err );
        } else {
           gameId = response.id;
            console.log('the game id',gameId);
            res.send(gameId);
        }
    });
});

console.log('hit salesforce');



module.exports = router;
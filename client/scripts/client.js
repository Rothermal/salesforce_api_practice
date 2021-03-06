/**
 * Created by Mark on 1/8/17.
 */
// game constants
var fruitArray = ["Apples", "Oranges", "Bananas", "Pears"];
var startingPrice = 5.00 ; //Whole numbers = dollars
var minSwing = 1; // Whole numbers = cents
var maxSwing = 50; // Whole numbers = cents
var minPrice =  startingPrice * 0.1;  //0.50;
var maxPrice = (startingPrice * 2) - 0.01;  //9.99;
var gameIntervalTime = 5000; //In milliseconds
var gameRounds=60;
var startingCash = 100;
var timer;
var user;
//todo fix minswing / maxswing not updating correctly.
$(document).ready(function(){
    init();
});

//////////////////////////
// build
//////////////////////////

function buildFruits(fruitArray){
    for(var i = 0; i < fruitArray.length; i++){
        var newFruit = new Fruit(fruitArray[i], startingPrice);
        fruitArray[i] = newFruit;
        updatePrice(newFruit);
        user["inv" + newFruit.name] = [];
    }
}


function buildDomFruits(fruitArray){
    $("#fruitContainer").empty();
    for(var i = 0; i < fruitArray.length; i++){
        $("#fruitContainer").append("<div class='container col-sm-3 "+fruitArray[i].name.toLowerCase()+"-buy''></div>");
        var $el = $("#fruitContainer").children().last();
        $el.data("fruit", fruitArray[i].name);
        $el.data("price", fruitArray[i].price);
        $el.append("<p>" + fruitArray[i].name + "</p>");
        $el.append("<p class='fruit-price'>" + fruitArray[i].price.toFixed(2) + "</p>");
        $el.append("<p class='fruit-inv'>" + user['inv'+ fruitArray[i].name ].length  + "</p>");
        $el.append("<button class='btn btn-warning fruit-button'>Buy</button>");
        $el.append("<button class='btn btn-warning sell-button'>Sell</button>");
        fruitArray[i].element = $el;
    }
    updateBankDom();
}

function buildGameTypes(typeArray){
    $('#gameType').empty();
    for(var i = 0; i<typeArray.length; i++){
        $("#gameType").append('<button type="button" data-text="'+typeArray[i].name+'" ' +
            'data-dismiss="modal" class="btn btn-primary start">'+typeArray[i].name+'</button>');

    }
}
//////////////////////
// update
/////////////////////

function updateBankDom(){
    console.log('t cash in bank dom',user.totalCash);
    $('.bank').empty();
    var bank = $('.bank');
    bank.text('$' + user.totalCash.toFixed(2));
}

function updateFruitDom(){
    for(var i = 0; i < fruitArray.length; i++){
        var fruit = fruitArray[i];
        fruit.price = parseFloat((Math.round(fruit.price * 100) / 100).toFixed(2));
        fruit.element.find(".fruit-price").text('$' + fruit.price.toFixed(2));
        fruit.element.data("price", fruit.price);
    }
    postGameRound(fruitArray);
}

function updateGameVariables(type){
    var gameType = type;
    if (!gameType){
        gameType = 'Standard';
    }
    $.ajax({
        type: 'GET',
        url: '/salesforce/gameSettings/'+gameType,
        success: function (response) {
            console.log(response);
            if (response.starting_cash__c) {
                startingCash = response.starting_cash__c;
            }
            if (response.fruits__c) {
                fruitArray = response.fruits__c.split(';');
            }
            if(response.game_length__c) {
                gameRounds = response.game_length__c;
            }
            if(response.game_interval__c){
                gameIntervalTime = response.game_interval__c;
            }
            if(response.minswing__c){
                minSwing = response.minswing__c;
            }
            if(response.maxswing__c){
                maxSwing = response.maxswing__c;

            }
            if(response.starting_price__c){
                startingPrice = response.starting_price__c;
            }
            console.log(minSwing);
            console.log(maxSwing);
            console.log(startingPrice);
            minPrice =  startingPrice * 0.1;
            maxPrice = (startingPrice * 2) - 0.01;

            user = new User();
            buildFruits(fruitArray);
            buildDomFruits(fruitArray);
            timer = setInterval(gameInterval, gameIntervalTime);
        }
    });
}

function updateInventory(){
    for(var i = 0; i<fruitArray.length; i++){
        fruitArray[i].element.find(".fruit-inv").text(user['inv'+fruitArray[i].name].length);
    }
}

function updatePrice(fruit){
    var priceSwing = randomNumber(minSwing, maxSwing);
    var randomAdjustment = randomNumber(1,2);
    if(randomAdjustment == 1){
        priceSwing = -priceSwing;
    }
    priceSwing = priceSwing/100;
    fruit.price += priceSwing;
    if(fruit.price > maxPrice){
        fruit.price = maxPrice;
    }
    if(fruit.price < minPrice){
        fruit.price = minPrice;
    }
}

//////////////////////
// constructors
/////////////////////

function Fruit(name, price){
    this.name = name;
    this.price = price;
}

function User(){
    this.totalCash = startingCash;
}

///////////////////////////////
// Game Logic
///////////////////////////////

var init = function(){
    console.log('jquery initalized');
    enable();
    getGameType();
};


function enable(){
    $("#fruitContainer").on("click", ".fruit-button", buyFruit);
    $("#fruitContainer").on("click", ".sell-button", sellFruit);
    $('#gameType').on("click", ".start",startGame);
}

function disable(){
    clearInterval(timer);
    $(".sell-button").prop("disabled",true);
    $(".fruit-button").prop("disabled",true);
    gameOver();
}

function startGame(){
    var type = $(this).data("text");
    getGameId();
    updateGameVariables(type);
}

function gameInterval(){
    gameRounds--;
    if (gameRounds === 0){
        disable();
        console.log('Game Over');
    } else {
        for (var i = 0; i < fruitArray.length; i++) {
            updatePrice(fruitArray[i]);
        }
        updateFruitDom();
    }
}

function getGameId(){
    $.ajax({
        type:'GET',
        url:"salesforce/start",
        success:function(response){
            console.log('game id',response);
        }
    });
}

function buyFruit(){
    var fruit = $(this).parent().data("fruit");
    var price = $(this).parent().data("price");
    var button = $(this);
    if(user.totalCash >= price){
        user.totalCash -= price;
        $(this).prop("disabled",true);
        postFruit(fruit, price, button);
        updateBankDom();
    }
}

function sellFruit(){
    var fruit = $(this).parent().data("fruit");
    var price = $(this).parent().data("price");
    var button = $(this);
   if(user["inv" + fruit].length > 0) {
       var fruitId = user["inv" + fruit].splice(0, 1);
       user.totalCash += price;
       $(this).prop("disabled",true);
       updateFruit(fruitId, price, button);
       updateBankDom();
   }
}

function postFruit(fruit, price, button){
    var fruitObject = {name:fruit,price:price};
    $.ajax({
        type:'POST',
        url:"/salesforce/buyFruit",
        data: fruitObject,
        success: function(response){
            user["inv" + fruit].push(response);
            updateInventory();
            button.prop("disabled", false);
        }
    });

}

function updateFruit(fruitId,price, button){
    var fruitObject = {id:fruitId,price:price};
    $.ajax({
        type:'PUT',
        url:"/salesforce/sellFruit",
        data:fruitObject,
        success:function(response){
            console.log('sell fruit response',response);
            if(button) {
                button.prop("disabled", false);
            }
            updateInventory();
        }
    });
}

function gameOver(){
    console.log('selling all fruit');
    console.log(fruitArray);
    var fruitId = '';
    var price = 0;
    for(var i = 0; i < fruitArray.length; i++){
        for(var l = 0; l < user["inv" + fruitArray[i].name].length; l++){
            fruitId = user['inv' + fruitArray[i].name][l];
            price = fruitArray[i].price;
            user.totalCash += price;
            updateFruit(fruitId, price, null);
        }
    }
    updateBankDom();
    $("#fruitContainer").empty();
}

function postGameRound(fruitArray){
    console.log(fruitArray);
}

//////////////////////
// random numbers!!!
/////////////////////
function randomNumber(min, max){
    return Math.floor(Math.random() * (1 + max - min) + min);
}
/////////////////////////
// get game types
////////////////////////
function getGameType(){
    $.ajax({
        type:"GET",
        url:"/salesforce/gameType",
        success:function(response){
            console.log(response);
            buildGameTypes(response);
        }
    });
}



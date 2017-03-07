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
        newFruit.changePrice();
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
        $el.append("<button class='btn btn-warning fruit-button'>Buy</button>");
        $el.append("<button class='btn btn-warning sell-button'>Sell</button>");
        fruitArray[i].element = $el;
    }
    updateBankDom();
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
  //  updateBankDom();
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
            if(response.minSwing__c){
                minSwing = response.MinSwing__c;
            }
            if(response.maxSwing__c){
                maxSwing = response.maxSwing__c;

            }
            if(response.starting_Price__c){
                startingPrice = response.Starting_Price__c;
            }
            console.log(startingCash);
            console.log(fruitArray);
            console.log(gameRounds);
            console.log(gameIntervalTime);
            console.log(minSwing);
            console.log(maxSwing);
            console.log(startingPrice);

            user = new User();
            buildFruits(fruitArray);
            buildDomFruits(fruitArray);
        }
    });
}

//////////////////////
// constructors
/////////////////////

function Fruit(name, price){
    this.name = name;
    this.price = price;
    this.changePrice = function(){
        var priceSwing = randomNumber(minSwing, maxSwing);
        var randomAdjustment = randomNumber(1,2);
        if(randomAdjustment == 1){
            priceSwing = -priceSwing;
        }
        priceSwing = priceSwing/100;
        this.price += priceSwing;
        if(this.price > maxPrice){
            this.price = maxPrice;
        }
        if(this.price < minPrice){
            this.price = minPrice;
        }
    };
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
};


function enable(){
    $("#fruitContainer").on("click", ".fruit-button", buyFruit);
    $("#fruitContainer").on("click", ".sell-button", sellFruit);
    $('.start').on("click", startGame);
}

function disable(){
    clearInterval(timer);
    $(".sell-button").prop("disabled",true);
    $(".fruit-button").prop("disabled",true);
}

function startGame(){
    var type = $(this).data("text");
    getGameId();
    timer = setInterval(gameInterval, gameIntervalTime);
    updateGameVariables(type);
}

function gameInterval(){
    gameRounds--;
    if (gameRounds === 0){
        disable();
        console.log('Game Over');
    } else {
        for (var i = 0; i < fruitArray.length; i++) {
            fruitArray[i].changePrice();
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
            button.prop("disabled", false);

        }
    });
}

//////////////////////
// random numbers!!!
/////////////////////
function randomNumber(min, max){
    return Math.floor(Math.random() * (1 + max - min) + min);
}



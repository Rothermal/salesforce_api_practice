/**
 * Created by Mark on 1/8/17.
 */
// game constants
var fruitArray = ["Apples", "Oranges", "Bananas", "Pears"];
var startingPrice = 5.00 ; //Whole numbers = dollars
var minSwing = 1; // Whole numbers = cents
var maxSwing = 50; // Whole numbers = cents
var minPrice = 0.50;
var maxPrice = 9.99;
var gameIntervalTime = 5000; //In milliseconds
var gameRounds=60;
var startingCash = 100;
var timer;
var user;


//////////////////////////
// Dom Logic
//////////////////////////
$(document).ready(function(){
    init();
});

var init = function(){
  console.log('jquery initalized');
  enable();
};


function enable(){
    $("#fruitContainer").on("click", ".fruit-button", buyFruit);
    $("#fruitContainer").on("click", ".sell-button", sellFruit);
    $('.start').on("click", startGame);
}

function updateBankDom(){
    $('.bank').empty();
    var bank = $('.bank');
    bank.text('$' + user.totalCash.toFixed(2));
}

function buildDomFruits(fruitArray){
    $("#fruitContainer").empty();
    for(var i = 0; i < fruitArray.length; i++){
        $("#fruitContainer").append("<div class='fruit-button container col-sm-3 "+fruitArray[i].name.toLowerCase()+"-buy''></div>");
        var $el = $("#fruitContainer").children().last();
        $el.data("fruit", fruitArray[i].name);
        $el.data("price", fruitArray[i].price);
        $el.append("<p>" + fruitArray[i].name + "</p>");
        $el.append("<p class='fruit-price'>" + fruitArray[i].price.toFixed(2) + "</p>");
        $el.append("<button class='btn btn-warning sell-button'>Sell</button>");
        fruitArray[i].element = $el;
    }
    updateBankDom();
}


function updateFruitDom(){
    for(var i = 0; i < fruitArray.length; i++){
        var fruit = fruitArray[i];
        fruit.price = parseFloat((Math.round(fruit.price * 100) / 100).toFixed(2));
        fruit.element.find(".fruit-price").text('$' + fruit.price.toFixed(2));

        fruit.element.data("price", fruit.price);
    }
    updateBankDom();
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

function startGame(){
    var type = $(this).data("text");
  //  console.log(type);
    getGameId();
    timer = setInterval(gameInterval, gameIntervalTime);
    updateGameVariables(type);
}

function disable(){
    clearInterval(timer);
}

function gameInterval(){
    gameRounds--;
//    console.log(gameRounds);
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

function updateGameVariables(type){
    var gameType = type;
    if (!gameType){
        gameType = 'Standard';
    }
  //  console.log('attempt to connect to salesforce');
      $.ajax({
              type: 'GET',
              url: '/salesforce/gameSettings/'+gameType,
              success: function (response) {
    //              console.log(response);
                  startingCash = response.starting_cash__c;
                  fruitArray = response.fruits__c.split(';');
                  gameRounds = response.game_length__c;
    //              console.log('fruit array in game settings',fruitArray);
                  user = new User();
                  buildFruits(fruitArray);
                  buildDomFruits(fruitArray);
              }
    });
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
    var fruit = $(this).data("fruit");
    var price = $(this).data("price");

    if(user.totalCash >= price){
    //    user["inv" + fruit].push(price);
        user.totalCash -= price;
    //    console.log(user);
        postFruit(fruit, price);
        updateBankDom();
    }
}

function sellFruit(){
    var fruit = $(this).parent().data("fruit");
    var price = $(this).parent().data("price");
    console.log('fruit and price inside sell', fruit, price);
    console.log( user["inv" + fruit] );
        var fruitId = user["inv" + fruit].pop();

        user.totalCash += price;
        console.log(fruitId);
        updateFruit(fruitId, price);
        updateBankDom();

}

function postFruit(fruit, price){
   var fruitObject = {name:fruit,price:price};
    console.log('fruit, price in post route client side', fruitObject);
    $.ajax({
        type:'POST',
        url:"/salesforce/buyFruit",
        data: fruitObject,
        success: function(response){
            console.log('fruit id',response);
            console.log('fruit type', fruit);
            user["inv" + fruit].push(response);
            console.log('in post fruit, on success, user inventory ',user);
        }
    });

}

function updateFruit(fruitId,price){
    var fruitObject = {id:fruitId,price:price};
    $.ajax({
        type:'PUT',
        url:"/salesforce/sellFruit",
        data:fruitObject,
        success:function(response){
        console.log('sell fruit response',response);
        }
    });
}


function buildFruits(fruitArray){
    for(var i = 0; i < fruitArray.length; i++){
        var newFruit = new Fruit(fruitArray[i], startingPrice);
        fruitArray[i] = newFruit;
        newFruit.changePrice();
        user["inv" + newFruit.name] = [];
    }
    console.log('user in build fruits',user);

}


//////////////////////
// random numbers!!!
/////////////////////
function randomNumber(min, max){
    return Math.floor(Math.random() * (1 + max - min) + min);
}



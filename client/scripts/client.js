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
var gameIntervalTime = 1000; //In milliseconds

var startingCash = 100;

var user;

$(document).ready(function(){
    init();
});

var init = function(){
  console.log('jquery initalized');
// moving update game variables into start game function
    updateGameVariables();

};

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
 //   this.startingCash = startingCash;
    this.totalCash = startingCash;
}

function updateGameVariables(type){
    var gameType = type;
    if (!gameType){
        gameType = 'Standard';
    }
    console.log('attempt to connect to salesforce');
      $.ajax({
              type: 'GET',
              url: '/salesforce/gameSettings/'+gameType,
              success: function (response) {
                  console.log(response);
                  startingCash = response.starting_cash__c;
                  fruitArray = response.fruits__c.split(';');
                  console.log(startingCash);
                  console.log(fruitArray);
                  enable();
                  user = new User();
                  buildFruits(fruitArray);
                  buildDomFruits(fruitArray);
              }
    });
}

function enable(){
    $("#fruitContainer").on("click", ".fruit-button", buyFruit);

}

function disable(){
    clearInterval(gameInterval);
}
function startGame(type){
    var gameType = type;
    setInterval(gameInterval, gameIntervalTime);
    updateGameVariables(gameType);
}

function buyFruit(){
    var fruit = $(this).data("fruit");
    var price = $(this).data("price");

    if(user.totalCash >= price){
        user["inv" + fruit].push(price);
        user.totalCash -= price;
        console.log(user);
        postFruit(fruit, price);
        updateBankDom();
    }
}

function postFruit(fruit, price){
   var fruitObject = {name:fruit,price:price};
    console.log('fruit, price in post route client side', fruitObject);
    $.ajax({
        type:'POST',
        url:"/salesforce/buyFruit",
        data: fruitObject,
        success: function(response){
            console.log(response);
        }
    });

}

function gameInterval(){
    for(var i = 0; i < fruitArray.length; i++){
        fruitArray[i].changePrice();
    }
    updateFruitDom();
}

function buildFruits(array){
    for(var i = 0; i < array.length; i++){
        var newFruit = new Fruit(array[i], startingPrice);
        array[i] = newFruit;
        newFruit.changePrice();

        user["inv" + newFruit.name] = [];
    }
    console.log(user);
}

function buildDomFruits(array){
    $("#fruitContainer").empty();
    for(var i = 0; i < array.length; i++){
        $("#fruitContainer").append("<div class='fruit-button container col-sm-3 "+array[i].name.toLowerCase()+"-buy''></div>");
        var $el = $("#fruitContainer").children().last();
        $el.data("fruit", array[i].name);
        $el.data("price", array[i].price);
        $el.append("<p>" + array[i].name + "</p>");
        $el.append("<p class='fruit-price'>" + array[i].price.toFixed(2) + "</p>");
        array[i].element = $el;
    }
    updateBankDom();
}

function updateBankDom(){
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
    updateBankDom();
}

function randomNumber(min, max){
    return Math.floor(Math.random() * (1 + max - min) + min);
}



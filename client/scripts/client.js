/**
 * Created by Mark on 1/8/17.
 */
// game constants
var STARTING_CASH = 10000;
var TOTAL_CASH = 0;
var GAME_TIME = 365;
var GAMEFRUITS = ['Apple','Pear','Grape','Banana','Orange'];
var fruits = [];
var counter = 0;
var timer;
$(document).ready(function(){
    init();
    enable();
});


var init = function(){
    console.log('jquery initalized');
 //   connecttoSF();
    createFruit();

};

var enable = function(){
  console.log('event listeners enabled');
    $('.start').on('click', beginGame);

    $('.apple-buy').on('click', buy);
    $('.orange-buy').on('click', buy);
    $('.banana-buy').on('click', buy);
    $('.pear-buy').on('click', buy);

    $('.apple-sell').on('click', sell);
    $('.orange-sell').on('click', sell);
    $('.banana-sell').on('click', sell);
    $('.pear-sell').on('click', sell);

};
var connecttoSF = function() {
    console.log('attempt to connect to salesforce');
    $.ajax({
        type: 'GET',
        url: '/salesforce/apple',
        success: function (response) {
            console.log(response);
        }
    });
};
var createFruit = function () {
    for (i = 0; i < fruits.length; i++) {
        fruits.push(new Fruit(GAMEFRUITS[i] + 's', randomInitialPrice(), [], 0, GAMEFRUITS[i].toLowerCase()));
    }
};
 function Fruit  (name, price, averagePrice, inventory, className){
        this.name=name;
        this.price=price;
        this.averagePrice=averagePrice;
        this.inventory=inventory;
        this.className=className;
      //  fruits.push(this);
    }

    function randomInitialPrice () {
        return randomNumber(50, 999);

    }


//    var apple = new Fruit("Apples", randomInitialPrice(), [], 0, "apple");
//    var banana = new Fruit("Bananas", randomInitialPrice(), [], 0, "banana");
//    var orange = new Fruit("Oranges", randomInitialPrice(), [], 0, "orange");
//    var grape = new Fruit("Grapes", randomInitialPrice(), [], 0, "grape");
//    var pear = new Fruit("Pears", randomInitialPrice(), [], 0, "pear");
//    var watermelon = new Fruit("Watermelons", randomInitialPrice(), [], 0, "watermelon");



  var beginGame = function() {
        timer = setInterval(priceUpdate, 15000);
        console.log("begin");
        priceUpdate();

    };



    function randomNumber(min, max){
        return Math.floor(Math.random() * (1 + max - min) + min);
    }

    function buy(){
        console.log(this);
        var myClass = $(this).data('classname');
        console.log(myClass);
        for( i=0; i<fruits.length; i++){
            if(myClass==fruits[i].className && cash>=fruits[i].price){

                cash-=fruits[i].price;
                fruits[i].inventory++;
                $('.'+fruits[i].className+'-inventory').html(fruits[i].inventory);
                $('.bank').html(cash/100);

                fruits[i].averagePrice.push(fruits[i].price);
                $('.'+fruits[i].className+'-expense').html('$'+Math.round(calcAverage(fruits[i].averagePrice) )/100);

            }
        }
    }

    function calcAverage(array){
        var sum=0;
        for(var j=0; j<array.length; j++){
            sum+=parseInt(array[j]);

        }
        return sum/array.length;
    }

    function sell() {
        console.log(this);
        var myClass = $(this).data('classname');
        console.log(myClass);
        for( i=0; i<fruits.length; i++){
            if(myClass==fruits[i].className && fruits[i].inventory > 0){

                cash+=fruits[i].price;
                fruits[i].inventory--;
                $('.'+fruits[i].className+'-inventory').html(fruits[i].inventory);
                $('.bank').html(cash/100);
            }
        }

    }

    function priceUpdate() {
        counter++;


        if (counter == 10) { //change coutner latter

            for(i=0; i<fruits.length;i++){
                if(fruits[i].inventory>0){
                    var fireSale=0;
                    fireSale=fruits[i].inventory*fruits[i].price;
                    fruits[i].inventory=0;
                    $('.'+fruits[i].className+'-inventory').html(fruits[i].inventory);
                    cash+=fireSale;


                }
            }
            $('.bank').html(cash/100);
            alert("Your you earned: $"+(cash-10000)/100);
            clearInterval(timer);
        }


        for(var i=0;i<fruits.length; i++){
            var priceUpdate=0;
             priceUpdate = randomNumber(-50, 50);
            // priceUpdate = priceUpdate;
            fruits[i].price = fruits[i].price + priceUpdate;
            if(fruits[i].price >= 1000){
                fruits[i].price -= 49;
            }
            else if (fruits[i].price < 50) {
                fruits[i].price += 49;
            }
            $('.'+fruits[i].className+'-price').text(fruits[i].price / 100);
        }

    }




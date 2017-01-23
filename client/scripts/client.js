/**
 * Created by Mark on 1/8/17.
 */
// game constants
var STARTING_CASH = 200;
var TOTAL_CASH = 0;
var GAME_TIME = 365;
var fruits = ['Apple','Pear','Grape','Banana','Orange'];

$(document).ready(function(){
    init();
    enable();
});

var init = function(){
    console.log('jquery initalized');
 //   connecttoSF();

};

var enable = function(){
  console.log('event listeners enabled');

};
var connecttoSF = function(){
    console.log('attempt to connect to salesforce');
    $.ajax({
        type:'GET',
        url:'/salesforce/apple',
        success: function(response){
            console.log(response);
        }
    });
};
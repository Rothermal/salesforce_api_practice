var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/',function(request, response){
   response.sendFile(path.join(__dirname,'../public/assets/views/index.html'));
});


module.exports = router;
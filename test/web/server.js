var express = require('express');

var fs = require('fs');
var path = require('path');

var app = express()

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..', '..', 'dist')))

app.listen(8000, function(err){
    if(!err)
        console.log('listening on 8000');
});
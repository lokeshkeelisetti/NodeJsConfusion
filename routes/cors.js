const express = require('express');
const cors = require('cors');
const app = express();

const whiltelist = ['http://localhost:3000','https://localhost:3443'];
var corsOptionDlegate = (req,callback) => {
    var corsOptions;
    if(whiltelist.indexOf(req.header('Origin'))!==-1){
        corsOptions = {origin : true};
    }
    else{
        corsOptions = {origin: false};
    }
    callback(null,corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionDlegate);

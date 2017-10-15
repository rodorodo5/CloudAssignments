'use strict'

var async = require("async");
var AWS = require("aws-sdk");
var http = require("https");
var lambda = new AWS.Lambda({"region": "us-east-1"});
var crypto = require('crypto-js');
var format = require("string_format");
var publicKey = '095d6be999292153ea16d6c5daffdd5c';
var privateKey = '789965208c1e1b63d4910dc3d0721f63cf7014f0';
var ts = new Date().getTime();
var hash = crypto.MD5(ts + privateKey + publicKey).toString();
var seriesUrl = "https://gateway.marvel.com:443/v1/public/characters/{0}/series?limit=100&ts={1}&apikey={2}&hash={3}&offset=[4]"; 

module.exports.get = (event, context, callback) => {
    console.log(event);
    var url = seriesUrl.format(event.charId, ts, publicKey, hash, event.offset);
    getCharacterSeries(url, callback);
}

var getCharacterSeries = function(url, callback) {
    var seriesTotal;
    var errorMessage = "Data not found.";
    http.get(url, (res) => {
        res.setEncoding('utf8');
        var totalData = "";

        res.on("data", (data) => {
            totalData += data;
        });
        res.on("end", (data) => {
            var series = JSON.parse(totalData);
            if (series["data"]) {
                seriesTotal = series["data"]["results"].map(function(event) {
                    return event.title;
                });
                callback(null, seriesTotal);
            }
            else {
                callback(errorMessage, null);
            }
        });
    })
}
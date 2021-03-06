'use strict'

var async = require("async");
var AWS = require("aws-sdk");
var http = require("https");
var lambda = new AWS.Lambda({"region": "us-east-1"});
var crypto = require('crypto-js');
var format = require("string_format");
var privateKey = '789965208c1e1b63d4910dc3d0721f63cf7014f0';
var publicKey = '095d6be999292153ea16d6c5daffdd5c';
var ts = new Date().getTime();
var hash = crypto.MD5(ts + privateKey + publicKey).toString();
var seriesUrl = "https://gateway.marvel.com:443/v1/public/characters/{0}/series?limit=1&ts={1}&apikey={2}&hash={3}"; 
var s3 = new AWS.S3();
var bucket = "rodo-results";
var params, json, id1, id2, key;

module.exports.get = (event, context, callback) => {

    if (event.id1 < event.id2) {
        id1 = event.id1;
        id2 = event.id2;
    }
    else {
        id1 = event.id2;
        id2 = event.id1;
    }
    key = id1 + "_" + id2 + "_Series.json";

    params = {
        Bucket: bucket, 
        Key: key
    };
    s3.getObject(params, function(err, data){
        if(err) {
            //console.log("Object does not exist!");
            var seriesUrl1 = seriesUrl.format(event.id1, ts, publicKey, hash);
            var seriesUrl2 = seriesUrl.format(event.id2, ts, publicKey, hash);
            async.parallel([
                function(callback) {
                    async.waterfall([
                        async.apply(getSeries, seriesUrl1),
                        async.apply(invokeLambdas, event.id1)
                    ], callback)
                },
                function(callback) {
                    async.waterfall([
                        async.apply(getSeries, seriesUrl2),
                        async.apply(invokeLambdas, event.id2)
                    ], callback)
                }],
                function(err, results) {
                    json = JSON.stringify(results);
                    callback(null, results);
                    params = {
                        Body: json, 
                        Bucket: bucket, 
                        Key: key
                    };
                    s3.putObject(params, function(err, data) {
                        if (err) console.log(err, err.stack); 
                        else     console.log("Successfully put object in " + params.Bucket);           
                    });
                }
            );
        }
        else {
            json = JSON.parse(data.Body.toString());
            callback(null, json);
        }
    });
}

var getSeries = function(url, callback) {
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
                seriesTotal = series["data"]["total"];
                callback(null, seriesTotal);
            }
            else {
                callback(errorMessage, null);
            }
        });
    })
}

var invokeLambdas = function(charId, seriesCount, callback) {
    var lambdaCount = Math.ceil(seriesCount / 100);
    var tasks = [];

    for (let i = 0; i < lambdaCount; i++) {
        var offset = i*100;
        tasks.push(function(callback) {
            var payload = {
                charId: charId,
                offset: offset
            };
            var lambdaParams = {
                FunctionName : 'rodo-new-dev-SerieSingle',
                InvocationType : 'RequestResponse',
                Payload: JSON.stringify(payload)
            };
            lambda.invoke(lambdaParams, function(error, data) {
                if (error) {
                    callback(error);
                }
                else {
                    callback(null, data);
                }
            });
        });
    }
    async.parallel(tasks,function(error, data) {
        if (error) {
            console.log(error);
        }
        else {
            var series = [];
            for (let i = 0; i < data.length; i++) {
                series = series.concat(JSON.parse(data[i].Payload));
            }
            callback(null, series);
        }
    });
}



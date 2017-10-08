'use strict'
var crypto = require('crypto-js'),
    http = require('http'),
    async = require('async'),
    format = require('string_format'),
    AWS = require('aws-sdk'),
    lambda = new AWS.Lambda('"region":"us-east-1"'),
    puKey = '095d6be999292153ea16d6c5daffdd5c',
    prKey = '789965208c1e1b63d4910dc3d0721f63cf7014f0',
    ts = new Date().getTime(),
    hash = crypto.MD5(ts + prKey + puKey).toString(),
    templateurl = 'http://gateway.marvel.com/v1/public/characters/{0}/comics?limit=1&ts={1}&apikey={2}&hash={3}';

module.exports.get = (event, context, callback) => {
    var firstId = event.firstCharacterId,
        secondId = event.secondCharacterId,
        firsturl = templateurl.format(firstId, ts, puKey, hash),
        secondurl = templateurl.format(secondId, ts, puKey, hash);

    async.parallel([
        function (callback) {
            async.waterfall([
                    async.apply(getCharacterComicsSimple, firsturl, firstId),
                    invokeLambdas
                ], callback)
        },
                function (callback) {
            async.waterfall([
                    async.apply(getCharacterComicsSimple, secondurl, secondId),
                    invokeLambdas
            ], callback)
        }], callback);
};

var getCharacterComicsSimple = function (getUrl, characterId, callback) {
    var comicTotal;
    var errorMessage = "Data not found";
    http.get(getUrl, (res) => {
        res.setEncoding('utf8');
        var totalData = "";

        res.on("data", (data) => {
            totalData += data;
        });

        res.on("end", (data) => {
            var comics = JSON.parse(totalData);
            if (comics["data"]) {
                comicTotal = comics["data"]["total"];
            };
            callback(null, characterId, comicTotal);
        })
    })
};

var invokeLambdas = function (characterId, comicCount, callback) {
    var lambdaCount = Math.ceil(comicCount / 100);
    var tasks = [];
    var lambdaParams = [];
    for (let i = 0; i < lambdaCount; i++) {
        tasks.push(function (callback) {
            var offset = i * 100;
            lambdaParams = {
                FunctionName: 'rodo-service-marvel-dev-SerieManager',
                InvocationType: 'RequestResponse',
                Payload: '{"characterId":' + characterId + ',"offset":' + offset + '}'
            };
            lambda.invoke(lambdaParams, function (error, data) {
                if (error) {
                    callback(error);
                } else {
                    callback(null, data);
                }
            })
        });
    }
    async.parallel(tasks, function (error, data) {
        var comics = [];
        for (let index = 0; index < data.length; index++) {
            comics.push(JSON.parse(data[index].Payload));
        };
        var comicTotal = {
            characterId,
            comicCount,
            comics
        }
        callback(null, comicTotal);
    });
};

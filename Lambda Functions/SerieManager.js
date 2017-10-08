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
    templateurl = 'http://gateway.marvel.com/v1/public/characters/{0}/series?limit=1&ts={1}&apikey={2}&hash={3}';

module.exports.get = (event, context, callback) => {
    var firstId = event.firstCharacterId,
        secondId = event.secondCharacterId,
        firsturl = templateurl.format(firstId, ts, puKey, hash),
        secondurl = templateurl.format(secondId, ts, puKey, hash);

    async.parallel([
        function (callback) {
            async.waterfall([
                    async.apply(getCharacterSeriesSimple, firsturl, firstId),
                    invokeLambdas
                ], callback)
        },
                function (callback) {
            async.waterfall([
                    async.apply(getCharacterSeriesSimple, secondurl, secondId),
                    invokeLambdas
            ], callback)
        }], callback);
};

var getCharacterSeriesSimple = function (getUrl, characterId, callback) {
    var serieTotal;
    var errorMessage = "Data not found";
    http.get(getUrl, (res) => {
        res.setEncoding('utf8');
        var totalData = "";

        res.on("data", (data) => {
            totalData += data;
        });

        res.on("end", (data) => {
            var series = JSON.parse(totalData);
            if (series["data"]) {
                serieTotal = series["data"]["total"];
            };
            callback(null, characterId, serieTotal);
        })
    })
};

var invokeLambdas = function (characterId, seriesCount, callback) {
    var lambdaCount = Math.ceil(seriesCount / 100);
    var tasks = [];
    var lambdaParams = [];
    for (let i = 0; i < lambdaCount; i++) {
        tasks.push(function (callback) {
            var offset = i * 100;
            lambdaParams = {
                FunctionName: 'rodo-service-marvel-dev-SerieSingle',
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
        var series = {
            characterId,
            seriesCount
        };
        for (let index = 0; index < data.length; index++) {
            series["series" + index] = JSON.parse(data[index].Payload);
        };
        callback(null, series);
    });
};

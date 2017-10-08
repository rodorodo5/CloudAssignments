'use strict'

var crypto = require('crypto-js'),
    http = require('http'),
    format = require('string_format'),
    async = require("async"),
    AWS = require('aws-sdk'),
    lambda = new AWS.Lambda('"region":"us-east-1"'),
    puKey = '095d6be999292153ea16d6c5daffdd5c',
    prKey = '789965208c1e1b63d4910dc3d0721f63cf7014f0',
    ts = new Date().getTime(),
    hash = crypto.MD5(ts + prKey + puKey).toString(),
    templateurl = 'http://gateway.marvel.com/v1/public/characters/{0}/comics?limit=100&ts={1}&apikey={2}&hash={3}&offset={4}';

module.exports.get = (event, context, callback) => {
    var charId = event.characterId,
        offset = event.offset,
        url = templateurl.format(charId, ts, puKey, hash, offset),
        comicsNames = [],
        tasks = [];
    tasks.push(function (callback) {
        http.get(url, (res) => {
            res.setEncoding('utf8');
            var totalData = "";

            res.on("data", (data) => {
                totalData += data;
            });

            res.on("end", (data) => {
                var comics = JSON.parse(totalData);
                var results = comics.data.results;
                var title;
                for (let j = 0; j < 100; j++) {
                    try {
                        title = results[j].title;
                        comicsNames = comicsNames.concat(title);
                    } catch (err) {
                        j = 100;
                    }
                }
                callback(null, comicsNames);
            })
        })
    })
    async.parallel(tasks, function (error, data) {
        if (error) {
            callback(error, null);
        } else {
            callback(null, comicsNames);
        }
    });
}

var AWS = require('aws-sdk');
var s3 = new AWS.S3();

var bucket = 'rodobucket' 

var params = { 
 Bucket: bucket,
 Delimiter: '/',
}


module.exports.get = function(event, context,callback) {

		s3.listObjectVersions(params).promise().then(data => {
        Object.keys(data.Versions).forEach(function eachKey(key) {
            console.log("File: " + data.Versions[key].Key);
            console.log("  Version: " + data.Versions[key].VersionId);
            console.log("  LastModified: " + data.Versions[key].LastModified);
            console.log("  isLatest: " + data.Versions[key].IsLatest);
            
        });
    })

}


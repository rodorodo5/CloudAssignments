var http = require("http");
var async = require("async");
var AWS =  require("aws-sdk");
var fort = require("string_format");
var lambda = AWS.Lambda({"region":"us-east-1"});



module.exports.get = (event, context, callback) => {
  var apiKey = "q6fdhFlGcqniiM2WaOP5DFaFs2hvtadD";
  var url = "http://app.ticketmaster.com/discovery/v2/events.json?city={0}&apikey={1}";
  var tmEvents = {};
  var tasks = [];

  // for (let index = 0; index < event.cities.length; index++) {
  //   tasks.push(function(callback) {
  //     http.get(url.format(event.cities[index], apiKey), (res) => {
  //       res.setEncoding('utf8');
  //       var totalData = "";

  //       res.on("data", (data) => {
  //         totalData += data;
  //       });

  //       res.on("end", (data) => {
  //         var ticketmasterEvents = JSON.parse(totalData);
  //         var tmEventsPerCity = {};
  //         tmEventsPerCity[event.cities[index]] = ticketmasterEvents["_embedded"]["events"].map(
  //           function(evt) {
  //             return evt.name;
  //           }
  //         );
  //         callback(null, tmEventsPerCity);
  //       });
  //     }) //http get
  //   }); //Se cierra el push
  // } // se cierra el for






for (let index = 0; index < event.cities.length; index++) {
    tasks.push(function(callback) {
      var lambdaParams = {
          FucntionName : "tm-individual",
          InovcationType : "RequestResponse",
          Payload: '{"city: "'+ event.cities[index] +'}'  
      }//obj LambdaParams
      lambda.invoke(lambdaParams ,function(error,data){
        if (error) {
          console.log(error);
          callback(error);
        }
        else {
          callback(null,data);
        }

      });

    }); //Se cierra el push
  } // se cierra el for










  async.parallel(tasks, function(error, data) {
    if (error) {
      console.log(error);
      callback(error);
    } else {
      callback(null, data);
    }
  });




} //Se cierra el modulo

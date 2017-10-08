var http = require('http');
module.exports.get = (event, context, callback) => {
event.parse(event);
var url = 'http://samples.openweathermap.org/data/2.5/weather?q='+ event.city +'&appid=b1b15e88fa797225412429c1c50c122a1';  

http.get(url, (res) =>{
	res.setEncoding('utf8');

	res.on("data", (data)=>{
		var weather  = JSON.parse(data);
		console.log("temp in " +event.city+ " is: " + (weather.main.temp - 273.15));
		});
	});
};



// {"coord":{"lon":-0.13,"lat":51.51},"weather":[{"id":300,"main":"Drizzle","description":"light intensity drizzle","icon":"09d"}],"base":"stations","main":{"temp":280.32,"pressure":1012,"humidity":81,"temp_min":279.15,"temp_max":281.15},"visibility":10000,"wind":{"speed":4.1,"deg":80},"clouds":{"all":90},"dt":1485789600,"sys":{"type":1,"id":5091,"message":0.0103,"country":"GB","sunrise":1485762037,"sunset":1485794875},"id":2643743,"name":"London","cod":200}


// sls  invoke local -f tm
var app = angular.module("app", ['ngRoute']);



app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/panel', {
            templateUrl: 'views/panel.html',
            controller: 'HomeCont'
        })
        .when('/a1', {
            templateUrl: 'views/a1.html',
            controller: 'HomeCont'
        })
        .when('/a2', {
            templateUrl: 'views/a2.html',
            controller: 'HomeCont'
        })
        .when('/a3', {
            templateUrl: 'views/a3.html',
            controller: 'HomeCont'
        })
        .when('/marvel', {
            templateUrl: 'views/marvel.html',
            controller: 'HomeCont'
        })
        .when('/chart', {
            templateUrl: 'views/chart.html',
            controller: 'HomeCont'
        })
        .otherwise({
            redirectTo: "/panel"
        })

}]);

app.controller('HomeCont', ['$scope', '$location', function($scope, $location) {

    $scope.changeView = function(view) {
        $location.path(view);
    }

    $scope.goPanel = function() {
        $location.path('panel');
    }

var characters = {},
            comicsurl = 'https://g4ieh9s5gj.execute-api.us-east-1.amazonaws.com/dev/getcomics',
            seriesurl = 'https://g4ieh9s5gj.execute-api.us-east-1.amazonaws.com/dev/getseries',
            hash = "446be722b9109755972fdbc2b3ef7347",
            key1, key2,
            commonComics = {},
            commonSeries = {},
            index, offset,
            publickey = "095d6be999292153ea16d6c5daffdd5c",
            privatekey = "789965208c1e1b63d4910dc3d0721f63cf7014f0",
            superList = {};



        for (index = 0; index < 15; index++) {
            offset = (index * 100);
            var marvelUrl1 = "https://gateway.marvel.com:443/v1/public/characters?ts=1&apikey=" + publickey + "&hash=" + hash + "&limit=100&offset=" + offset;
            fetch(marvelUrl1, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            }).then(function (response) {
                if (response.ok) {
                    response.json().then(function (defs) {
                        var info = defs.data.results;
                        Object.keys(info).forEach(function eachKey(key) {
                            var name = info[key].name,
                                id = info[key].id;
                            characters[name] = id;
                            $("#chracterList1").append("<option value='" + name + "'>" + name + "</option>");
                            $("#chracterList2").append("<option value='" + name + "'>" + name + "</option>");
                        });
                    });
                }
            });
        };

        function getComics(id1, id2) {
            fetch(comicsurl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json'
                },
                body: '{\n\t"description":"Sending IDs",\n\t"IDs":[' + id1 + ',' + id2 + ']\n}'
            }).then(function (response) {
                if (response.ok) {
                    response.json().then(function (comics) {
                        $scope.commonComics = comics; // work with this
                        commonComics = comics;
                    });
                };
            });

        };

        function getSeries(id1, id2) {
            fetch(seriesurl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json'
                },
                body: '{\n\t"description":"Sending IDs",\n\t"IDs":[' + id1 + ',' + id2 + ']\n}'
            }).then(function (response) {
                if (response.ok) {
                    response.json().then(function (series) {
                        $scope.commonSeries = series; 
                        commonSeries = series;
                    });
                };
            });

        };

        function poblar() {
            for (var ite = 0; ite < commonComics.length; ite++) {
                var obj = commonComics[ite];
                $("#res1").append("<li>" + obj + "</li>");
            }
            for (var ite = 0; ite < commonSeries.length; ite++) {
                var obj = commonSeries[ite];
                $("#res2").append("<li>" + obj + "</li>");
            }
        };

        function inter(selected1, selected2) {
            $("#res1").remove();
            $("#res2").remove();
            $("#res").append("<ul id='res1' class='selector'><p><b>•In the same comic:</b></p></ul>");
            $("#res").append("<ul id='res2'  class='selector'><p><b>•In the same series:</b></p></ul>");
            key1 = characters[selected1];
            key2 = characters[selected2];
            getComics(key1, key2);
            getSeries(key1, key2);
            setTimeout(function () {
                $("#loading").remove();
                $("#time").remove();
                poblar();
                var date2 = Date.now()
                var totaldate = date2 - date2;
                $("#time").append(totaldate);
            }, 8000);
        };

        $("#getiComics").click(function () {
            var selected1 = $('#chracterList1').find(":selected").text();
            var selected2 = $('#chracterList2').find(":selected").text();
            if (selected2 != selected1) {
                var date1 = Date.now();
                inter(selected1, selected2);
            } else {
                alert("You selected the same, try different");
            }
        });

    



}]); //esteno
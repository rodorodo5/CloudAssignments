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
        .when('/a6', {
            templateUrl: 'views/a6.html',
            controller: 'HomeCont'
        })
        .when('/a7', {
            templateUrl: 'views/a7.html',
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

app.controller('HomeCont', ['$scope', '$location','$http', function($scope, $location,$http) {

    $scope.changeView = function(view) {
        $location.path(view);
    }

    $scope.goPanel = function() {
        $location.path('panel');
    }

    
    var comicsurl = 'https://l3gmoaddyd.execute-api.us-east-1.amazonaws.com/prod/rodo/getcomics';
    var seriesurl = 'https://l3gmoaddyd.execute-api.us-east-1.amazonaws.com/prod/rodo/getseries';
    $scope.names = [];
    var limit = 100;
    var offset = 0;
    var characters = new Map();
    var timeStamp = 1;
    var privateKey = '789965208c1e1b63d4910dc3d0721f63cf7014f0';
    var publicKey = '095d6be999292153ea16d6c5daffdd5c';
    var hash = '446be722b9109755972fdbc2b3ef7347';
    var exit = false;
    while (offset <= limit * 14) {
         var url = "https://gateway.marvel.com:443/v1/public/characters?ts=" + timeStamp + "&apikey=" + publicKey + "&hash=" + hash + "&limit=" + limit + "&offset=" + offset;
         $http.get(url)
             .then(function (response) {
                 var info = response.data;
                 var results = info.data.results;
                 for (var i = 0; i < results.length; i++) {
                     $scope.names.push(results[i].name);
                     characters.set(results[i].name, results[i].id);
                 }
             })
             .catch(function (data) {
                 console.log('An error has occurred. ' + data);
                 exit = true
             });
         if (exit) { break; }
         offset += 100;
    }

    $scope.execute = function () {
        $scope.ComicTime ='Loading comics';
        $scope.SerieTime ='Loading series';
        $scope.comics = [];
        $scope.series = [];
        console.log('aqui si');
        if ($scope.selectedName != null && $scope.selectedName2 != null) {
            var id1 = characters.get($scope.selectedName);
            var id2 = characters.get($scope.selectedName2);
            console.log('id1: ' + id1);
            console.log('id2: ' + id2);
             console.log('aqui si if');

      


            var reqComics = {
                method: 'PUT',
                url: 'https://l3gmoaddyd.execute-api.us-east-1.amazonaws.com/prod/rodo/getcomics',
                data: { "id1": id1, "id2": id2 }
            }

            var startComics = new Date();
            $http(reqComics)
                .then(function (response) {
                     console.log(response);
                    var info = response.data;
                    console.log(info);
                    var endComics = new Date();
                    var seconds = (endComics.getTime() - startComics.getTime()) / 1000;
                    console.log(info[0] +" estos sons los comis");
                    $scope.comics = getCommon(info[0], info[1]);
                    console.log($scope.comics + 'AQUIIUUIIUIUIUIU comics')
                        $scope.ComicTime = 'Comics(' + seconds + ' s)';
                
                })
                .catch(function (data) {
                    console.log('An error has occurred. ' + data);
                });

            var reqSeries = {
                method: 'PUT',
                url: 'https://l3gmoaddyd.execute-api.us-east-1.amazonaws.com/prod/rodo/getseries',
                data: { "id1": id1, "id2": id2 }
            }

            var startSeries = new Date();
            $http(reqSeries)
                .then(function (response) {
                    var info = response.data;
                    var endSeries = new Date();
                    var seconds = (endSeries.getTime() - startSeries.getTime()) / 1000;
                    $scope.series = getCommon(info[0], info[1]);
                    console.log($scope.series + 'AQUIIUUIIUIUIUIU series')
                        $scope.SerieTime = 'Series (' + seconds + ' s)';
                   
                })
                .catch(function (data) {
                    console.log('An error has occurred. ' + data);
                });

        }
    };

      var getCommon = function (object1, object2) {
          var set = new Set();
          for (var i = 0; i < object2.length; i++) {
              if (object1.includes(object2[i])) {
                  set.add(object2[i]);
              }
          }
           console.log(set +'esto es set bleh')
          return Array.from(set);
          console.log(set +'esto es set bleh')
      };
       



}]); //esteno
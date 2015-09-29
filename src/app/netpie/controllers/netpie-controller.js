'use strict';
/**
 * @ngdoc function
 * @name gulpAngularMqttWs.controller:netpieCtrl
 * @description
 * # netpieCtrl
 * Controller of the gulpAngularMqttWs
 */
angular.module('gulpAngularMqttWs')
  .controller('netpieCtrl', function ($mdUtil, $mdSidenav, $scope, $http, $localStorage, $mdToast) {

    var buildToggler = function buildToggler(navID) {
      var debounceFn = $mdUtil.debounce(function () {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            console.log("toggle " + navID + " is done");
          });
      }, 200);
      return debounceFn;
    }

    $scope.toggleRight = buildToggler('right');
    // $localStorage.clear()
    $scope.storage = $localStorage.$default({
      netpie: {
        appKey: '2syAvlZPSExXY3M',
        appSecret: 'p5OMOHvdvFaTYSoAx1pvEUZNtD2EW6',
        appId: "HelloChiangMaiMakerClub"
      },
      netpieApp: []
    });

    $scope.config = {
      // netpie: $scope.storage.netpie
      netpie: {
        appKey: '2syAvlZPSExXY3M',
        appSecret: 'p5OMOHvdvFaTYSoAx1pvEUZNtD2EW6',
        appId: "HelloChiangMaiMakerClub"
      }
    };

    console.log($scope.config);

    $scope.setGear = function (gear) {
      
      $scope.config.netpie = gear;

    }

    $scope.getMqttPass = function (newApp) {
      console.log("GETTING MQTT AUTH");
      var str = "http://netpie-api.herokuapp.com/api/"
      str += newApp.appKey + "/";
      str += newApp.appSecret + "/";
      str += newApp.appId;
      str += "?callback=JSON_CALLBACK";
      console.log(str);

      $http.jsonp(str)
        .success(function (data) {
          console.log(data);
          $scope.data = data;
          $scope.loading = false;
          $scope.appSuccess = "Success";

          var isNewApp = true;

          angular.forEach($scope.storage.netpieApp, function(app, key) {
            
            if (app.appId == newApp.appId && 
                app.appSecret == newApp.appSecret && 
                app.appKey == newApp.appKey
                ) 
            {

              var updateApp = {};
              updateApp.appId = app.appId;
              updateApp.appKey = app.appKey;
              updateApp.appSecret = app.appSecret;

              var microgear = angular.extend(updateApp, data);
              $scope.storage.netpieApp[key].microgears.push(microgear);

              isNewApp = false;
              console.log(microgear);
            }

          });

          if (isNewApp) {

            var microgear = angular.extend({}, newApp, data);
            newApp.microgears = [];
            newApp.microgears.push(microgear);

            $scope.storage.netpieApp.push(newApp);

          }

        })
        .error(function () {
          console.log("FAILED", arguments);
          $scope.loading = false;
          $scope.appError = "Failed: " + arguments[1] + " " + arguments[0];
        });
    }

  });

'use strict';
/**
 * @ngdoc function
 * @name gulpAngularMqttWs.controller:netpieCtrl
 * @description
 * # netpieCtrl
 * Controller of the gulpAngularMqttWs
 */
angular.module('gulpAngularMqttWs')
  .controller('netpieCtrl', function ($mdUtil, $mdSidenav, $scope, $http, $localStorage) {

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
      }
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

    $scope.getMqttPass = function () {
      console.log("GETTING MQTT AUTH");
      var str = "http://netpie-api.herokuapp.com/api/"
      str += $scope.storage.netpie.appKey + "/";
      str += $scope.storage.netpie.appSecret + "/";
      str += $scope.storage.netpie.appId;
      str += "?callback=JSON_CALLBACK";
      console.log(str);

      $http.jsonp(str)
        .success(function (data) {
          console.log(data);
          $scope.data = data;
        })
        .error(function () {
          console.log("FAILED", arguments);

        });
    }


  });

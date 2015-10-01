(function () {
  'use strict';
  var pre_options = {};
  angular
    .module('gulpAngularMqttWs')
    .factory("myMqtt", function (mqttwsProvider) {
      var MQTT = mqttwsProvider(pre_options);
      return MQTT;
    })
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $timeout, myMqtt, $localStorage,
    $sessionStorage, $mdSidenav, $mdUtil, $mdDialog) {
    var vm = this;
    vm.devices = {};
    vm.LWT = {};

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

    // load config
    $scope.storage = $localStorage.$default({
      config: {
        // host: 'gearbroker.netpie.io',
        // port: 8083,
        // username: "BZXrhDBMKutYd68%1443014670",
        // password: "i4jmEZaflGYzXxxi2g5byEM5VA4=",
        // clientId: "eqSZOmyJ2oXN4CJs"
      }
    });

    $scope.closeNav = function () {
      $mdSidenav('right').close()
        .then(function () {
          $scope.config = angular.extend({}, $scope.storage.config);
        });
    };

    $scope.closeAndSaveNewConfig = function (newConfig) {

      $mdSidenav('right').close()
        .then(function () {
          $scope.storage.config = newConfig;
          $scope.connect();
        });
    };

    $scope.config = angular.extend({}, $scope.storage.config);

    $scope.onlineStatus = "ALL";
    $scope.filterDevice = {};
    $scope.filterDevice.name = "";

    var addListener = function () {
      var onMsg = function (topic, payload) {
        // console.log("topic", topic, payload);
        var _payload = JSON.parse(payload);
        var _id2 = _payload.info && _payload.info.id;
        var _id = _payload.d && _payload.d.id;


        // var _id = _id + Math.random();
        _payload.status = vm.LWT[_id || _id2] || "ONLINE" || "UNKNOWN";
        _payload.online = _payload.status !== "DEAD";

        vm.devices[_id || _id2] = _payload;
        delete vm.devices.undefined;
        $scope.$apply();
      };
      myMqtt.on("message", onMsg);
      // mqttXYZ.on("message", onMsg);
      // mqttLWT.on("message", function (topic, payload) {
      //   var topics = topic.split("/");
      //   var values = payload.split("|");
      //   var status = values[0];
      //   var id = values[1];
      //   var mac = topics[1];

      //   if (mac && mac === status) {
      //     status = "online";
      //   }

      //   vm.LWT[mac || id] = status;
      //   // vm.devices[mac || id] .status = status;
      //   if (vm.devices[mac || id]) {
      //     vm.devices[mac || id].status = status;
      //     console.log(vm);
      //     $scope.$apply();
      //   }
      // });
    }

    $scope.showDetail = function (ev, deviceUUIDuuid) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'app/main/partials/detail.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          deviceUUID: deviceUUIDuuid,
          devices: $scope.allDevices
        },
      })
        .then(function () {
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
    };

    var isFirstLogin = function () {

      if ($scope.config.host != null && $scope.config.host != "") {
        return false;
      }
      else {
        return true;
      }

    }

    $scope.showFirstPopup = function (ev) {

      if (!isFirstLogin()) {
        return;
      }

      $mdDialog.show({
        controller: FirstPopupDialogController,
        templateUrl: 'app/main/partials/firstPopup.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
      })
      .then(function (newConfig) {

        $scope.config = newConfig;
        $scope.storage.config = newConfig;
        $mdSidenav('right').open();

      }, function () {
        $scope.connect();
      });

    };

    var remmoveDevices = function () {
      vm.devices = {};
    }

    $scope.allDevices = function () {
      return vm.devices;
    }

    //asynchronously
    $scope.connect = function () {

      addListener();
      vm.devices = {};

      // mqttLWT.connect($scope.config).then(mqttLWT.subscribe("/HelloChiangMaiMakerClub/gearname/#/status"));
      // myMqtt.connect($scope.config).then(myMqtt.subscribe("/HelloChiangMaiMakerClub/gearname/#"));
      // myMqtt.connect($scope.config).then(myMqtt.subscribe("esp8266/+/status"));
      // mqttXYZ.connect($scope.config).then(mqttXYZ.subscribe("esp8266/+/status"));
      // $scope.config = {
      //   // host: 'cmmc.xyz',
      //   // port: 9001,
      //   // clientId
      //   host: 'gearbroker.netpie.io',
      //   port: 8083,
      //   // username: "2syAvlZPSExXY3M%1443015923",
      //   // password: "Ymyig6VXVNpcXoUrEc+Jl0mpzks=",
      //   // clientId: "pX1LPwvk6iETiP2Y"
      // };

      angular.forEach($scope.config, function (value, key) {
        if ($scope.config[key] == "") {
          delete $scope.config[key];
        }
      })

      myMqtt.create($scope.config)
        .then(myMqtt.connect())
        .then(myMqtt.subscribe("/HelloChiangMaiMakerClub/gearname/#"))
      // .then(myMqtt.subscribe("/HelloChiangMaiMakerClub/#"))
      // .then(myMqtt.subscribe("esp8266/+/status"))
        .then(function () { console.log("ALL DONE"); });
    }

    $scope.disconnect = function () {
      // mqttLWT.end(remmoveDevices);
      // myMqtt.end(remmoveDevices);
      // mqttXYZ.end(remmoveDevices);
    }

    function DialogController($scope, $mdDialog, deviceUUID, devices) {
      $scope.devices = devices;
      $scope.deviceUUID = deviceUUID;

      $scope.hide = function (config) {
        $mdDialog.hide(config);
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };

    }

    function FirstPopupDialogController($scope, $mdDialog) {

      $scope.config = {
        host: 'gearbroker.netpie.io',
        port: 8083,
      };

      $scope.save = function (newConfig) {
        $mdDialog.hide(newConfig);
      };
    }

    if (!isFirstLogin()) {
      $scope.connect();
    }

  }
})();
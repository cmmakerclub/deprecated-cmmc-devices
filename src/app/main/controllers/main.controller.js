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
    $sessionStorage, $mdSidenav, $mdUtil, $mdDialog, $log) {
    var vm = this;
    vm.devices = {};
    vm.LWT = {};

    var buildToggler = function buildToggler(navID) {

      var debounceFn = $mdUtil.debounce(function () {

        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
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
          $scope.operations.disconnect();
          $scope.connect();
        });
    };

    $scope.config = angular.extend({}, $scope.storage.config);

    $scope.onlineStatus = "ALL";
    $scope.filterDevice = {};
    $scope.filterDevice.name = "";

    var addListener = function () {
      var onMsg = function (topic, payload) {
        // $log.info("topic", topic, payload);
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
      //     $log.info(vm);
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
          $log.info('You cancelled the dialog.');
          // $scope.message = 'You cancelled the dialog.';
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
      $scope.status = "CONNECTING";

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


      var genFailFn = function(type) {
        var failFn = function(error) { 
          $scope.failed = true;
          $log.error(type + " FAILED", error) 
          $scope.status = type + " FAILED = " + error.errorMessage;
        };
        return failFn;
      }


      var callbacks = {
        "SUBSCRIPTION":  { failFn: genFailFn("SUBSCRIPTION") },
        "CONNECTION":  { failFn: genFailFn("CONNECTION") },
      }

      var utils = {
        "disconnectGen": function(client) { 
          var mqttClient = client; 
          var retFn = function() { 
            $log.info("disconnection called")
            mqttClient.disconnect();
          };
          return retFn;
        }
      };

      $scope.operations = {
        "subscribe": myMqtt.subscribe("/HelloChiangMaiMakerClub/gearname/#"),
        "connect":  myMqtt.connect(),
        "config": $scope.config,
        "disconnect": angular.noop,
      };

      myMqtt.create($scope.operations.config)
        .then($scope.operations.connect, callbacks.CONNECTION.failFn)
        .then($scope.operations.subscribe, callbacks.SUBSCRIPTION.failFn)
        .then(function (mqttClient) { 
          if (angular.isUndefined(mqttClient)) {
              $log.debug("CONTROLLER", "UNKNOWN FAILED");
              $scope.status = "UNKNOWN FAILED";
          }
          else {
            $scope.status = "READY";
            $scope.operations.disconnect = utils.disconnectGen(mqttClient);
          }
        });
    }

    $scope.disconnect = function () {
      // mqttLWT.end(remmoveDevices);
      // myMqtt.end(remmoveDevices);
      // mqttXYZ.end(remmoveDevices);
      $scope.operations.disconnect();
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
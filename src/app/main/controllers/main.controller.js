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
    };

    $scope.toggleRight = buildToggler('right');

    // load config
    $scope.storage = $localStorage.$default({
      config: {
        host: 'mqtt.espert.io',
        port: 8000,
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
        $log.debug(payload);
        try {
          var topics = topic.split("/");
          // $log.debug(topics)
          var max_depth = topics.length - 1;

          var incomming_topic = topics[max_depth];

          if (incomming_topic == "online") {
            $log.debug("online", topics);
            var values = payload.split("|");

            var status = values[0];
            var id = values[1];
            var mac = values[1];
            $log.debug('id', id, "mac", mac, "status", status, new Date());

            if (mac && mac === status) {
              status = "online";
            }

            vm.LWT[mac || id] = status;
            // vm.devices[mac || id] .status = status;
            if (vm.devices[mac || id]) {
              vm.devices[mac || id].status = status;
              $log.debug(vm);
              $scope.$apply();
            }
          }
          else {
            try {
              var _payload = JSON.parse(payload);
              var _id2 = _payload.info && _payload.info.id;
              var _id = _payload.d && _payload.d.id;
              _payload.status = vm.LWT[_id || _id2] || "ONLINE" || "UNKNOWN";
              _payload.online = _payload.status !== "DEAD";
              vm.devices[_id || _id2] = _payload;
              delete vm.devices.undefined;
              $scope.$apply();
            }
            catch (exception) {
              $log.debug("Exception: ");
              $log.debug("=====", payload);
            }
          }
        }
        catch (ex) {
          $log.debug("EXCEPTION!!!", ex);
          $log.debug("EXCEPTION!!!", ex);
          $log.debug("EXCEPTION!!!", ex);
        }
      };

      myMqtt.on("message", onMsg);
    };

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
        }
      })
        .then(function () {
        }, function () {
          $log.info('You cancelled the dialog.');
          // $scope.message = 'You cancelled the dialog.';
        });
    };

    var isFirstLogin = function () {
      // var firstLogin =
      //   (!$scope.config.host != null && $scope.config.host != "") == false;
      return false;
    };

    $scope.showFirstPopup = function (ev) {
      if (!isFirstLogin()) {
        return;
      }

      $mdDialog.show({
        controller: FirstPopupDialogController,
        templateUrl: 'app/main/partials/firstPopup.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false
      })
        .then(function (newConfig) {
          $scope.config = newConfig;
          $scope.storage.config = newConfig;
          $mdSidenav('right').open();
        }, function () {
          $log.debug("CALLING CONNECT..");
          $scope.connect();
        });

    };

    var remmoveDevices = function () {
      vm.devices = {};
    };

    $scope.allDevices = function () {
      return vm.devices;
    };

    //asynchronously
    $scope.connect = function () {
      $scope.status = "CONNECTING";

      addListener();
      vm.devices = {};
      angular.forEach($scope.config, function (value, key) {
        if ($scope.config[key] == "") {
          delete $scope.config[key];
        }
      });


      var genFailFn = function (type) {
        return function (error) {
          $scope.failed = true;
          $log.error(type + " FAILED", error);
          $scope.status = type + " FAILED = " + error.errorMessage;
        };
      };


      var callbacks = {
        "SUBSCRIPTION": {failFn: genFailFn("SUBSCRIPTION")},
        "CONNECTION": {failFn: genFailFn("CONNECTION")}
      };

      var utils = {
        "disconnectGen": function (client) {
          var mqttClient = client;
          return function () {
            $log.info("disconnection called");
            mqttClient.disconnect();
          };
        }
      };

      $scope.operations = {
        "subscribe": myMqtt.subscribe("/CMMC/#"),
        "connect": myMqtt.connect(),
        "config": $scope.config,
        "disconnect": angular.noop
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
    };

    $scope.disconnect = function () {
      $log.debug("CALLING DISCONNECT...");
      // mqttLWT.end(remmoveDevices);
      // myMqtt.end(remmoveDevices);
      // mqttXYZ.end(remmoveDevices);
      $scope.operations.disconnect();
    };

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
        host: 'mqtt.espert.io',
        port: 8000
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

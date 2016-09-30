(function () {
  'use strict';
  angular
    .module('cmmcDevices')
    .factory("myMqtt", function (mqttwsProvider) {
      // return mqtt connector
      return mqttwsProvider({});
    })
    .controller('MainController', MainController);

  var buildToggler = function buildToggler(navID, $mdSidenav, $mdUtil, $log) {
    var callback = function () {
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          $log.debug("toggle " + navID + " is done");
        });
    };

    // return debounce function
    return $mdUtil.debounce(callback, 200);
  };

  /** @ngInject */
  function MainController($scope, $timeout, myMqtt, $localStorage,
                          $sessionStorage, $mdSidenav, $mdUtil, $mdDialog, $log) {
    var _private = angular.extend(this, {devices: {}, LWT: {}});

    $scope.toggleRight = buildToggler('right', $mdSidenav, $mdUtil, $log);

    // load config
    $scope.storage = $localStorage.$default({
      config: {
        host: 'mqtt.cmmc.io',
        port: 9001,
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
        try {
          var topics = topic.split("/");
          var max_depth = topics.length - 1;
          $log.debug("splitted topics", topics);
          $log.debug("max topic depth", max_depth);

          var incomming_topic = topics[max_depth];

          var values;
          var status;
          var id;
          var mac;

          // protocol: /prefix/device uid/online
          if (incomming_topic == "online") {
            $log.debug("online", topics);
            values = payload.split("|");
            status = values[0];
            id = values[1];
            mac = values[1];
            $log.debug('id', id, "mac", mac, "status", status, new Date());

            if (mac && mac === status) {
              status = "online";
            }

            _private.LWT[mac || id] = status;
            // vm.devices[mac || id] .status = status;
            if (_private.devices[mac || id]) {
              _private.devices[mac || id].status = status;
              $log.debug(_private);
              $scope.$apply();
            }
          }
          else {
            try {
              var _payload = JSON.parse(payload);
              var _id2 = _payload.info && _payload.info.id;
              var _id = _payload.d && _payload.d.id;
              _payload.status = _private.LWT[_id || _id2] || "ONLINE" || "UNKNOWN";
              _payload.online = _payload.status !== "DEAD";
              _private.devices[_id || _id2] = _payload;
              delete _private.devices.undefined;
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

      try {
        myMqtt.on("message", onMsg);
      } catch (ex) {
        $log.error("onmessage error", ex);
      }
    };

    $scope.showDetail = function (targetEvent, deviceUUIDuuid) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'app/main/partials/detail.html',
        parent: angular.element(document.body),
        targetEvent: targetEvent,
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
      _private.devices = {};
    };

    $scope.allDevices = function () {
      return _private.devices;
    };

    //asynchronously
    $scope.connect = function () {
      $scope.status = "CONNECTING";

      addListener();
      _private.devices = {};
      angular.forEach($scope.config, function (value, key) {
        if ($scope.config[key] == "") {
          delete $scope.config[key];
        }
      });


      var genFailFn = function (type) {
        return function (error) {
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
        .then($scope.operations.connect, function (error) {
          $scope.failed = true;
          $log.error("CONNECT FAILED: ", error);
          $scope.status = error.errorMessage;
        })
        .then($scope.operations.subscribe, function (error) {
          $scope.failed = true;
          $log.error("SUBSCRIBE FAILED: ", error);
          $scope.status = error.errorMessage;
        })
        .then(function (mqttClient) {
          if (angular.isUndefined(mqttClient)) {
            $log.debug("CONTROLLER", "Unable to connect to the broker");
            // $scope.status = "unable to connect to the broker.";
          }
          else {
            $scope.status = "READY";
            $scope.operations.disconnect = utils.disconnectGen(mqttClient);
          }
        });
    };

    $scope.disconnect = function () {
      $log.debug("CALLING DISCONNECT...");
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
        host: 'mqtt.cmmc.io',
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

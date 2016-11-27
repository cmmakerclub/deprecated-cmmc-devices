(function () {
  'use strict';
  angular
  .module('cmmcDevices')
  .factory("myMqtt", function (mqttwsProvider) {
    // return mqtt connector
    return mqttwsProvider({});
  })
  .controller('MainController', MainController);

  function isValidJson (str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  var buildToggler = function buildToggler (navID, $mdSidenav, $mdUtil, $log) {
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
  function MainController ($scope, $timeout, myMqtt, $localStorage,
                           $sessionStorage, $mdSidenav, $mdUtil, $mdDialog, $log) {
    var _private = angular.extend(this, {devices: {}, LWT: {}});

    $scope.toggleRight = buildToggler('right', $mdSidenav, $mdUtil, $log);

    angular.extend($scope, {
      data: {
        cb_auth: true,
        cb_clientId: true,
        ssl: true
      }
    });

    angular.extend($scope, {
      data: {
        cb_auth: true,
        cb_clientId: true,
        ssl: true
      }
    });

    // addListener();
    $scope.storage = $localStorage.$default({
      config: {
        host: '',
        port: 8000,
        clientId: ''
      }
    });

    $scope.closeNav = function () {
      console.log("close nave");
      $mdSidenav('right').close()
      .then(function () {
        $scope.config = angular.extend({}, $scope.storage.config);
      });
    };

    $scope.closeAndSaveNewConfig = function (newConfig) {
      console.log("close & save");
      $mdSidenav('right').close()
      .then(function () {
        $scope.storage.config = newConfig;
        $scope.disconnect();
        $scope.connect();
      });
    };

    $scope.config = angular.extend({}, $scope.storage.config);

    angular.extend($scope, {
      onlineStatus: "ALL",
      filterDevice: {
        name: ""
      },
      '$scope': {
        filterDevice: {}
      }
    });

    var addListener = function () {
      var onMsg = function (topic, payload) {
        var topics = topic.split("/");
        var max_depth = topics.length - 1;
        var incomming_topic = topics[max_depth];
        var lwt_values, device_status, device_id;

        // protocol: /prefix/device_uid/lwt
        // protocol: /prefix/device_uid/status
        if (incomming_topic === "status") {
          if (isValidJson(payload)) {
            var _payload = JSON.parse(payload);
            var _device_id_value = (_payload.info && _payload.info.device_id);
            _private.devices[_device_id_value] = _payload;

            delete _private.devices.undefined;

            _private.system = {
              online_devices: Object.keys(_private.devices).length,
              offline_devices: Object.keys(_private.LWT).length,
              all_devices: (Object.keys(_private.LWT).length || 0) + Object.keys(_private.devices).length,
            };

            $scope.$apply();
          }
          else {
            $log.error("INVALID JSON => ", payload);
          }
        }
        else if (incomming_topic == "lwt") {
          /*
           * DEAD|DEVICE_ID|started_will_millis
           * ONLINE|DEVICE_ID|started_will_millis
           */
          lwt_values = payload.split("|");
          device_id = lwt_values[1];
          device_status = lwt_values[0];

          _private.LWT[device_id] = device_status;

          // $log.debug("lwt = ", lwt_values);

          if (_private.devices[device_id]) {
            _private.devices[device_id].online = device_status;
            $scope.$apply();
            console.log("in if");
          }
          else {
            console.log("147 in else");
          }

          // console.log(incomming_topic);
          // console.log(">", lwt_values, ">", device_status);
          // console.log(_private.devices);
        }
        else {
          // TODO: Unhandled topic
        }
      };

      try {
        myMqtt.on("message", onMsg);
      }
      catch (ex) {
        console.log(ex);
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
      var is_firstLogin = ($scope.config.host == null || $scope.config.host == "");
      return is_firstLogin;
    };

    $scope.showFirstPopup = function (ev) {
      console.log('showFirstPopUp');
      if (!isFirstLogin()) {
        return;
      }
      console.log('[] showFirstPopUp');

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
      angular.extend(_private, {devices: {}});
    };

    $scope.allDevices = function () {
      return _private.devices;
    };

    //asynchronously
    $scope.connect = function () {
      $scope.status = "CONNECTING...";

      addListener();

      angular.extend(_private, {
        devices: {}
      });

      angular.forEach($scope.config, function (value, key) {
        if ($scope.config[key] == "") {
          delete $scope.config[key];
        }
      });


      $scope.operations = {
        "subscribe": function () {
          return myMqtt.subscribe("/CMMC/#")
        },
        "connect": function () {
          return myMqtt.connect()
        },
        "config": $scope.config,
        "disconnect": angular.noop
      };

      myMqtt.create($scope.operations.config)
      .then($scope.operations.connect)
      .then($scope.operations.subscribe)
      .then(function (mqttClient) {
        $scope.status = "READY";
        $scope.operations.disconnect = function () {
          $log.info("disconnection called");
          mqttClient.disconnect();
        };
      }).catch(function (error) {
        $scope.failed = true;
        $log.error("CONNECT FAILED: ", error);
        $scope.status = error.errorMessage;
      });
    };

    $scope.disconnect = function () {
      $log.debug("CALLING DISCONNECT...");
      $scope.operations.disconnect();
    };

    function DialogController ($scope, $mdDialog, deviceUUID, devices) {
      $scope.devices = devices;
      $scope.deviceUUID = deviceUUID;

      // $scope.save = function() {
      //   console.log("SAVE ");
      // }
      $scope.hide = function (config) {
        $mdDialog.hide(config);
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };

    }

    function FirstPopupDialogController ($scope, $mdDialog) {
      $scope.config = {
        host: 'mqtt.cmmc.io',
        port: 8000
      };

      $scope.closeAndSaveNewConfig = function(newConfig) {
        console.log("FirstPopUpDialog:: closNav");
        console.log("save fn", newConfig);
        $mdDialog.hide(newConfig);
      }

    }

    if (!isFirstLogin()) {
      $scope.connect();
    }

  }
})();

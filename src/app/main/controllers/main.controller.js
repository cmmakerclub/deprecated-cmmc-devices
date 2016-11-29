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

var getObjectSize = function (object) {
  return Object.keys(object).length || 0;
};


(function () {
  'use strict';
  angular
  .module('cmmcDevices')
  .factory("myMqtt", function (mqttwsProvider) {
    return mqttwsProvider({});
  })
  .controller('MainController', MainController);

  var default_config = {
    host: 'mqtt.espert.io',
    port: 8000,
    prefix: 'CMMC',
    clientId: "CMMC-" + (Math.random() * 100)
  };

  var parseMessage = function ($q, topic, text) {
    var deferred = $q.defer();
    deferred.resolve(topic.split("/"));
    return deferred.promise;
  }

  var jsonParsePromise = function ($q, payloadString) {
    var deferred = $q.defer();
    var object;
    try {
      object = JSON.parse(payloadString);
      deferred.resolve(object);
    }
    catch (ex) {
      deferred.reject(ex);
    }
    return deferred.promise;
  }

  /** @ngInject */
  function MainController ($q, $scope, $timeout, myMqtt, $localStorage,
                           $sessionStorage, $mdSidenav, $mdUtil, $mdDialog, $log) {
    var _controller = angular.extend(this, {devices: {}, LWT: {}});

    $scope.toggleRight = buildToggler('right', $mdSidenav, $mdUtil, $log);
    angular.extend($scope, {
      data: {
        cb_auth: false,
        cb_clientId: false,
        ssl: false
      }
    });

    $scope.storage = $localStorage.$default(default_config);

    console.log($scope.storage);

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
        $scope.removeDevice
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

    // var addListener = function () {
    //   console.log("add listener");
    //   var onMsg = function (topic, payload) {
    //     console.log("on msg");
    //     var topics = topic.split("/");
    //     var max_depth = topics.length - 1;
    //     var incoming_topic = topics[max_depth];
    //     var lwt_values, is_device_online, device_id;
    //
    //     // protocol: /prefix/device_uid/lwt
    //     // protocol: /prefix/device_uid/status
    //     if (incoming_topic === "status") {
    //       if (isValidJson(payload)) {
    //         var _payload = JSON.parse(payload);
    //         var _device_id_value = (_payload.info && _payload.info.device_id);
    //         console.log("108", _device_id_value);
    //         _private.devices[_device_id_value] = _payload;
    //         delete _private.devices.undefined;
    //         var devices_length = getObjectSize(_private.devices);
    //         _private.system = {
    //           online_devices: devices_length,
    //           offline_devices: getObjectSize(_private.LWT),
    //           all_devices: devices_length + getObjectSize(_private.LWT)
    //         };
    //
    //         $scope.$apply();
    //       }
    //       else {
    //         $log.error("INVALID JSON => ", payload);
    //       }
    //     }
    //     else if (incoming_topic == "lwt") {
    //       /*
    //        * DEAD|DEVICE_ID|started_will_millis
    //        * ONLINE|DEVICE_ID|started_will_millis
    //        */
    //       lwt_values = payload.split("|");
    //       device_id = lwt_values[1];
    //       is_device_online = lwt_values[0];
    //
    //       _private.LWT[device_id] = is_device_online;
    //
    //       // ONLINE FROM LWT
    //       console.log("device_id", device_id);
    //       console.log("devices:", _private.devices);
    //       var _device = _private.devices[device_id];
    //       console.log("_DEVICE", _device);
    //       if (_device) {
    //         _device.online = is_device_online;
    //         if (is_device_online) {
    //           _device.status = "ONLINE";
    //         }
    //         else {
    //           _device.status = "DEAD";
    //         }
    //         console.log()
    //         $scope.$apply();
    //       }
    //       else {
    //         console.log("147 in else");
    //       }
    //     }
    //     else {
    //       // TODO: Unhandled topic
    //     }
    //   };
    //
    //   try {
    //     myMqtt.on("message", onMsg);
    //   }
    //   catch (ex) {
    //     console.log(ex);
    //   }
    // };

    // isFirstLogin
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
      if (!isFirstLogin()) {
        console.log("[SKIP] showFirstPopUp");
        return;
      }

      console.log('showFirstPopUp');

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
        $scope.disconnect();
        $scope.connect();
      }, function () {
        $log.debug("CALLING CONNECT..");
        $scope.connect();
      });

    };

    $scope.reset = function () {
      $localStorage.$reset();
      window.location.reload();
    };

    $scope.allDevices = function () {
      return _controller.devices;
    };

    //asynchronously
    $scope.connect = function () {
      console.log("[0] CONNECT ... ");
      $scope.status = "CONNECTING...";

      angular.extend(_controller, {
        devices: {}
      });

      myMqtt.create($scope.config)
      .then(function () {
        return myMqtt.connect();
      })
      .then(function () {
        myMqtt.subscribe("/CMMC/+/status");
        // myMqtt.subscribe("/CMMC/+/$/#");
        return myMqtt.subscribe("/CMMC/+/lwt");
      })
      .then(function (mqttClient) {
        myMqtt.on("message", function (topic, payloadString, payload) {
          var _topics;
          parseMessage($q, topic, payloadString)
          .then(function (topics) {
            if (topics[0] === "") {
              topics.shift();
            }
            return topics;
          })
          .then(function (topics) {
            _topics = topics;
            /*   [ 0: prefix ], [ 1: id ], [ 2: status/lwt ] */
            if (topics[2] == "status") {
              return jsonParsePromise($q, payloadString);
            }
            else if (topics[2] == "lwt") {
              return "lwt";
            }
            else {
              return undefined;
            }
          })
          .then(function (device) {
            if (device && device.d) {
              console.log(topic, device);
              _controller.devices[_topics[1]] = device;
            }
          }).catch(function (ex) {
            console.log("ERROR: ", ex);
          });
        });
        return mqttClient;
      })
      .then(function (mqttClient) {
        $scope.status = "READY";
        $scope._client = mqttClient;
      }).catch(function (error) {
        $scope.failed = true;
        $scope.status = error.errorMessage;
      });
    };

    $scope.disconnect = function () {
      $log.debug("CALLING DISCONNECT...");
      if ($scope._client) {
        $scope._client.disconnect();
      }
    };

    function DialogController ($scope, $mdDialog, deviceUUID, devices) {
      $scope.devices = devices;
      $scope.deviceUUID = deviceUUID;

      $scope.hide = function (config) {
        $mdDialog.hide(config);
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
    }

    function FirstPopupDialogController ($scope, $mdDialog) {
      $scope.config = default_config;
      $scope.closeAndSaveNewConfig = function (newConfig) {
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

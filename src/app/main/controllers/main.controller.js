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
    var _controller = angular.extend(this, {
      devices: {},
      LWT: {
        ALL: {},
        DEAD: {},
        ONLINE: {}
      },
      LWT_COUNT: {
        ALL: 0,
        DEAD: 0,
        ONLINE: 0
      }
    });

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

      myMqtt.create($scope.config)
      .then(function () {
        return myMqtt.connect();
      })
      .then(function () {
        myMqtt.subscribe("/CMMC/+/status");
        myMqtt.subscribe("/CMMC/+/lwt");
        // myMqtt.subscribe("/CMMC/+/$/#");
      })
      .then(function (mqttClient) {
        myMqtt.on("message", function (topic, payloadString, payload) {
          var _topics;
          var _uuid_topic;
          var _action_topic;
          var _lwt_status;
          parseMessage($q, topic, payloadString)
          .then(function (topics) {
            if (topics[0] === "") {
              topics.shift();
            }
            return topics;
          })
          .then(function (topics) {
            _topics = topics;
            _uuid_topic = _topics[1];
            _action_topic = _topics[2];
            /*   [ 0: prefix ], [ 1: id ], [ 2: status/lwt ] */
            $log.debug("action: ", _action_topic, _uuid_topic);
            if (_action_topic == "lwt") {
              $log.debug(payloadString)
              var lwts = payloadString.split("|");
              _lwt_status = lwts[0]
              return "lwt";
            }
            else if (_action_topic == "status") {
              return jsonParsePromise($q, payloadString);
            }
            else {
              return undefined;
            }
          })
          .then(function (device) {
            if (device == "lwt") {
              delete _controller.LWT['DEAD'][_uuid_topic];
              delete _controller.LWT['ONLINE'][_uuid_topic];

              _controller.LWT.ALL[_uuid_topic] = payloadString;
              _controller.LWT[_lwt_status][_uuid_topic] = payloadString;

              _controller.LWT_COUNT.ALL = getObjectSize(_controller.LWT.ALL);
              _controller.LWT_COUNT.ONLINE = getObjectSize(_controller.LWT.ONLINE);
              _controller.LWT_COUNT.DEAD = getObjectSize(_controller.LWT.DEAD);

              if (_controller.devices[_uuid_topic]) {
                _controller.devices[_uuid_topic].status = _lwt_status;
              }
            }
            else if (device && device.d) {
              device.status = "ONLINE";
              _controller.devices[_uuid_topic] = device;
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

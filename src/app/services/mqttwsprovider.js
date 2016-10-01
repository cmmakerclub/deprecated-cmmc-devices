'use strict';

/**
 * @ngdoc service
 * @name myNewProjectApp.mqttwsProvider
 * @description
 * # mqttwsProvider
 * Provider in the myNewProjectApp.
 */
angular.module('cmmcDevices')
  .provider('mqttwsProvider', function () {
    // $log.debug("mqttwsProvider")
    // Method for instantiating
    this.$get = function ($q, $window, $log) {
      // $log.debug("$get");
      var genClientId = function (str) {
        var time = new Date();
        return str + '.' + time.getTime();
      };
      return function socketFactory(pre_options) {
        var host;
        var port;
        var useTLS = false;
        var username = null;
        var password = null;
        var cleansession = true;
        var mqttClient;
        var reconnectTimeout = 2000;
        var events = {};
        var _options = {};

        return {
          on: function (event, func) {
            events[event] = func;
          },
          addListener: function (event, func) {
            events[event] = func;
          },
          create: function (options) {
            var defer = $q.defer();
            options = angular.extend(_options, options);
            host = options.host;
            port = parseInt(options.port, 10);
            $log.debug("CREATE", options);
            if (!options.clientId) {
              options.clientId = genClientId("RANDOM");
              $log.debug("PROVIDER", " clientId = ", options.clientId);
            }
            mqttClient = new Paho.MQTT.Client(host, port, options.clientId);
            defer.resolve(mqttClient);
            return defer.promise;
          },
          subscribe: function (topic, opts) {
            var defer = $q.defer();
            opts = opts || {qos: 0};
            opts.onSuccess = function () {
              defer.resolve(mqttClient);
            };
            mqttClient.subscribe(topic, opts);
            return defer.promise;
          },
          connect: function () {
            var defer = $q.defer();

            var onSuccess = function () {
              var success_event = events.connected || function () {
                  $log.debug("[69] DEFAULT CONNECTED..");
                };
              success_event.call(null, arguments);
              $log.debug("[Provider] onSuccess", "MQTT CONNECTED..");
              defer.resolve(arguments);
            };

            var onFailure = function (message) {
              $log.error("[86]..FAILED....", message);
              // $window.setTimeout(wrappedSocket.connect, reconnectTimeout);
              defer.reject(message);
            };

            var options = {
              timeout: 10,
              useSSL: useTLS,
              // mqttVersionExplicit: true,
              mqttVersion: 3,
              cleanSession: cleansession,
              onSuccess: onSuccess,
              onFailure: onFailure
            };

            $log.debug("[101] PROVIDER", "OPTIONS", _options);

            if (!!_options.username) {
              angular.extend(options, {
                username: _options.username,
                password: _options.password
              });
            }

            $log.info("MQTT CONNECTION OPTIONS = ", options);


            mqttClient.onMessageArrived = function (message) {
              try {
                var topic = message.destinationName;
                var payload = message.payloadString;
                var ev = events.message || angular.noop;
                console.log(payload);
                ev.apply(null, [topic, payload, message]);
              }
              catch (ex) {
                $log.error("[error] skipped. still running..", ex);
              }
            };

            mqttClient.onConnectionLost = function (responseObject) {
              console.log("onConnection Lost ", responseObject);
            };

            mqttClient.connect(options);

            return defer.promise;

          }
        };
      };
    };


  });

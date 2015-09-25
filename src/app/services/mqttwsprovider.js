'use strict';

/**
 * @ngdoc service
 * @name myNewProjectApp.mqttwsProvider
 * @description
 * # mqttwsProvider
 * Provider in the myNewProjectApp.
 */
angular.module('gulpAngularMqttWs')
    .provider('mqttwsProvider', function () {
        // console.log("mqttwsProvider")
        // Method for instantiating
        this.$get = function ($q, $window) {
            // console.log("$get");

            return function socketFactory(pre_options) {
                var host;
                var port;
                var useTLS = false;
                var username = null;
                var password = null;
                var cleansession = false;
                var mqtt;
                var reconnectTimeout = 2000;
                var events = {};
                var _options = {};

                var wrappedSocket = {
                    on: function (event, func) {
                        events[event] = func;
                    },
                    addListener: function (event, func) {
                        events[event] = func;
                    },                    
                    subscribe: function (topic, opts) {
                        opts = opts || { qos: 0 };
                        return function _subscribe() {
                            var defer = $q.defer();
                            var subscribed = function () {
                                defer.resolve(mqtt);
                            };

                            opts.onSuccess = subscribed;
                            mqtt.subscribe(topic, opts);

                            console.log("SUB", topic, opts);
                            return defer.promise;
                        };
                    },
                    create: function (options) {
                        var defer = $q.defer();
                        options = angular.extend(_options, options);
                        host = options.host;
                        port = parseInt(options.port, 10);
                        console.log("CRESATE", options);
                        mqtt = new Paho.MQTT.Client(host, port, options.clientId);
                        defer.resolve(mqtt);
                        return defer.promise;
                    },
                    connect: function () {
                        return function () {
                            var defer = $q.defer();

                            var onSuccess = function () {
                                var ev = events.connected || function () { };
                                console.log("CONNECTED");
                                ev.call(null, arguments);
                                defer.resolve(arguments);
                            };

                            var onFailure = function (message) {
                                console.log(message);
                                // $window.setTimeout(wrappedSocket.connect, reconnectTimeout);
                                defer.reject(message);
                            };

                            var options = {
                                timeout: 3,
                                useSSL: useTLS,
                                // mqttVersionExplicit: true,
                                mqttVersion: 3,
                                cleanSession: cleansession,
                                onSuccess: onSuccess,
                                onFailure: onFailure
                            };


                            console.log(_options)
                            if (!!_options.username) {
                                options.userName = _options.username;
                                options.password = _options.password;
                            }

                            mqtt.connect(options);

                            mqtt.onMessageArrived = function (message) {
                                var topic = message.destinationName;
                                var payload = message.payloadString;
                                var ev = events.message || function () { };
                                ev.apply(null, [topic, payload, message]);
                                var ev2 = events[topic.toString()] || function () { };
                                ev2.apply(null, [payload, message]);
                            };

                            return defer.promise;

                        }
                    }
                };


                // var callback = options.callback;


                return wrappedSocket;
            };
        };


    });

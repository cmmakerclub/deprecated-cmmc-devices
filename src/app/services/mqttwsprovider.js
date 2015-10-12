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
        // $log.debug("mqttwsProvider")
        // Method for instantiating
        this.$get = function ($q, $window, $log) {
            // $log.debug("$get");
            var genClientId = function(str){
                var time = new Date();
                return str + '.' + time.getTime();
            };
            return function socketFactory(pre_options) {
                var host;
                var port;
                var useTLS = false;
                var username = null;
                var password = null;
                var cleansession = false;
                var mqttClient;
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
                        $log.debug("SUBSCRIBE", arguments);
                        opts = opts || { qos: 0 };
                        return function _subscribe() {
                            var defer = $q.defer();
                            var subscribed = function () {
                                $log.debug("PROVIDER", "subscribe succeeded.")
                                defer.resolve(mqttClient);
                            };

                            opts.onSuccess = subscribed;
                            mqttClient.subscribe(topic, opts);

                            $log.debug("PROVIDER", "SUB", topic, opts);
                            return defer.promise;
                        };
                    },
                    create: function (options) {
                        var defer = $q.defer();
                        options = angular.extend(_options, options);
                        host = options.host;
                        port = parseInt(options.port, 10);
                        $log.debug("CREATE", options);
                        if (!options.clientId) {
                            options.clientId = genClientId("RANDOM");
                            $log.debug("PROVIDER"," clientId = ", options.clientId);
                        }
                        mqttClient = new Paho.MQTT.Client(host, port, options.clientId);
                        defer.resolve(mqttClient);
                        return defer.promise;
                    },
                    connect: function () {
                        return function () {
                            var defer = $q.defer();

                            var onSuccess = function () {
                                var ev = events.connected || function () { };
                                $log.debug("PROVIDER", "CONNECTION CONNECTED");
                                ev.call(null, arguments);
                                defer.resolve(arguments);
                            };

                            var onFailure = function (message) {
                                $log.debug(message);
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

                            $log.debug("PROVIDER", "OPTIONS", _options)
                            if (!!_options.username) {
                                options.userName = _options.username;
                                options.password = _options.password;
                            }

                            mqttClient.connect(options);

                            mqttClient.onMessageArrived = function (message) {
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

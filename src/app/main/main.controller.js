(function () {
  'use strict';
  var options = {
    host: 'rabbit.cmmc.ninja',
    port: 8000,
  };
  angular
    .module('gulpAngularMqttWs')
    .factory("myMqtt", function (mqttwsProvider) {
      var MQTT = mqttwsProvider(options);
      return MQTT;
    })
    .factory("mqttLWT", function (mqttwsProvider) {
      var MQTT = mqttwsProvider(options);
      return MQTT;
    })
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $timeout, toastr, myMqtt, mqttLWT) {
    var vm = this;
    vm.devices = {};


    myMqtt.on("message", function (topic, payload, message) {
      // console.log("topic", topic, payload);
      var payload = JSON.parse(payload);
      vm.devices[payload.d.id] = payload;
      vm.devices[payload.info && payload.info.id] = payload;
      delete vm.devices.undefined
      $scope.$apply();
    });

    // myMqtt.on("esp8266/+/status", function (payload, message) {
    //   console.log("ON STATUS", JSON.parse(payload));
    // });

    myMqtt.connect().then(myMqtt.subscribe("esp8266/+/status"));


    vm.classAnimation = '';
    vm.showToastr = showToastr;

    activate();

    function activate() {
      $timeout(function () {
        vm.classAnimation = 'rubberBand';
      }, 4000);
    }

    function showToastr() {
      toastr.info('someone dead');
      vm.classAnimation = '';
    }

  }
})();
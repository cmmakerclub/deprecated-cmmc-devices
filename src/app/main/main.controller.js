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
    .factory("mqttXYZ", function (mqttwsProvider) {
      options.host = "cmmc.xyz";
      options.port = 9001;
      var MQTT = mqttwsProvider(options);
      return MQTT;
    })
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $timeout, toastr,
    myMqtt, mqttXYZ, mqttLWT) {
    var vm = this;
    vm.devices = {};
    vm.LWT = {};

    var onMsg = function (topic, payload) {
      // console.log("topic", topic, payload);
      var _payload = JSON.parse(payload);
      var _id2 = _payload.info && _payload.info.id;
      var _id = _payload.d && _payload.d.id;
      _payload.status = vm.LWT[_id || _id2] || "UNKNOWN";
      _payload.online = _payload.status !== "DEAD";
      vm.devices[_id || _id2] = _payload;
      delete vm.devices.undefined;
      $scope.$apply();
    };

    myMqtt.on("message", onMsg);
    mqttXYZ.on("message", onMsg);
    mqttLWT.on("message", function (topic, payload) {
      var topics = topic.split("/");
      var values = payload.split("|");
      var status = values[0];
      var id = values[1];
      var mac = topics[1];

      if (mac && mac === status) {
        status = "online";
      }

      vm.LWT[mac || id] = status;
      // vm.devices[mac || id] .status = status;
      if (vm.devices[mac || id]) {
        vm.devices[mac || id].status = status;
        $scope.$apply();
      }
    });
    
    //asynchronously
    mqttLWT.connect().then(mqttLWT.subscribe("esp8266/+/online"));
    myMqtt.connect().then(myMqtt.subscribe("esp8266/+/status"));
    mqttXYZ.connect().then(mqttXYZ.subscribe("esp8266/+/status"));

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
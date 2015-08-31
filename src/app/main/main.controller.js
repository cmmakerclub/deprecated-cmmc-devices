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


    var onMsg = function (topic, payload, message) {
      // console.log("topic", topic, payload);
      var _payload = JSON.parse(payload);
      var _id2 = _payload.info && _payload.info.id;
      var _id = _payload.d && _payload.d.id;
      vm.devices[_id || _id2] = _payload;
      vm.devices[_id || _id2].status = vm.LWT[_id] || "UNKNOWN";
      delete vm.devices.undefined;
      $scope.$apply();
    };
    
    $scope.$watch

    myMqtt.on("message", onMsg);
    mqttXYZ.on("message", onMsg);
    mqttLWT.on("message", function (topic, payload) {
      var topics = topic.split("/");
      var values = payload.split("|");
      var status = values[0];
      var id = values[1];
      var mac = topics[1];


      
      // console.log(mac, values[0]);
      if (mac && mac == status) {
        status = "online";
      }
      
      vm.LWT[mac || id] = status;
      $scope.$apply();
      
    });
    
    //asynchronously 
    mqttLWT.connect().then(mqttLWT.subscribe("esp8266/+/online"));
    // myMqtt.connect().then(myMqtt.subscribe("esp8266/+/status"));
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
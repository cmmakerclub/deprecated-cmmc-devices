(function() {
  'use strict';

  angular
    .module('gulpAngularMqttWs')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout , toastr) {
    var vm = this;

    vm.awesomeThings = [];
    vm.classAnimation = '';
    vm.creationDate = 1441016460122;
    vm.showToastr = showToastr;

    activate();

    function activate() {
      $timeout(function() {
        vm.classAnimation = 'rubberBand';
      }, 4000);
    }

    function showToastr() {
      toastr.info('someone dead');
      vm.classAnimation = '';
    }
  }
})();
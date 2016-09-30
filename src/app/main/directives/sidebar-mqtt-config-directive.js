'use strict';
/**
 * @ngdoc directive
 * @name cmmcDevices.directive:sidebarMqttConfig
 * @description
 * # sidebarMqttConfig
 */
angular.module('cmmcDevices')
  .directive('sidebarMqttConfig', function () {
    return {
      templateUrl: 'app/main/partials/sidebar.html',
      restrict: 'E',
      link: function (scope, element, attrs) {
        // element.text('this is the sidebarMqttConfig directive');
      }
    };
  });

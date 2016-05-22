'use strict';
/**
 * @ngdoc directive
 * @name gulpAngularMqttWs.directive:sidebarMqttConfig
 * @description
 * # sidebarMqttConfig
 */
angular.module('gulpAngularMqttWs')
  .directive('sidebarMqttConfig', function () {
    return {
      templateUrl: 'app/main/partials/sidebar.html',
      restrict: 'E',
      link: function (scope, element, attrs) {
        // element.text('this is the sidebarMqttConfig directive');
      }
    };
  });

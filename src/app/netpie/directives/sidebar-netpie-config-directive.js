'use strict';
/**
 * @ngdoc directive
 * @name cmmcDevices.directive:sidebarNetpieConfig
 * @description
 * # sidebarNetpieConfig
 */
angular.module('cmmcDevices')
  .directive('sidebarNetpieConfig', function () {
    return {
      templateUrl: 'app/netpie/partials/sidebar.html',
      scope: {
        config: '=config'
      },
      restrict: 'E',
      link: function (scope, element, attrs) {
        // element.text('this is the sidebarNetpieConfig directive');
        console.log(scope);
      }
    };
  });

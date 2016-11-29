(function () {
  'use strict';

  angular
    .module('cmmcDevices')
    .config(config);

  /** @ngInject */
  function config($logProvider, toastr, $mdThemingProvider) {
    // Enable log
    $logProvider.debugEnabled(false);

    // Set options third-party lib
    toastr.options.timeOut = 3000;
    toastr.options.positionClass = 'toast-top-right';
    toastr.options.preventDuplicates = true;
    toastr.options.progressBar = true;


    $mdThemingProvider.theme('default')
        .primaryPalette('indigo')
        .accentPalette('orange');
  }

})();

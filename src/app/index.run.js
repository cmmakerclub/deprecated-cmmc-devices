(function () {
  'use strict'

  angular
    .module('cmmcDevices')
    .run(runBlock)

  /** @ngInject */
  function runBlock ($log) {

    $log.debug('runBlock end')
  }

})()

(function() {
  'use strict';

  angular
    .module('gulpAngularMqttWs')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();

'use strict'
describe('Controller: aboutCtrl', function () {
// load the controller's module
  beforeEach(module('cmmcDevices'))
  var aboutCtrl,
    scope
// Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new()
    aboutCtrl = $controller('aboutCtrl', {
      $scope: scope
    })
  }))
})

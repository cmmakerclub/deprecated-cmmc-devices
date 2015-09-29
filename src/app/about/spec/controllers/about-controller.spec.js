'use strict';
describe('Controller: aboutCtrl', function () {
// load the controller's module
  beforeEach(module('gulpAngularMqttWs'));
  var aboutCtrl,
      scope;
// Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    aboutCtrl = $controller('aboutCtrl', {
      $scope: scope
    });
  }));
  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

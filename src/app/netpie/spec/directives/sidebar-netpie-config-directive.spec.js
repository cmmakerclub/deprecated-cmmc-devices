'use strict';
describe('Directive: sidebarNetpieConfig', function () {
// load the directive's module
  beforeEach(module('cmmcDevices'));
  var element,
    scope;
  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));
  it('should make hidden element visible', inject(function ($compile) {
    expect(element.text()).toBe('this is the sidebarNetpieConfig directive');
  }));
});

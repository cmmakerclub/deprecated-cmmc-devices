'use strict'

describe('Filter: cmmcFilters', function () {
// load the filter's module
  beforeEach(module('cmmcDevices'))
// initialize a new instance of the filter before each test
  var cmmcFilters
  beforeEach(inject(function ($filter) {
    cmmcFilters = $filter('cmmcFilters')
  }))
  it('should return the input prefixed with "cmmcFilters filter:"', function () {
    var text = 'angularjs'
    expect(cmmcFilters(text)).toBe('cmmcFilters filter: ' + text)
  })
})

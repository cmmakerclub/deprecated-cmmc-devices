'use strict'
/**
 * @ngdoc filter
 * @name cmmcDevices.filter:cmmcFilters
 * @function
 * @description
 * # cmmcFilters
 * Filter in the cmmcDevices.
 */
angular.module('cmmcDevices')
  .filter('status', function () {
    return function (input, status) {

      if (status == 'ALL') {
        return input
      }

      var result = {}
      angular.forEach(input, function (value, key) {
        if (value.status == status) {
          result[key] = value
        }
      })
      return result
    }
  })
  .filter('name', function () {
    return function (input, name) {
      var result = {}
      angular.forEach(input, function (value, key) {
        if (value.d && value.d.myName) {
          if (value.d.myName.toLowerCase().indexOf(name.toLowerCase()) > -1) {
            result[key] = value
          }
        }
        else {
        }
      })
      return result
    }
  })
  .filter('isEmpty', function () {
    var bar
    return function (obj) {
      for (bar in obj) {
        if (obj.hasOwnProperty(bar)) {
          return false
        }
      }
      return true
    }
  })

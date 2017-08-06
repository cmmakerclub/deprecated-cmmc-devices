(function () {
  'use strict'

  angular
    .module('cmmcDevices')
    .config(routeConfig)

  /** @ngInject */
  function routeConfig ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/partials/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .state('about', {
        url: '/about',
        templateUrl: 'app/about/partials/about.html',
        controller: 'aboutCtrl',
        controllerAs: 'about'
      })

    $urlRouterProvider.otherwise('/')
  }

})()

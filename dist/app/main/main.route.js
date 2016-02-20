(function() {
  'use strict';

  angular
    .module('dm')
    .config(mainRoute);

  /** @ngInject */
  function mainRoute($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: '../dist/app/main/main.html',
        controller: 'MainController',
      });

      $urlRouterProvider.otherwise('/');
  }

})();

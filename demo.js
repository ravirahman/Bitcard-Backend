var app = angular.module('Demo', ['ngMaterial', 'ngMessages', 'ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
              // route for the home page
              .when('/', {
                  templateUrl : 'pages/login.html',
                  controller  : 'mainController'
              })

              // route for the info page
              .when('/info', {
                  templateUrl : 'pages/info.html',
                  controller  : 'infoController'
              })

              // route for the amount page
              .when('/amount', {
                  templateUrl : 'pages/amount.html',
                  controller  : 'amountController'
              });
});

app.controller('mainController', function($scope, $location) {
    $scope.login = function() {
      console.log("button");
      // should only change view if authentication was a success
      $location.path("/amount");
    };

});

app.controller('infoController', function($scope) {
          $scope.message = 'Look! I am an about page.';
});

app.controller('amountController', function($scope) {
          $scope.money = 800; // how much is left
          // add functionality to check how much is actually left in coinbase wallet(s)
          $scope.amount = '';

          $scope.go = function () {

          };
});

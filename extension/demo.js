var app = angular.module('Demo', ['ngMaterial', 'ngMessages', 'ngRoute']);
var cardNumber;

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

              .when('/form', {
                  templateUrl : 'pages/form.html',
                  controller  : 'formController'
              })

              // route for the amount page
              .when('/amount', {
                  templateUrl : 'pages/amount.html',
                  controller  : 'amountController'
              });
});

app.controller('mainController', function($scope, $location) {
    chrome.storage.sync.get(null, function(items) {
        var allKeys = Object.keys(items);
        console.log(allKeys);
        if (items.hasOwnProperty("coinbase_access_key") && items.hasOwnProperty("coinbase_refresh_token")) {
            $location.path("/form");
        }
    });

    $scope.login = function() { // should only change view if authentication was a success
        var myWindow = window.open("https://bitcard-backend.herokuapp.com/connect/coinbase", "myWindow", "width=300, height=700");
        //constantly check to see if the key/value coinbase access_token and refresh_token are set
    };

});

app.controller('infoController', function($scope, $location) {
    $scope.zip = 30303;
    $scope.card = 4400330022002200;

    $scope.copy = function () {
      // copy to clipboard
    }
});

app.controller('formController', function($scope, $location, $http) {
    $scope.user = {
      firstName: '',
      lastName: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      postalCode: ''
    };

    $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
   'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
   'WY').split(' ').map(function(state) {
       return {abbrev: state};
     });

    $scope.continue = function () {
      $http.post('https://bitcard-backend.herokuapp.com/create_capital_one_customer', user, config).then(function(user) {

      }, function(err) {

      });
      $location.path("/amount");
    };
});

app.controller('amountController', function($scope, $location) {
          $scope.money = "1";
          // how much is left
          // add functionality to check how much is actually left in coinbase wallet(s)
          $scope.amount = '';

          $scope.withdraw = function () {
              if ($scope.amount == null) return;
              $http.post('https://bitcard-backend.herokuapp.com/create_virtual_card', data, config).then(function(data) {
                  cardNumber: data;
                  access_token: "",
                  refresh_token: ""
              }, function(err) {

              });
              $location.path("/info");
          };
});

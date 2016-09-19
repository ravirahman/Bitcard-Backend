var app = angular.module('Demo', ['ngMaterial', 'ngMessages', 'ngRoute']);
var cardNumber;
var postalCode;

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
    $scope.card = cardNumber;

    $scope.copy = function() {
        $scope.card.select();
        document.execCommand("copy");
    };

    chrome.storage.sync.clear();
});

app.controller('formController', function($scope, $location, $http) {
    chrome.storage.sync.get(null, function(items) {
        var allKeys = Object.keys(items);
        console.log(allKeys);
        if (items.hasOwnProperty("c1_account")) {
            $location.path("/amount");
        }
        $scope.user = {
            firstName: '',
            lastName: '',
            address: '',
            address2: '',
            city: '',
            state: '',
            postalCode: '',
            access_token: items["coinbase_access_key"],
            refresh_token: items["coinbase_refresh_token"]
        };
    });


    $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
   'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
   'WY').split(' ').map(function(state) {
       return {abbrev: state};
     });

    $scope.continue = function () {
        console.log($scope.user);
      $http.post('https://bitcard-backend.herokuapp.com/create_capital_one_customer', $scope.user).then(function(user) {
          chrome.storage.sync.set({
              "c1_account": true,
          }, function() {
              // Notify that we saved.
              $location.path("/amount");
          });

      }, function(err) {
            console.error(err);
      });

    };
});

app.controller('amountController', function($scope, $location, $http) {
          $scope.money = "1";
          // how much is left
          // add functionality to check how much is actually left in coinbase wallet(s)
          $scope.amount = '';



          $scope.withdraw = function () {
              if ($scope.amount == null) return;
              chrome.storage.sync.get(null, function(items) {
                  var allKeys = Object.keys(items);
                  console.log(allKeys);
                  $http.post('https://bitcard-backend.herokuapp.com/create_virtual_card', {
                      amount_to_charge: $scope.amount,
                      access_token: items["coinbase_access_key"],
                      refresh_token: items["coinbase_refresh_token"]
                  }).then(function(data) {
                      console.log("data",data);
                      cardNumber = data.data.objectCreated.account_number;
                      $location.path("/info");
                  }, function(err) {
                        alert(JSON.stringify(err));
                  });
              });


          };
});

angular.module('Demo', ['ngMaterial', 'ngMessages'])
  .controller('DemoCtrl', function($scope, $http) {

    $scope.user = {
      card: '',
      sec: '',
      month: '',
      year: ''
    };

    $scope.months = ('01 02 03 04 05 06 07 08 09 10 11 12').split(' ').map(function (month) { return { abbrev: month }; });
    $scope.years = ('2016 2017 2018 2019 2020 2021').split(' ').map(function (month) { return { abbrev: month }; });

    $scope.submit = function () {
      console.log($scope.user.card);
      console.log($scope.user.sec);
      console.log($scope.user.month);
      console.log($scope.user.year);
      $http.post("https://bitcard-backend.herokuapp.com/process_transaction", {
        account_id: $scope.user.card,
        amount_to_charge: 0.10
      }).then(function(data) {
        alert("Payment Processed!");
      }, function(err) {
        console.log(err);
        alert(err);
      })
    };
  });

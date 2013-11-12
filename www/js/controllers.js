
'use strict';

function RunCtrl($scope, $http, $location, MapService) {
  if (!window.CORUN.checkUser())
  {
    $location.path('/login');
  }

  window.CORUN.initMap();

  $scope.corunSubmenu = $location.path();
  console.log($location.path());

  $scope.submit = function() {
    window.CORUN.stopRun();

    var post = {
      session: window.CORUN.getUser('session'),
      map_data: window.CORUN.getMapData()
    }
    $http.post(window.CORUN.getUrl('run'), post)
      .success(function(data, status, headers, config) {
        // Save the new session
        window.CORUN.setUser(data.corun.data.session);
        $location.path('/run/edit/' + data.corun.data.run_id);
      })
      .error(function(data, status, headers, config) {
        alert('There was a problem saving your run, please try again');
      });
  };
}

function SettingsCtrl($scope, $http, $location, UserService, MapService) {
  if (!window.CORUN.checkUser())
  {
    $location.path('/login');
  }
  $scope.corunSubmenu = $location.path();
  $scope.mapData = window.CORUN.getMapData;
  $scope.userData = window.CORUN.getUser();
  console.log($location.path());
}

function IndexCtrl($scope, $http, $location, UserService) {
  if (!window.CORUN.checkUser())
  {
    $location.path('/login');
  }

  console.log(window.CORUN.getUser());

  $scope.corunSubmenu = $location.path();
  console.log($location.path());
}

function ProfileCtrl($scope, $http, $location, UserService) {
  if (!window.CORUN.checkUser())
  {
    $location.path('/login');
  }
  $scope.corunSubmenu = $location.path();
  $scope.user = window.CORUN.getUser();
  console.log($scope.corunSubmenu);
}

function UserLoginCtrl($scope, $http, $location, UserService) {

  // Submit the login form, set the session when present
  $scope.user = {};
  $scope.loginUser = function() {
    $http({
      method: 'POST',
      url: window.CORUN.getUrl('login'),
      data: $scope.user
    }).success(function(data, status, headers, config) {
      // Logged in
      if (data.corun.data.success == 1) {
        // Save the user
        window.CORUN.setUser(data.corun.data.user);

        $location.path('/');
      }
      else
      {
        console.log("Error: Bad username/password");
      }

      console.log("Success:" + data);
    })
    .error(function(data, status, headers, config) {
      
     console.log("Error:" + data);
    });
  };
}

function RunEditCtrl($scope, $http, $location, $routeParams) {
  if (!window.CORUN.checkUser())
  {
    $location.path('/login');
  }
  // Set the navigation
  $scope.corunSubmenu = '/run';
  $scope.hideSubmenu = true;

  // Set the form data
  var d = new Date();
  var curMonth = (d.getMonth() + 1);
  var curYear = d.getFullYear();
  var curDate = d.getDate();
  var date = curMonth + "/" + curDate + "/" + curYear;
  $scope.runForm = {
    title : 'Run on ' + date,
    map : window.CORUN.getMapData(true),
    session: window.CORUN.getUser().session
  }

  $scope.editRun = function() {
    $http({
      method: 'PUT',
      url: window.CORUN.getUrl('run/' + $routeParams.id),
      data: $scope.runForm
    }).success(function(data, status, headers, config) {
      // Logged in
      if (data.corun.data.success == 1) {
        // Save the user
        window.CORUN.setUser(data.corun.data.session, 'session');
        
        $location.path('/');
      }
      else
      {
        console.log("Error: Bad username/password");
      }

      console.log("Success:" + data);
    })
    .error(function(data, status, headers, config) {
      
     console.log("Error:" + data);
    });
  };

  console.log($routeParams);
  console.log($location.path());
}


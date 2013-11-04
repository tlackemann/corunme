
'use strict';

var httpUrl = 'http://192.168.1.8/corunme-api/public/';
//var httpUrl = '//127.0.0.1/corunme-api/public/';

function _checkLoggedIn(User)
{
  var localUser = window.localStorage["user"];

  if (localUser != undefined)
  {
    User.isLogged = true;
    User.username = localUser.username;
    return true;
  }
  return false;
}

function IndexCtrl($scope, $http, $location, UserService) {
  var User = UserService;

  if(!_checkLoggedIn(User))
  {
    $location.path('/login');
  }

  $scope.submit = function() {
    $http.post(httpUrl + 'run')
      .success(function(data, status, headers, config) {
        console.log(data);
        console.log(status);
      });
  };
  // $http.post(httpUrl + 'run').success(function(response) {
  //   console.log(response);
  //   console.log('alright');
  // });
}

function UserLoginCtrl($scope, $http, $location, UserService) {
  var User = UserService;
  if(_checkLoggedIn(User))
  {
    $location.path('/');
  }
  
  $scope.submit = function() {
    var formData = {
      'email' : this.email,
      'password' : this.password
    };
    $http.post(httpUrl + 'login', formData)
      .success(function(data, status, headers, config) {
        //console.log(data);  
        alert(status);
        if (data.corun.data.success) {
          // succefull login
          User.isLogged = true;
          User.username = formData.email;

          // Save this shiiiit
          window.localStorage["user"] = User.username;
          
          $location.path('/');
        }
        else
        {
          User.isLogged = false;
          User.username = '';

        }
      })
      .error(function(data, status, headers, config) {
        alert(status);
        alert(headers);
        alert(data);
      });
  };
}


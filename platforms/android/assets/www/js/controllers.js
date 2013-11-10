
'use strict';

function RunCtrl($scope, $http, $location, UserService, MapService) {
  window.CORUN.initMap();
}

function IndexCtrl($scope, $http, $location, UserService) {

  // // Get runs
  // var _feed = window.CORUN.getCache('feed');

  // if (_feed == 'false')
  // {
  //   $http.get(httpUrl + 'run?session=' + User.session)
  //     .success(function(data, status, headers, config) {
  //       // Save the next user session
  //       User.session = data.corun.data.session;
  //       window.CORUN.saveCache('user_session', User.session);

  //       // Save the feed in the cache
  //       console.log(data.corun.data);
  //       window.CORUN.saveCache('feed', JSON.stringify(data.corun.data.runs));
        
  //       $scope.runs = data.corun.data.runs;
  //     })
  //     .error(function(data, status, headers, config) {
  //       console.log(status);
  //       console.log(data);
  //     });
  // }
  // else
  // {
  //   // _clearCache('feed');
  //   //$scope.runs = JSON.parse(_feed);
  // }
  // $scope.submit = function() {
  //   var post = {
  //     session: User.session,
  //     map_data: {0:1, 1:2, 2:3, 3:4}
  //   }
  //   $http.post(httpUrl + 'run', post)
  //     .success(function(data, status, headers, config) {
  //       _clearCache('feed');
  //       // Save the next user session
  //       User.session = data.corun.data.session;
  //       _saveUserSession(User.session);
  //       $location.path('/');
  //     });
  // };
  // $http.post(httpUrl + 'run').success(function(response) {
  //   console.log(response);
  //   console.log('alright');
  // });
}

function UserLoginCtrl($scope, $http, $location, UserService) {

  // var User = UserService;
  // User.session = window.CORUN.getCache('user_session');
  
  // if(!User.session)
  // {
  //   $location.path('/login');
  // }
  
  // $scope.submit = function() {
  //   var formData = {
  //     'email' : this.email,
  //     'password' : this.password
  //   };
  //   $http.post(httpUrl + 'login', formData)
  //     .success(function(data, status, headers, config) {
  //       //console.log(data);  
  //       if (data.corun.data.success) {
  //         // succefull login
  //         User.isLogged = true;
  //         User.username = formData.email;
  //         User.session = data.corun.data.session;

  //         // Save this shiiiit
  //         window.CORUN.setCache('user_session', User.session);
          
  //         $location.path('/');
  //       }
  //       else
  //       {
  //         User.isLogged = false;
  //         User.username = '';

  //       }
  //     })
  //     .error(function(data, status, headers, config) {
  //       alert(status);
  //       alert(headers);
  //       alert(data);
  //     });
  // };
}

function RunStoreController($scope, $http, $location, UserService) {

}


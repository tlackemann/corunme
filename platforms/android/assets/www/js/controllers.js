
'use strict';

var httpUrl = 'http://192.168.1.8/corunme-api/public/';
//var httpUrl = '//127.0.0.1/corunme-api/public/';

function _getUserSession(User)
{
  if (window.localStorage["user_session"])
  {
    return window.localStorage["user_session"];
  }
  return false;
}
function _saveUserSession(session)
{
  window.localStorage["user_session"] = session;
}
function _getCache(key)
{
  return (window.localStorage[key]) ? window.localStorage[key] : false;
}
function _saveCache(key, data)
{
  window.localStorage[key] = data;
}
function _clearCache(key)
{
  window.localStorage[key] = false;
}

function RunCtrl($scope, $http, $location, UserService) {
    var map = L.mapbox.map('map', 'tlackemann.map-zd9ny0b7');

    // This uses the HTML5 geolocation API, which is available on
    // most mobile browsers and modern browsers, but not in Internet Explorer
    //
    // See this chart of compatibility for details:
    // http://caniuse.com/#feat=geolocation
    if (!navigator.geolocation) {
        alert('geolocation is not available');
    } else {
            map.locate();
    }

    // Once we've got a position, zoom and center the map
    // on it, and add a single marker.
    map.on('locationfound', function(e) {
        map.fitBounds(e.bounds);

        map.markerLayer.setGeoJSON({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [e.latlng.lng, e.latlng.lat],
            },
            properties: {
                'marker-color': '#000',
                'marker-symbol': 'star-stroked'
            }
        });

        map.setZoom(15);
    });

    // If the user chooses not to allow their location
    // to be shared, display an error message.
    map.on('locationerror', function() {
        alert('position could not be found');
    });


    // test location
    // onSuccess Callback
//   This method accepts a `Position` object, which contains
//   the current GPS coordinates
//
function onSuccess(position) {
    var element = document.getElementById('geolocation');
    element.innerHTML = 'Latitude: '  + position.coords.latitude      + '<br />' +
                        'Longitude: ' + position.coords.longitude     + '<br />' +
                        '<hr />'      + element.innerHTML;
}

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

// Options: throw an error if no update is received every 30 seconds.
//
var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });
console.log('hi');
}

function IndexCtrl($scope, $http, $location, UserService) {
  var User = UserService;
  User.session = _getUserSession(User);
  
  if(!User.session)
  {
    $location.path('/login');
  }

  // Get runs
  var _feed = _getCache('feed');
  console.log(_feed);
  if (_feed == 'false')
  {
    $http.get(httpUrl + 'run?session=' + User.session)
      .success(function(data, status, headers, config) {
        // Save the next user session
        User.session = data.corun.data.session;
        _saveUserSession(User.session);

        // Save the feed in the cache
        console.log(data.corun.data);
        _saveCache('feed', JSON.stringify(data.corun.data.runs));
        
        $scope.runs = data.corun.data.runs;
      })
      .error(function(data, status, headers, config) {
        console.log(status);
        console.log(data);
      });
  }
  else
  {
    _clearCache('feed');
    $scope.runs = JSON.parse(_feed);
  }
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
  var User = UserService;
  if(_getUserSession(User))
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
        if (data.corun.data.success) {
          // succefull login
          User.isLogged = true;
          User.username = formData.email;
          User.session = data.corun.data.session;

          // Save this shiiiit
          window.localStorage["user_session"] = User.session;
          
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

function RunStoreController($scope, $http, $location, UserService) {

}


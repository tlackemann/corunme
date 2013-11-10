'use strict';

/* App Module */
var corunApp = angular.module('corun', ['corun']).

/* Configuration */
config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
	$httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  	
  	$routeProvider.
    	when('/', {templateUrl: 'partials/dashboard.html', controller: IndexCtrl}).
    	when('/run', {templateUrl: 'partials/run.html', controller: RunCtrl}).
		otherwise({redirectTo: '/login', templateUrl: 'partials/login.html', controller: UserLoginCtrl});
}]);

corunApp.factory('UserService', [function() {
	var sdo = {
		session: '',
		isLogged: false,
		username: ''
	};
	return sdo;
}]);
/**
 * Corun Object
 * Contains the essential pieces of the corun application in phonegap
 */

 (function() {
 	'use strict';

 	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

 	var CORUN = function() {
 		/**
 		 * Reference to self
 		 */
 		var self = this;

 		/**
 		 * Constants
 		 */
 		var CACHE_KEY_USER	= 'user';
 		var CACHE_KEY_RUN	= 'run';
 		var CACHE_KEY_FEED	= 'feed';
 		var CACHE_OAUTH_TOKEN	=	'oauth_token';

 		/**
 		 * Debugging
 		 * When enabled, events will be logged to the developer or javascript console
 		 */
 		this.debugging = true,

 		/**
 		 * Debugging level
 		 * The level at which functions should be logged. Technically every function is logged
 		 * however the stack trace will only log up to the level set (default: 5)
 		 */
 		this.debugLevel = 5,

 		/**
 		 * How many milliseconds to wait in between GPS polls (default: 2 seconds)
 		 */
 		this.runTimeout = 10000,

 		/**
 		 * How many milliseconds to wait in between GPS poll session saves (default: 6 seconds)
 		 */
 		this.runCacheTimeout = 30000,

 		/**
 		 * API URL
 		 */
 		this.apiUrl = 'http://192.168.1.8/corunme-api/public/',

 		/**
 		 * Map Type
 		 */
 		this.mapType = 'mapbox',

 		/**
 		 * Mapbox map id
 		 */
 		this.mapboxId = 'tlackemann.map-zd9ny0b7',

 		/**
 		 * Mapbox Static API URL
 		 */
 		this.mapboxApiUrl = 'http://api.tiles.mapbox.com/v3/' + this.mapboxId + '/',

 		/**
 		 * Map element ID
 		 */
 		this.mapElement = 'map',

 		/** 
 		 * Ajax Element ID
 		 */
 		this.ajaxElement = 'ajax-loader',

		/**
 		 * Submenu element id
 		 */
 		this.submenuElement = 'submenu',

 		/**
 		 * Readymenu element id
 		 */
 		this.readymenuElement = 'readymenu',

 		/**
 		 * Runmenu element id
 		 */
 		this.runmenuElement = 'runmenu',

 		/**
 		 * Seconds to wait before starting run
 		 */
 		this.countdownLimit = 3,

 		/**
 		 * Countdown messages
 		 */
 		this.countdownMessages = [
 			'On your mark',
 			'Get ready',
 			'Set',
 			'Go'
 		],

 		/**
 		 * Map instance
 		 */
 		this.map = false,
 		
 		/**
 		 * Cache instance
 		 */
 		this.cache = false,

 		/**
 		 * Protected: Geo listener started
 		 */
 		this._geoListener = false,

 		/**
 		 * Protected: Countdown seconds
 		 */
 		this._countdown = 0,

 		/**
 		 * Protected: Countdown instance
 		 */
 		this._countdownInstance = false,

 		/**
 		 * Protected: The current hash
 		 */
 		this._hash = '#/',

 		/**
 		 * Protected: Phonegap watch id for geolocation listening
 		 */
 		this._pgWatchId = false,

 		/**
 		 * Protected: Interval for the run toolbar (clock + distance)
 		 */
 		this._intervalRunToolbar = false,

 		/**
 		 * Protected: Run time in seconds
 		 */
 		this._runTime = 0,

 		/**
 		 * Protected: Total distance
 		 */
 		this._runDistance = 0.00,

 		/**
 		 * Protected: Run GPS data
 		 */
 		this._runGpsData = [],

 		/**
 		 * Protected: Corun session constants
 		 */
 		this._corunSession = false,

 		/**
 		 * Protected: Singleton error instance
 		 */
 		this._err = false,

 		/**
 		 * Protected: User cache
 		 */
 		this._userCache = false,

 		/**
 		 * Protected: Interval for map listener
 		 */
 		this._intervalMapListener = false,

 		/**
 		 * Protected: Instance of all corun maps on a page
 		 */
 		this._maps = [],

 		/**
 		 * Protected: Feed instance
 		 */
 		this._feed = false,

 		/**
 		 * Protected: Angular variables
 		 */
 		this._angular = false,

 		/**
 		 * Protected: OAuth Temporary Token
 		 */
 		this._oauthToken = false,


 		/**
 		 * Start the application, checks OAuth
 		 * @return CORUN
 		 */
 		this.init = function() {
 			// Debug the event
 			this.debug('Corun application started');

 			// Start the cache instance
 			this.cache = window.localStorage;

 			// Set the arguments
 			if (arguments.length === 1) {
 				this._angular = arguments[0];
 			}

 			// Start the listeners
 			this.initUrlListener();
 			this.initClickListener();

 			return this;
 		},

 		this.startAjaxLoader = function(message) {
 			
 			var element = document.getElementById(this.ajaxElement);
 			var imgElement = document.getElementById(this.ajaxElement + '-img');
 			// Show the background
 			element.style.display = 'block';
 			element.style.top = 0;
 			element.style.width = window.innerWidth + 'px';
 			element.style.height = window.innerHeight + 'px';

 			// Show the ajax loader
 			imgElement.style.display = 'block';
 			imgElement.style.marginLeft = ((window.innerWidth / 2) - 18) + 'px';
 			imgElement.style.marginTop = ((window.innerHeight / 2) - 18) + 'px';

 			// Show the message if applicable
 			this.updateAjaxLoader(message);
 		},

 		this.killAjaxLoader = function() {
 			var element = document.getElementById(this.ajaxElement);
 			element.style.display = 'none';

 		},

 		this.updateAjaxLoader = function(message) {
 			if (message) {
 				var textElement = document.getElementById(this.ajaxElement + '-message');
 				textElement.innerHTML = message;
 			}
 		},

 		this.oauthSignIn = function() {
 			this.debug('Signing in the user');

			var data = this.getAngularScope('user');

 			// Make the server request
 			if (!this._oauthToken && data) {

 				var url = this.getUrl('login');
 				var params = this.getAngularScope('user');

	 			// Start the ajax loader
	 			this.startAjaxLoader('Checking credentials');

	 			// Check Login credentials
 				this._angular.http.post(url, params)
					.success(function(data, status, headers, config) {
						self.debug('Fetched URL: ' + url);
						
						if (data.success == 1) {
							// Update the ajax loader
							self.updateAjaxLoader('Registering device');
						} else {
							// Kill the ajax loader
							self.killAjaxLoader();	
						}

						// Register the device through oauth
						

					})
					.error(function(data, status, headers, config) {
						// Kill the ajax loader
						self.killAjaxLoader();
						self.debug('There was an error retreiving the URL: ' + url, 'high');
					});
	 			

	 			
 			}

 			return false;
 		}

 		/**
 		 * Sets an angular.js scope variable
 		 * @param string name
 		 * @param string value
 		 * @return CORUN
 		 */
 		this.setAngularScope = function(name, value) {
 			if (this._angular && this._angular.scope) {
 				this._angular.scope[name] = value;
 			}

 			return this;
 		},

 		/**
 		 * Gets an angular.js scope variable
 		 * @param string name
 		 * @return string|boolean
 		 */
 		this.getAngularScope = function(name) {
 			if (this._angular && this._angular.scope && this._angular.scope[name]) {
 				return this._angular.scope[name];
 			}

 			return false;
 		},

 		/**
 		 * Returns the full API URL
 		 * @param string url
 		 * @return string
 		 */
 		this.getUrl = function(url) {
 			return this.apiUrl + url;
 		},

 		/**
 		 * Get Mapbox full Static API URL
 		 * @param string url
 		 * @return string
 		 */
 		this.getMapboxUrl = function(url) {
 			return this.mapboxApiUrl + url;
 		}

 		/**
 		 * Checks if a user session is present - used to validated the next server call
 		 * @return boolean
 		 */
 		this.checkUser = function() {
 			if (!this._userCache) {
 				this.getUser();
 			}

 			if (this.getUser('session') !== false) {
 				return true;
 			} else {
 				return false;
 			}
 		},

 		/**
 		 * Gets a users session data
 		 * @param string field
 		 * @return object
 		 */
 		this.getUser = function(field) {
			if (!this._userCache) {
				this._userCache = JSON.parse(this.getCache(CACHE_KEY_USER, true));
			}

			if (field && this._userCache[field] != undefined) {
				return this._userCache[field];
			} else if (field) {
				this.debug(field + ' not found', 'high');
				return false;
			}

			return this._userCache;
 			
 		},

 		/**
 		 * Sets a users session data
 		 * @param string s; The current session code
 		 * @param string field; The field to update specifically
 		 * @return void
 		 */
 		this.setUser = function(s, field) {
 			var user = false;
 			if (field) {
	 			// Debug the event
	 			this.debug('Saved user field "' + field + '" (' + s + ')');
 				user = this.getUser();
 				for (var i in user) {
 					if (i == field) {
 						user[i] = s;
 					}
 				}
 				this.setUser(user);
 			} else {
	 			// Debug the event
	 			this.debug('Saved user to cache');
 				this.setCache(CACHE_KEY_USER, JSON.stringify( s ));
 			}
 			// Save the internal cache because of a bug on redirect that doesn't pick up the cache yet
 			this._userCache = (user) ? user : s;
			return; 			
 		},

 		/**
 		 * Gets the feed
 		 * @return object
 		 */
 		this.getFeed = function() {
 			if (!this._feed) {
				this._feed = JSON.parse(this.getCache(CACHE_KEY_FEED, true));
			}

			return this._feed;
 		},

 		/**
 		 * Sets the feed
 		 * @return void
 		 */
 		this.setFeed = function(data) {
 			// Debug the event
 			this.debug('Saved feed to cache');
			this.setCache(CACHE_KEY_FEED, JSON.stringify( data ));
 			// Save to internal var cache because of redirect bug
 			this._feed = data;
			return; 
 		},

 		/**
 		 * Handles the data returned by a server call and returns the necessary pieces
 		 * @param object data
 		 * @return object
 		 */
 		this.handleData = function(data) {
 			if (data.corun !== undefined && data.corun.data !== undefined) {
 				
 				// Set the new user session
 				if (data.corun.data.user !== undefined && data.corun.data.user.session) {
 					this.setUser(data.corun.data.user.session, 'session');
 				}

 				var corun = {};
 				for (var i in data.corun.data) {
 					corun[i] = data.corun.data[i];
 				}

 				return corun;
 			}
 			return data;
 		},

 		/**
 		 * Gets a users current map data
 		 * @param boolean json
 		 * @return object
 		 */
 		this.getMapData = function(json) {
 			return (json) ? this.getCache(CACHE_KEY_RUN) : JSON.parse(this.getCache(CACHE_KEY_RUN, true));
 		},

 		/**
 		 * Sets a users current map data
 		 * @param string s; The current map data
 		 * @return void
 		 */
 		this.setMapData = function(s) {
 			this.setCache(CACHE_KEY_RUN, JSON.stringify(s));
			return; 			
 		},

 		/**
 		 * Returns the map time
 		 * @return int
 		 */
 		this.getMapTime = function() {
 			return this._runTime;
 		}

 		/**
 		 * Listen for url changes to load dynamic scripts
 		 * @return CORUN
 		 */
 		this.initUrlListener = function() {
 			// Debug the event
 			this.debug('URL listener started');

 			var hashChange = false;
 			setInterval(function() {
 				if (self._hash !== window.location.hash) {
 					self._hash = window.location.hash;
 					hashChange = true;
 				}
 				else {
 					hashChange = false;
 				}
 				if (hashChange) {
	 				switch(self._hash) {
	 					case '#/' :
	 						
	 						break;
	 					case '#/run' :

	 						break;
	 				}
	 			}
 			}, 500);

 			return this;
 		},

 		/**
 		 * Listen for touch events and clicks
 		 * @return CORUN
 		 */
 		this.initClickListener = function() {
 			this.debug('Click listener started');
 			// var marker = this.getElementByClassname('leaflet-marker-icon');
 			// return this;
 		},

 		this.initMapListener = function() {
 			this.debug('Map listener started');
 			this._intervalMapListener = setInterval(function() {
 				self._maps = self.getElementByClassname('map');
 				if (self._maps.length > 0) {
 					var mapData = self.getFeed();
 					var i = 0;
					// We can assume getFeed is returning the same map order so draw based on the same index
 					for (var map in mapData.runs) {
 						if (JSON.parse(mapData.runs[map].map_data).length > 0) {
 							self.initMap(null, self._maps[i].id).mapDrawRoute(JSON.parse(mapData.runs[map].map_data));
 						}
 						++i;
	 				}
	 				// Stop the listener
	 				clearInterval(self._intervalMapListener);
 				}
 			}, 500); // every 2 seconds
 		},

 		/**
 		 * Start the map listeners
 		 * @return CORUN
 		 */
 		this.initGeoListener = function() {
 			if (this.mapType == 'mapbox') {
			    this.map.on('locationfound', function(e) {
			        self.map.fitBounds(e.bounds);

		        	self.map.markerLayer.setGeoJSON({
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

			        var marker = self.getElementByClassname('leaflet-marker-icon')[0];

	 				marker.addEventListener('touchstart', function(e) {
		 				self.startCountdown();
				    });

				    marker.addEventListener('touchend', function(e) {
		 				self.stopCountdown();
				    });

				        self.map.setZoom(15);
				    });

			    this.map.on('locationerror', function() {
			        alert('position could not be found');
			    });
			}
		    
 			return this;
 		},

 		/**
 		 * Start the map
 		 * @param object options
 		 * @param string elementId
 		 * @return CORUN
 		 */
 		this.initMap = function(options, elementId) {
 			// Debug
			this.debug('Instantiating the map object');

			if (!elementId) {
				elementId = this.mapElement;
			}
 			if (this.mapType == 'mapbox') {
 				this._mbInitMap(options, elementId);
 			} else if (this.mapType == 'mapquest') {
 				this._mqInitMap(options);
 			}

		    return this;
 		},

 		/**
 		 * Start the mapbox
 		 * @param object options
 		 * @param string elementId
 		 * @return CORUN
 		 */
 		this._mbInitMap = function(options, elementId) {
 			// Set the options
 			if (!options) {
 				options = {
 					zoomControl: false
 				};
 			}
			
			this.map = L.mapbox.map(elementId, this.mapboxId, options);
 			
		    return this;
 		}

 		/**
 		 * Start the Mapquest
 		 * @param object options
 		 * @return CORUN
 		 */
 		this._mqInitMap = function(options) {
 			if (!options) {
 				options = {
 					elt: this.mapElement,
 					zoom: 15,
 					bestFitMargin: 1,
 					zoomOnDoubleClick: false,
 					mtype: 'map'
 				}
 			}
 			// Start the map
 			this.map = new MQA.TileMap(options);

 			return this;
 		}

		/**
 		 * Locate the user on the map
 		 * @return CORUN
 		 */
 		this.mapLocate = function() {
 			// Debug
			this.debug('Locating the current user');
 			if (this.mapType == 'mapbox') {
 				this._mbMapLocate();
 			} else if (this.mapType == 'mapquest') {
 				this._mqMapLocate();
 			}

		    return this;
 		},

 		/**
 		 * Locate the user on the mapbox
 		 * @return CORUN
 		 */
 		this._mbMapLocate = function() {
 			if (this.map) {
			    if (!navigator.geolocation) {
			        // Ask to change system prefs
			        //alert('geolocation is not available. please update your settings by going here');
			    } else {
	            	this.map.locate();
			    }

				this.initGeoListener();
			} else {
	 			// Debug
				this.debug('Map not initialized', 'high');
			}
			return this;
 		}

 		/**
 		 * Locate the user on the mapquest
 		 * @return CORUN
 		 */
 		this._mqMapLocate = function() {
 			if (this.map) {
			    if (!navigator.geolocation) {
			        // Ask to change system prefs
			        //alert('geolocation is not available. please update your settings by going here');
			    } else {
					navigator.geolocation.getCurrentPosition(function(position) {
		 				if (position) {
					    	var currentLocation = new MQA.Poi({
					    		lat: position.latitude,
					    		lng: position.longitude
					    	});
		 					self.map.addShape(currentLocation);
		 					self.map.setCenter({ lat: position.latitude, lng: position.longitude });
		 				}
		 			});
			    }

				this.initGeoListener();
			} else {
	 			// Debug
				this.debug('Map not initialized', 'high');
			}
			return this;
 		},

 		/**
 		 * Draw the route on the map
 		 * @param array mapdata
 		 * @return CORUN
 		 */
 		this.mapDrawRoute = function(mapdata) {
 			if (this.mapType == 'mapbox') {
 				this._mbMapDrawRoute(mapdata);
 			} else if (this.mapType == 'mapquest') {
 				this._mqMapDrawRoute(mapdata);
 			}
 		},

 		/**
 		 * Draw the route on mapquest
 		 * @param array mapdata
 		 * @return CORUN
 		 */
 		this._mqMapDrawRoute = function(mapdata) {
 			if (this.map) {

				var LatLng = [];

				MQA.withModule('directions', function() {
					for (var i in mapdata) {
	 					var data = mapdata[i];
	 					var coords = data['coords'];
	 					if (i % 30 == 0)
	 					{
							LatLng.push({ latLng: { lat: coords.latitude, lng: coords.longitude }});
							self.map.setCenter({ lat: coords.latitude, lng: coords.longitude });

	 					}
	 				}
					/*Uses the MQA.TileMap.addRoute function (added to the TileMap with the directions module)
					passing in an array of location objects as the only parameter.*/
					self.map.addRoute(LatLng);
				});
			}
			return this;
 		},

 		/**
 		 * Draw the route on mapbox
 		 * @param array mapdata
 		 * @return CORUN
 		 */
 		this._mbMapDrawRoute = function(mapdata) {
 			if (this.map) {

				var LatLng = [];

				var _lastLat = 0.00;
				var _lastLon = 0.00;
 				for (var i in mapdata) {
 					var data = mapdata[i];
 					var coords = data['coords'];
 					if (coords.accuracy >= 50 && coords.accuracy <= 100)
 					{
	 					// Some tom foolery going on here
	 					//var lonAccuracyCheck = Math.abs(Math.abs(_lastLon) - Math.abs(coords.longitude)) < 0.0002;
	 					//var latAccuracyCheck = Math.abs(Math.abs(_lastLat) - Math.abs(coords.latitude)) < 0.0002;
						//if (lonAccuracyCheck && latAccuracyCheck)
						//{
							LatLng.push(new L.LatLng(coords.latitude, coords.longitude));
						//}

	 					_lastLon = coords.longitude;
	 					_lastLat = coords.latitude;
 					}
 				}
 				var polylineOptions = {
 					color: 'red',
 					smoothFactor: 10,	
 				};

				var polyline = L.polyline(LatLng, polylineOptions).addTo(this.map);

				this.map.fitBounds(polyline.getBounds());
			}
			return this;
 		},

 		this.cacheMapImage = function() {
			var map = this.map;
			leafletImage(map, function(err, canvas) {
			    // now you have canvas
			    // example thing to do with that canvas:
			    var img = document.createElement('img');
			    var dimensions = map.getSize();
			    img.width = dimensions.x;
			    img.height = dimensions.y;
			    img.src = canvas.toDataURL();
			    document.getElementById('images').innerHTML = '';
			    document.getElementById('images').appendChild(img);
			});
 			return this;
 		}

 		/**
 		 * Begin the countdown and start the run if needed
 		 * @return CORUN
 		 */
 		this.startCountdown = function() {
 			this.debug('Countdown started');

 			self.startAnimateToolbar();

 			var readymenu = document.getElementById(self.readymenuElement);

 			readymenu.innerHTML = '<span>' + self.countdownMessages[0] + '</span>';
 			
 			this._countdownInstance = setInterval(function() {
 				++self._countdown;
 				
 				readymenu.innerHTML = '<span>' + self.countdownMessages[self._countdown] + '</span>';

 				if (self._countdown == self.countdownLimit)
 				{
 					self.startRun();
					self.startRunToolbar();
 				}
 			}, 1000);

 			return this;
 		},

 		/**
 		 * Stop the countdown and start the run if possible
 		 * @return CORUN
 		 */
 		this.stopCountdown = function() {
 			this.debug('Countdown stopped: ' + this._countdown + ' sec');

 			clearInterval(this._countdownInstance);

 			// Stop the run countdown if needed
 			if (this._countdown < this.countdownLimit) {
 				this.stopAnimateToolbar();
 			}

 			this._countdown = 0;

 			return this;
 		},

 		/**
 		 * Fades out the submenu to prevent leaving the map
 		 * @return CORUN
 		 */
 		this.startAnimateToolbar = function() {
 			var submenu = document.getElementById(this.submenuElement);
 			if (submenu.className.indexOf('fade-out') < 0) submenu.className += ' fade-out';

 			var readymenu = document.getElementById(this.readymenuElement);
 			if (readymenu.className.indexOf('fade-in') < 0) readymenu.className += ' fade-in';	
 		},

 		/**
 		 * Fades in the submenu
 		 * @return CORUN
 		 */
 		this.stopAnimateToolbar = function() {
 			var submenu = document.getElementById(this.submenuElement);
 			if (submenu.className.indexOf('fade-out') >= 0) submenu.className = submenu.className.replace('fade-out','');

 			var readymenu = document.getElementById(this.readymenuElement);
 			if (readymenu.className.indexOf('fade-in') >= 0) readymenu.className = readymenu.className.replace('fade-in','');
 		},

 		/**
 		 * Starts the clock and distance toolbar for the run
 		 * @return CORUN
 		 */
 		this.startRunToolbar = function() {

 			var runmenu = document.getElementById(this.runmenuElement);
 			if (runmenu.className.indexOf('fade-in') < 0) runmenu.className += ' fade-in';	

 			var readymenu = document.getElementById(this.readymenuElement);
 			if (readymenu.className.indexOf('fade-in') >= 0) readymenu.className = readymenu.className.replace('fade-in','');

 			this._intervalRunToolbar = setInterval(function() {
 				self._runTime += 1;
 				document.getElementById('distance').innerHTML = self._runDistance + 'mi';
 				document.getElementById('time').innerHTML = self._runTime + 'sec';
 				// Store the current in localstorage, save every minute
 				if (self._runTime % (self.runCacheTimeout / 1000) == 0) {

 					self.setMapData(self._runGpsData);
 					this.debug('Saved run session cache');
 					this.debug(self.getMapData());
 				}
 			}, 1000);
 			return this;
 		},

 		/**
 		 * Stops the clock and distance toolbar
 		 * @return CORUN
 		 */
 		this.stopRunToolbar = function() {
 			clearInterval(this._intervalRunToolbar);

 			return this;
 		},

 		/**
 		 * Start a run
 		 * @return CORUN
 		 */
 		this.startRun = function() {
 			this.debug('Run started');
 			// Restart GPS data (for now)
 			this._runGpsData = [];
 			
 			// Start the geo listener
 			this._pgWatchId = setInterval(function() {
 				self._watchPosition()
 			}, this.runTimeout);

 		},

 		/**
 		 * Stores the position of the device based on a given interval
 		 * @return CORUN
 		 */
 		this._watchPosition = function() {
 			navigator.geolocation.getCurrentPosition(function(position) {
 				if (position) {
	 				this.debug(position);
	 				// @TODO Check for accuracy, duplicate positions (within a certain threshold)

	 				// Store the position
	 				self._runGpsData.push(position);
 				}
 			}, function(error) {

 			}, {
 				enableHighAccuracy: true
 			});

 			return this;
 		}

 		/**
 		 * Stops a run
 		 * @return CORUN
 		 */
 		this.stopRun = function() {
 			this.debug('Stopping run');
 			
 			this.stopRunToolbar();

 			clearInterval(this._pgWatchId);

 			this.setMapData(this._runGpsData);

 			this._runTime = 0;

 			return this;
 		},

 		/**
 		 * Set cache
 		 * @param string key
 		 * @param string text
 		 * @return CORUN
		 */
		this.setCache = function(key, data) {
			// Set localStorage
			this.cache[key] = data;
			// Also define angular session
			if (this._corunSession) this._corunSession.push({key : data});
			return this;
		},

		/**
 		 * Get cache
 		 * @param string key
 		 * @param boolean json
 		 * @return string|json
		 */
		this.getCache = function(key, json) {
			this.debug('Getting "' + key + '" from cache');
			if (!json) json = false;

			// Check localStorage first
			if (this.cache[key] !== undefined) {
				return this.cache[key];
			// Resort to angular (experimental)
			} else if (this._corunSession) {
				for(var i in this._corunSession) {
					var data = this._corunSession[i];
					if (data[key] !== undefined) {
						return data[key];
					}
				}
			}
			return (json) ? '{}' : '';
		},

		/**
 		 * Clear cache
 		 * @param string key
 		 * @return CORUN
		 */
		this.clearCache = function(key) {
			if (this._corunSession) {
				for(var i in this._corunSession) {
					var data = this._corunSession[i];
					if (data[key] !== undefined) {
						data[key];
					}
				}
			// Resort to localStorage
			} else if (this.cache[key] !== undefined) {
				this.cache[key] = null;
			}
			return this;
		},

		/**
		 * Returns an element based on it's classname
		 * @param string classname
		 * @return Element
		 */
		this.getElementByClassname = function(classname) {
		    var elems = document.getElementsByTagName('*'), i;
		    var returnElems = [];
		    for (i in elems) {
		        if((' ' + elems[i].className + ' ').indexOf(' ' + classname + ' ') > -1) {
		            if (i && elems[i] != undefined) returnElems.push(elems[i]);
		        }
		    }
			
			return returnElems;
		},

		/**
		 * OAuth2 function to make a token request
		 * @return string
		 */
		this.oauth2GetToken = function() {
			this._sendHttp(this.getUrl('token'));
		},

		/**
		 * Sends a request to the specified URL
		 * @param string url
		 * @param string type
		 * @return json|string
		 */
		this._sendHttp = function(url, type, params, successFunc) {
			if (!type) {
				type = 'get';
			}
			if (!params) {
				params = {}
			}
			if (this._angular.http) {
				switch (type) {
					case 'post' :
						this._angular.http.post(url, params)
							.success(function(data, status, headers, config) {
								self.debug('Fetched URL: ' + url);
								if (successFunc) {
									successFunc();
								}
								return data;
							})
							.error(function(data, status, headers, config) {
								// Kill the ajax loader if one is present
								self.killAjaxLoader();
								self.debug('There was an error retreiving the URL: ' + url, 'high');
							});
						break;
					case 'get' :

						break;
				}
			}
			return false;
		}

		/**
		 * Logs a message to the console
		 * @param string message
		 * @param string priority; Low (Default) | Normal | High
		 * @param boolean labels
		 * @param boolean timestamps
		 * @return CORUN
		 */
		this.debug = function(message, priority, labels, timestamps) {
			if (this.debugging) {

				// Throw an error to trigger the stack
				if (!this._err) this._err = new Error();
				// Count the stack objects
				var count = 0;
				if (this._err.stack) {
					// split by newlines, subtract the header (Error at) and the footer (Error url)
					count = (this._err.stack.split("\n").length) - 2;
				}

				// Display the debug log if we're within the debugLevel scope
				if (count <= this.debugLevel) {
					if (!priority) {
						priority = 'low';
					}
					if (!labels) {
						labels = true;
					}
					if (!timestamps) {
						timestamps = true;
					}

					var date = new Date();
					var timestamp = (timestamps) ? '[' +  date.toUTCString() + '] ' : '';

					switch(priority) {
						case 'low' :
							var label = (labels) ? timestamp + 'Log: ' : timestamp;
							console.log(label + message);
							break;

						case 'normal' :
							var label = (labels) ? timestamp + 'Warning: ' : timestamp;
							console.warn(label + message);
							break;

						case 'high' :
							var label = (labels) ? timestamp + 'Error: ' : timestamp;
							console.error(label + message);
							break;
					}
				}
			}

			return this;
		}

		return this;
 	};

 	// Run it! (Puns!)
 	if (!window.CORUN) {
 		window.CORUN = new CORUN();
 	} else {
 		window._CORUN = new CORUN();
 	}
 })();
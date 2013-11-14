/**
 * Corun Object
 * Contains the essential pieces of the corun application in phonegap
 */
 (function() {
 	'use strict';

 	var CORUN = function() {
 		/**
 		 * Reference to self
 		 */
 		var self = this;

 		/**
 		 * Constants
 		 */
 		var CACHE_KEY_USER = 'user';
 		var CACHE_KEY_RUN = 'run';

 		/**
 		 * How many milliseconds to wait in between GPS polls (default: 5 seconds)
 		 */
 		this.runTimeout = 1000,

 		/**
 		 * How many milliseconds to wait in between GPS poll session saves (default: 5 seconds)
 		 */
 		this.runCacheTimeout = 1000,

 		/**
 		 * API URL
 		 */
 		this.apiUrl = 'http://192.168.1.11/corunme-api/public/',

 		/**
 		 * Map element ID
 		 */
 		this.mapElement = 'map',

 		/**
 		 * Mapbox map id
 		 */
 		this.mapboxId = 'tlackemann.map-zd9ny0b7',

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
 		 * Start the application
 		 * @return CORUN
 		 */
 		this.init = function(session) {

 			// Start the cache instance
 			this.cache = window.localStorage;

 			// Start the corun session storage
 			this._corunSession = (session) ? session : false;

 			// Start the listeners
 			this.initUrlListener();

 			return this;
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
 		 * Checks if a user session is present - used to validated the next server call
 		 * @return boolean
 		 */
 		this.checkUser = function() {
 			var session = this.getCache(CACHE_KEY_USER);

 			if (session !== '') {
 				return true;
 			}
 			else {
 				return false;
 			}
 		},

 		/**
 		 * Gets a users session data
 		 * @param string field
 		 * @return object
 		 */
 		this.getUser = function(field) {
 			if (this.checkUser) {
 				if (field) {
 					var cache = JSON.parse(this.getCache(CACHE_KEY_USER));
 					return (cache[field] != undefined) ? cache[field] : '';
 				}	
 				return JSON.parse(this.getCache(CACHE_KEY_USER));
 			}
 		},

 		/**
 		 * Sets a users session data
 		 * @param string s; The current session code
 		 * @param string field; The field to update specifically
 		 * @return void
 		 */
 		this.setUser = function(s, field) {
 			if (field)
 			{

 			}
 			else
 			{
 				this.setCache(CACHE_KEY_USER, JSON.stringify( s ));
 			}
			return; 			
 		}

 		/**
 		 * Gets a users current map data
 		 * @param boolean json
 		 * @return object
 		 */
 		this.getMapData = function(json) {
 			return (json) ? this.getCache(CACHE_KEY_RUN) : JSON.parse(this.getCache(CACHE_KEY_RUN));
 		},

 		/**
 		 * Sets a users current map data
 		 * @param string s; The current map data
 		 * @return void
 		 */
 		this.setMapData = function(s) {
 			this.setCache(CACHE_KEY_RUN, JSON.stringify(s));
			return; 			
 		}

 		/**
 		 * Listen for url changes to load dynamic scripts
 		 * @return CORUN
 		 */
 		this.initUrlListener = function() {
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
	 						if (self._pgWatchId) {
	 							navigator.geolocation.clearWatch(self._pgWatchId);
	 						}
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
 			console.log('Click listener started');

 			var marker = this.getElementByClassname('leaflet-marker-icon');
 			
 			return this;
 		},

 		/**
 		 * Star the map listeners
 		 * @return CORUN
 		 */
 		this.initGeoListener = function() {
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

		    
 			return this;
 		},

 		/**
 		 * Start the mapbox
 		 * @return CORUN
 		 */
 		this.initMap = function() {
 			// Start the map
			this.map = L.mapbox.map(this.mapElement, this.mapboxId, {
				zoomControl: false 
			});

		    return this;
 		},

		/**
 		 * Locate the user on the mapbox
 		 * @return CORUN
 		 */
 		this.mapLocate = function() {
 			if (this.map) {
			    if (!navigator.geolocation) {
			        // Ask to change system prefs
			        //alert('geolocation is not available. please update your settings by going here');
			    } else {
	            	this.map.locate();
			    }

				this.initGeoListener();
			}
			return this;
 		},

 		/**
 		 * Draw the route on mapbox
 		 * @param array mapdata
 		 * @return CORUN
 		 */
 		this.mapDrawRoute = function(mapdata) {
 			console.log(mapdata);
 			if (this.map) {

				var LatLng = [];

 				for (var i in mapdata) {
 					var data = mapdata[i];
 					var coords = data['coords'];

 					LatLng.push(new L.LatLng(coords.latitude, coords.longitude));
 				}

				var polyline = L.polyline(LatLng, {color: 'red'}).addTo(this.map);

				this.map.fitBounds(polyline.getBounds());
			}
			return this;
 		},

 		/**
 		 * Begin the countdown and start the run if needed
 		 * @return CORUN
 		 */
 		this.startCountdown = function() {
 			console.log('Countdown started');

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
 			console.log('Countdown stopped: ' + this._countdown + ' sec');

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
 			console.log('Run started');
 			// Restart GPS data (for now)
 			this._runGpsData = [];
 			
 			// Start the geo listener
 			this._pgWatchId = setInterval(function() {
 				self._watchPosition()
 			}, this.runTimeout);

 			// this._pgWatchId = navigator.geolocation.watchPosition(function(position) {
 			// 	if (position) {
	 		// 		console.log(position);

	 		// 		self._runGpsData.push(position);

	 		// 		// Store the current in localstorage, save every minute
	 		// 		if ((self._runTime + 1) % (self.runCacheTimeout / 1000) == 0) {

	 		// 			self.setMapData(self._runGpsData);
	 		// 			console.log('Saved run session cache');
	 		// 			console.log(self.getMapData());
	 		// 		}
 			// 	}
 			// },
 			// function(error) {
 			// 	// On error
 			// 	console.log('code: '    + error.code    + '\n' +
    //       		'message: ' + error.message + '\n');

 			// }, { timeout: this.runTimeout });
 		},

 		this._watchPosition = function() {
 			navigator.geolocation.getCurrentPosition(function(position) {
 				if (position) {
	 				console.log(position);

	 				self._runGpsData.push(position);

	 				// Store the current in localstorage, save every minute
	 				if ((self._runTime + 1) % (self.runCacheTimeout / 1000) == 0) {

	 					self.setMapData(self._runGpsData);
	 					console.log('Saved run session cache');
	 					console.log(self.getMapData());
	 				}
 				}
 			});
 		}

 		/**
 		 * Stops a run
 		 * @return CORUN
 		 */
 		this.stopRun = function() {
 			console.log('Stopping run');
 			
 			this.stopRunToolbar();

 			clearInterval(this._pgWatchId);
 			//navigator.geolocation.clearWatch(this._pgWatchId);

 			this.setMapData(this._runGpsData);

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
			if (!json) json = false;
			// Check angular first
			if (this._corunSession) {
				for(var i in this._corunSession) {
					var data = this._corunSession[i];
					if (data[key] !== undefined) {
						return data[key];
					}
				}
			// Resort to localStorage
			} else if (this.cache[key] !== undefined) {
				return this.cache[key];
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

		this.getElementByClassname = function(classname) {
		    var elems = document.getElementsByTagName('*'), i;
		    var returnElems = [];
		    for (i in elems) {
		        if((' ' + elems[i].className + ' ').indexOf(' ' + classname + ' ') > -1) {
		            if (i && elems[i] != undefined) returnElems.push(elems[i]);
		        }
		    }
			
			return returnElems;
		}

		return this;
 	};

 	if (!window.CORUN) {
 		window.CORUN = new CORUN();
 	} else {
 		window._CORUN = new CORUN();
 	}
 })();
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
 		 * API URL
 		 */
 		this.apiUrl = 'http://192.168.1.8/corunme-api/public/',

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
 		 * Seconds to wait before starting run
 		 */
 		this.countdownLimit = 3,

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
 		 * Start the application
 		 * @return CORUN
 		 */
 		this.init = function() {

 			// Start the cache instance
 			this.cache = window.localStorage;

 			// Start the listeners
 			this.initUrlListener();

 			return this;
 		},

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
 		 * Test Mapbox function
 		 * @return CORUN
 		 */
 		this.initGeoListener = function() {
		    // Once we've got a position, zoom and center the map
		    // on it, and add a single marker.
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
			        //console.log(e);
	 				self.startCountdown();
					//alert(e.changedTouches[0].pageX) // alert pageX coordinate of touch point
					//e.preventDefault();
			    });

			    marker.addEventListener('touchend', function(e) {
			        //console.log(e);
	 				self.stopCountdown();
					//alert(e.changedTouches[0].pageX) // alert pageX coordinate of touch point
					//e.preventDefault();
			    });

			        self.map.setZoom(15);
			    });


		    // If the user chooses not to allow their location
		    // to be shared, display an error message.
		    this.map.on('locationerror', function() {
		        alert('position could not be found');
		    });

		    
 			return this;
 		},

 		/**
 		 * Start, cache, and render mapbox
 		 * @return CORUN
 		 */
 		this.initMap = function() {
 			// Start the map
			this.map = L.mapbox.map(this.mapElement, this.mapboxId);
			

		    if (!navigator.geolocation) {
		        // Ask to change system prefs

		        //alert('geolocation is not available. please update your settings by going here');
		    } else {
            	this.map.locate();
		    }

			this.initGeoListener();

		    return this;
 		},

 		/**
 		 * Begin the countdown and start the run if needed
 		 * @return CORUN
 		 */
 		this.startCountdown = function() {
 			console.log('Countdown started');

 			self.startAnimateToolbar();

 			this._countdownInstance = setInterval(function() {
 				++self._countdown;

 				switch(self._countdown) {
 					case 1:
 						document.getElementById(self.readymenuElement).innerHTML = '<span>Get ready</span>';
 						break;
 					case 2:
 						document.getElementById(self.readymenuElement).innerHTML = '<span>Get set</span>';
 						break;
 					case 3:
 						document.getElementById(self.readymenuElement).innerHTML = '<span>Go!!</span>';
 						// Start ther run & running data bar
 						self.startRun();
 						self.startRunToolbar();
 						break;
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
 			this._intervalRunToolbar = setInterval(function() {
 				self._runTime += 1;
 				document.getElementById(self.readymenuElement).innerHTML = '<span>Distance: 0.00 | Time ' + self._runTime + ' seconds</span>';
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

 			// Start the geo listener
 			this._pgWatchId = navigator.geolocation.watchPosition(function(position) {
 				console.log(position);


 			},
 			function(error) {
 				// On error
 				console.log('code: '    + error.code    + '\n' +
          		'message: ' + error.message + '\n');

 			}, { timeout: 30000 });
 		},

 		/**
 		 * Set cache
 		 * @param string key
 		 * @param string text
 		 * @return CORUN
		 */
		this.setCache = function(key, data) {
			this.cache[key] = data;
			return this;
		},

		/**
 		 * Get cache
 		 * @param string key
 		 * @return string
		 */
		this.getCache = function(key) {
			if (this.cache[key] !== undefined) {
				return this.cache[key];
			}
			return '';
		},

		/**
 		 * Clear cache
 		 * @param string key
 		 * @return CORUN
		 */
		this.clearCache = function(key) {
			if (this.cache[key] !== undefined) {
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
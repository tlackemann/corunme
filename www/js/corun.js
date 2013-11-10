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
 		 * Cache instance
 		 */
 		this.cache = false,

 		/**
 		 * Map element ID
 		 */
 		this.mapElement = 'map',

 		/**
 		 * Map instance
 		 */
 		this.map = false,

 		/**
 		 * Mapbox map id
 		 */
 		this.mapboxId = 'tlackemann.map-zd9ny0b7',
 		
 		/**
 		 * Protected: Geo listener started
 		 */
 		this._geoListener = false,

 		/**
 		 * Start the application
 		 * @return CORUN
 		 */
 		this.init = function() {

 			// Start the cache instance
 			this.cache = window.localStorage;

 			// Start the listeners
 			this.initUrlListener()

 			return this;
 		},

 		/**
 		 * Listen for url changes to load dynamic scripts
 		 * @return CORUN
 		 */
 		this.initUrlListener = function() {
 			return this;
 		}

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

		        self.map.setZoom(15);
		    });

		    // If the user chooses not to allow their location
		    // to be shared, display an error message.
		    this.map.on('locationerror', function() {
		        alert('position could not be found');
		    });
 			return this;
 		}

 		/**
 		 * Start, cache, and render mapbox
 		 * @return CORUN
 		 */
 		this.initMap = function() {
 			// Start the map if not already started
 			if (!this.map) {
 				this.map = L.mapbox.map(this.mapElement, this.mapboxId);

			    if (!navigator.geolocation) {
			        // Ask to change system prefs

			        //alert('geolocation is not available. please update your settings by going here');
			    } else {
	            	this.map.locate();
			    }
 			}
 			// Start the geolistener if not already started
 			if (!this._geoListener) {
 				this.initGeoListener();
 				this._geoListener = true;
 			}

		    return this;
 		}

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
			if (this.cache[key] !== undefined)
			{
				return this.cache[key];
			}
			return '';
		}

		/**
 		 * Clear cache
 		 * @param string key
 		 * @return CORUN
		 */
		this.clearCache = function(key) {
			if (this.cache[key] !== undefined)
			{
				this.cache[key] = null;
			}
			return this;
		}

		return this;
 	};

 	if (!window.CORUN) {
 		window.CORUN = new CORUN();
 	} else {
 		window._CORUN = new CORUN();
 	}
 })();
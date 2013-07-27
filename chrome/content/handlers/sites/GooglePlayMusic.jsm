"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeBasedHandler.jsm");

BeQuiet.GooglePlayMusic = function(aBrowser) {
	const description = {
		play : {
			selector : '#player [data-id="play-pause"]'
		},

		pause : {
			selector : '#player [data-id="play-pause"]'
		},

		next : {
			selector : '#player [data-id="forward"]'
		},

		prev : {
			selector : '#player [data-id="rewind"]'
		},

		playing : {
			selector : '#player [data-id="play-pause"]',
			attrName : 'class',
			testValue : /playing/
		},

		title : {
			selector : '#playerSongInfo',
			subselector : '#playerSongTitle',
		},

		artist : {
			selector : '#playerSongInfo',
			subselector : '#player .player-artist',
		},

		album : {
			selector : '#playerSongInfo',
			subselector : '#player .player-album',
		},
      	
    	albumArt: {
      		selector: '#player',
      		subselector: '#playingAlbumArt',
      		attrName: 'src'
      	}
	};

	let self = this;

	self.base = BeQuiet.NodeBasedHandler;
	self.base(aBrowser, description);
};

BeQuiet.GooglePlayMusic.prototype = Object.create(BeQuiet.NodeBasedHandler.prototype);
BeQuiet.GooglePlayMusic.prototype.constructor = BeQuiet.GooglePlayMusic;
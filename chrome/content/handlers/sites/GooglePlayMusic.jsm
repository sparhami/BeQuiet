"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeBasedHandler.jsm");

BeQuiet.GooglePlayMusic = function(aBrowser) {
	const description = {
		stateChange : {
			selector : '#player [data-id="play-pause"]',
			attrName : 'class'
		},
		
		ratingChange: {
      		selector: '#player .player-rating-container [title="Thumbs up"]',
  			attrName: 'class'
     	},
		
     	trackChange : {
			selector : '#playerSongTitle',
			attrName : 'href'
		},
		
		state : {
			selector : '#player [data-id="play-pause"]',
			attrName : 'class',
			testValue : 'playing'
		},
		
		rating : {
      		selector: '#player .player-rating-container [title="Thumbs up"]',
  			attrName: 'class',
      		testValue: 'selected'
		},

		title : {
			selector : '#playerSongTitle'
		},

		artist : {
			selector : '#player .player-artist'
		},

		album : {
			selector : '#player .player-album'
		},
      	
    	albumArt: {
      		selector: '#playingAlbumArt'
      	},
      	
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
		
		like : {
			selector : '#player .player-rating-container [title="Thumbs up"]'
		}
	};

	let self = this;

	self.base = BeQuiet.NodeBasedHandler;
	self.base(aBrowser, description);
};

BeQuiet.GooglePlayMusic.prototype = Object.create(BeQuiet.NodeBasedHandler.prototype);
BeQuiet.GooglePlayMusic.prototype.constructor = BeQuiet.GooglePlayMusic;
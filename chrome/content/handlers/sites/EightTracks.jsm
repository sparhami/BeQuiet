"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeBasedHandler.jsm");

BeQuiet.EightTracks = function(aBrowser) {
	const description = {
     	play: {
     		selector: '#player_play_button'
     	},
     	
     	pause: {
     		selector: '#player_pause_button'
     	},
     	
     	next: {
     		selector: '#player_skip_button'
     	},

     	playing: {
    		selector:  '#player_play_button',
      		attrName:  'style',
      		testValue: /display: none;/
     	},
     	
     	title: {
      		selector: '#now_playing',
      		subselector: '.title_artist .t'
      	},
      	
     	artist: {
      		selector: '#now_playing',
      		subselector: '.title_artist .a'
      	},
      	
    	album: {
      		selector: '#now_playing',
      		subselector: '.album .detail'
      	}
	};
	
	let self = this;
	
	self.base = BeQuiet.NodeBasedHandler;
	self.base(aBrowser, description);
};

BeQuiet.EightTracks.prototype = Object.create(BeQuiet.NodeBasedHandler.prototype);
BeQuiet.EightTracks.prototype.constructor = BeQuiet.EightTracks;
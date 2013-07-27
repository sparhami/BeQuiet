"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeBasedHandler.jsm");

BeQuiet.EightTracks = function(aBrowser) {
	const description = {
		stateChange: {
    		selector: '#player_play_button',
      		attrName: 'style'
     	},
     	
    	ratingChange: {
    		selector: '#now_playing',
      		subselector: '.fav',
      		attrName: 'class'
     	},
     	
     	trackChange: {
    		selector:  '#now_playing',
      		subselector:  '.title_artist .t'
     	},
     	
     	state: {
    		selector: '#player_play_button',
      		attrName: 'style',
      		testValue: /display: none;/
     	},
     	
    	rating: {
    		selector: '#now_playing .fav',
      		attrName: 'class',
      		testValue: 'active'
     	},
     	
     	title: {
      		selector: '#now_playing .title_artist .t'
      	},
      	
     	artist: {
      		selector: '#now_playing .title_artist .a'
      	},
      	
    	album: {
      		selector: '#now_playing .album .detail'
      	},
      	
    	albumArt: {
      		selector: '#player_box .cover',
      	},
      	
    	play: {
     		selector: '#player_play_button'
     	},
     	
     	pause: {
     		selector: '#player_pause_button'
     	},
     	
     	next: {
     		selector: '#player_skip_button'
     	}
	};
	
	let self = this;
	
	self.base = BeQuiet.NodeBasedHandler;
	self.base(aBrowser, description);
};

BeQuiet.EightTracks.prototype = Object.create(BeQuiet.NodeBasedHandler.prototype);
BeQuiet.EightTracks.prototype.constructor = BeQuiet.EightTracks;
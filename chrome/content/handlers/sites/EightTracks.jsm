"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeBasedHandler.jsm");

BeQuiet.EightTracks = function(aBrowser) {
	const description = {
	    control: {
	     	play:  '#player_play_button',
	     	pause: '#player_pause_button',
	     	next:  '#player_skip_button',
	    },
	    	     
	    status: {
	    	playing: {
	    		selector:  '#player_play_button',
	      		attrName:  'style',
	      		testValue: /display: none;/
	     	},
	     	
	     	title: {
	      		selector: ''
	      	}
	    }
	};
	
	let self = this;
	
	self.base = BeQuiet.NodeBasedHandler;
	self.base(aBrowser, description);
};

BeQuiet.EightTracks.prototype = Object.create(BeQuiet.NodeBasedHandler.prototype);
BeQuiet.EightTracks.prototype.constructor = BeQuiet.EightTracks;
"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeBasedHandler.jsm");

BeQuiet.Grooveshark = function(aBrowser) {
	const description = {
	    control: {
	     	play:  '#play-pause',
	     	pause: '#play-pause',
	     	next:  '#play-next',
	     	prev:  '#play-prev',
	     	like:  '#np-fav'
	    },
	    	     
	    status: {
	    	playing: {
	    		selector:  '#play-pause',
	      		attrName:  'class',
	      		testValue: /playing/
	     	},
	     
	     	liked: {	
	      		selector:  '#np-fav',
      			attrName:  'class',
	      		testValue: /active/
	     	},
	     	
	     	title: {
	      		selector: '#now-playing-metadata',
	      		subselector: '.song'
	      	},
	      	
	    	artist: {
	      		selector: '#now-playing-metadata',
	      		subselector: '.artist'
	      	}
	    }
	};
	
	let self = this;
	
	self.base = BeQuiet.NodeBasedHandler;
	self.base(aBrowser, description);
};

BeQuiet.Grooveshark.prototype = Object.create(BeQuiet.NodeBasedHandler.prototype);
BeQuiet.Grooveshark.prototype.constructor = BeQuiet.Grooveshark;
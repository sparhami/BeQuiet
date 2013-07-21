"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeBasedHandler.jsm");

BeQuiet.Pandora = function(aBrowser) {
	const description = {
     	play: {
     		selector: '.playButton'
     	},
     	
     	pause: {
     		selector: '.pauseButton'
     	},
     	
     	next: {
     		selector: '.skipButton'
     	},
     	
     	like: {
     		selector: '.thumbUpButton'
     	},
     		
    	playing: {
    		selector:  '.playButton',
      		attrName:  'style',
      		testValue: /display: none;/
     	},
     
     	liked: {
      		selector:  '.thumbUpButton',
  			attrName:  'class',
      		testValue: /indicator/
     	},
     	
      	title: {
      		selector: '.songTitle'
      	},
      	
     	artist: {
      		selector: '.artistSummary'
      	},
      	
     	album: {
      		selector: '.albumTitle'
      	}
	};
	
	let self = this;
	
	self.base = BeQuiet.NodeBasedHandler;
	self.base(aBrowser, description);
};

BeQuiet.Pandora.prototype = Object.create(BeQuiet.NodeBasedHandler.prototype);
BeQuiet.Pandora.prototype.constructor = BeQuiet.Pandora;
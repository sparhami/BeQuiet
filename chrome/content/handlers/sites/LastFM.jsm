"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeBasedHandler.jsm");

BeQuiet.LastFM = function(aBrowser) {
	const description = {
		stateChange: {
    		selector: '#webRadio',
      		attrName: 'class'
     	},
     
     	ratingChange: {	
      		selector: '#radioPlayer',
  			attrName: 'class'
     	},
     	
     	trackChange: {
      		selector: '#radioContent .track',
      		subselector: 'a'
     	},
     	
    	state: {
    		selector: '#webRadio',
      		attrName: 'class',
      		testValue: 'playing'
     	},
     
     	rating: {	
      		selector: '#radioPlayer',
  			attrName: 'class',
      		testValue: 'loved'
     	},
     	
    	title: {
      		selector: '#radioContent .track a',
      	},
      	
     	artist: {
      		selector: '#radioContent .artist a',
      	},
      	
     	album: {
      		selector: '#radioContent .album a'
      	},
      	
    	albumArt: {
      		selector: '#trackAlbum .albumCover img',
      	},
      	
     	play: {
     		selector: '#radioControlPlay'
     	},
     	
     	pause: {
     		selector: '#radioControlPause'
     	},
     	
     	next: {
     		selector: '#radioControlSkip'
     	},
     	
     	like: {
     		selector: '#radioControlLove'
     	},
	};
	
	let self = this;
	
	self.base = BeQuiet.NodeBasedHandler;
	self.base(aBrowser, description);
};

BeQuiet.LastFM.prototype = Object.create(BeQuiet.NodeBasedHandler.prototype);
BeQuiet.LastFM.prototype.constructor = BeQuiet.LastFM;
"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeBasedHandler.jsm");

BeQuiet.LastFM = function(aBrowser) {
	const description = {
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
	    	     
    	playing: {
    		selector:  '#webRadio',
      		attrName:  'class',
      		testValue: /playing/
     	},
     
     	liked: {	
      		selector:  '#radioPlayer',
  			attrName:  'class',
      		testValue: /loved/
     	},
     	
     	title: {
      		selector: '#radioContent .track',
      		subselector: 'a'
      	},
      	
     	artist: {
      		selector: '#radioContent .artist',
      		subselector: 'a'
      	},
      	
     	album: {
      		selector: '#radioContent .album',
      		subselector: 'a'
      	},
      	
      	albumArt: {
      		selector: '#webRadio',
      		subselector: '#trackAlbum .albumCover img',
  			attrName: 'src'
      	}
	};
	
	let self = this;
	
	self.base = BeQuiet.NodeBasedHandler;
	self.base(aBrowser, description);
};

BeQuiet.LastFM.prototype = Object.create(BeQuiet.NodeBasedHandler.prototype);
BeQuiet.LastFM.prototype.constructor = BeQuiet.LastFM;
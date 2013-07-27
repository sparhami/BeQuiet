"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeBasedHandler.jsm");

BeQuiet.Pandora = function(aBrowser) {
	const description = {
    	stateChange: {
    		selector: '#playbackControl .playButton',
      		attrName: 'style'
     	},
     
     	ratingChange: {
      		selector: '#playbackControl .thumbUpButton',
  			attrName: 'class'
     	},
     	
     	trackChange: {
      		selector: '#playerBar .playerBarSong',
  			attrName: 'href'
     	},
     	
    	state: {
    		selector: '#playbackControl .playButton',
      		attrName: 'style',
      		testValue: /display: none;/
     	},
     
     	rating: {
      		selector: '#playbackControl	 .thumbUpButton',
  			attrName: 'class',
      		testValue: 'indicator'
     	},
     	
      	title: {
      		selector: '#playerBar .playerBarSong'
      	},
      	
     	artist: {
      		selector: '#playerBar .playerBarArtist'
      	},
      	
     	album: {
      		selector: '#playerBar .playerBarAlbum'
      	},
      	
      	albumArt: {
      		selector: '#playerBar .albumArt img'
      	},
      	
     	play: {
     		selector: '#playbackControl .playButton'
     	},
     	
     	pause: {
     		selector: '#playbackControl .pauseButton'
     	},
     	
     	next: {
     		selector: '#playbackControl .skipButton'
     	},
     	
     	like: {
     		selector: '#playbackControl .thumbUpButton'
     	}
	};
	
	let self = this;
	
	self.base = BeQuiet.NodeBasedHandler;
	self.base(aBrowser, description);
};

BeQuiet.Pandora.prototype = Object.create(BeQuiet.NodeBasedHandler.prototype);
BeQuiet.Pandora.prototype.constructor = BeQuiet.Pandora;
"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");

BeQuiet.LastFM = function(aBrowser) {
	
	const PLAYING_CLASS = 'playing';
	const LIKED_CLASS = 'loved';
	
	let self = this;
	
	self.isLiked = function() {
		return self.radioPlayer.classList.contains(LIKED_CLASS);
	};
	
	self.like = function() {
		if(self.isLiked())
			return;
		
		self.likeButton.click();
	};
	
	self.hasMedia = function() {
		return self.initialized;
	};
	
	self.isPlaying = function() {
		if(!self.initialized)
			return false;
		
		return self.webRadio.classList.contains(PLAYING_CLASS);
	};
	
	self.play = function() {
		if(!self.initialized)
			return;
		
		self.playButton.click();
	};
	
	self.pause = function() {
		if(!self.initialized)
			return;
		
		self.pauseButton.click();
	};
	
	self.next = function() {
		if(!self.initialized)
			return;
		
		self.nextButton.click();
	};
	
	self.previous = function() {

	};
	
	self.initialize = function() {
		self.webRadio = self.doc.getElementById('webRadio');
		self.radioPlayer = self.doc.getElementById('radioPlayer');
		self.playButton = self.doc.getElementById('radioControlPlay');
		self.pauseButton = self.doc.getElementById('radioControlPause');
		self.nextButton = self.doc.getElementById('radioControlSkip');
		self.likeButton = self.doc.getElementById('radioControlLove');
		
		return (self.webRadio != null) && (self.playButton != null) && (self.pauseButton != null);
	};
	
	self.registerListeners = function() {
		self.playObserver = new self.doc.defaultView.MutationObserver(function(mutations) {
	        mutations.forEach(function(mutation) {
	            if(mutation.attributeName != 'class')
	            	return;
	        	
	            setTimeout(function() {
	        		self.updatePlayingState();
	            }, 1);
	        });   
	    });
		
	    self.playObserver.observe(self.webRadio, { attributes: true });
	    
		self.mediaInfoObserver = new self.doc.defaultView.MutationObserver(function(mutations) {
	        mutations.forEach(function(mutation) {
	        	self.mediaInfoChanged();
	        });   
	    });
		
	    self.mediaInfoObserver.observe(self.radioPlayer, { attributes: true });
	};
	
	self.unregisterListeners = function() {
		self.playObserver.disconnect();
	};
	
	self.base = BeQuiet.Handler;
	self.base(aBrowser, self);
};

BeQuiet.LastFM.prototype = Object.create(BeQuiet.Handler.prototype);
BeQuiet.LastFM.prototype.constructor = BeQuiet.LastFM;
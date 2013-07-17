"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");

BeQuiet.Pandora = function(aBrowser) {
	
	const PLAY_ACTIVE = /display: none;/;
	const LIKED_CLASS = "indicator";
	
	let self = this;
	
	self.isLiked = function() {
		return self.likeButton.classList.contains(LIKED_CLASS);
	};
	
	self.hasMedia = function() {
		return self.initialized;
	};
	
	self.isPlaying = function() {
		if(!self.initialized)
			return false;
		
		let value = self.playButton.getAttribute('style');
		return PLAY_ACTIVE.test(value);
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
		self.playButton = self.doc.getElementsByClassName('playButton')[0];
		self.pauseButton = self.doc.getElementsByClassName('pauseButton')[0];
		self.nextButton = self.doc.getElementsByClassName('skipButton')[0];
		self.likeButton = self.doc.getElementsByClassName('thumbUpButton')[0];
		
		return self.playButton != null &&  self.pauseButton != null;
	};
	
	self.registerListeners = function() {
		self.playObserver = new self.doc.defaultView.MutationObserver(function(mutations) {
	        mutations.forEach(function(mutation) {
	            if(mutation.attributeName != 'style')
	            	return;
	            
	            setTimeout(function() {
	        		self.updatePlayingState();
	            }, 1);
	        });   
	    });
		
	    self.playObserver.observe(self.playButton, { attributes: true });
	    
		self.mediaInfoObserver = new self.doc.defaultView.MutationObserver(function(mutations) {
	        mutations.forEach(function(mutation) {
	        	self.mediaInfoChanged();
	        });   
	    });
		
	    self.mediaInfoObserver.observe(self.likeButton, { attributes: true });
	};
	
	self.unregisterListeners = function() {
		self.playObserver.disconnect();
	};
	
	self.base = BeQuiet.Handler;
	self.base(aBrowser, self);
};

BeQuiet.Pandora.prototype = Object.create(BeQuiet.Handler.prototype);
BeQuiet.Pandora.prototype.constructor = BeQuiet.Pandora;
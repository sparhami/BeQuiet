"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");

BeQuiet.Playlist = function(aBrowser) {
	
	const PLAY_ACTIVE = /display: none;/;
	
	let self = this;
	
	self.isLiked = function() {
		return false;
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
		if(!self.initialized)
			return;
		
		self.prevButton.click();
	};
	
	self.initialize = function() {
		self.playButton = self.doc.getElementsByClassName('jp-play')[0];
		self.pauseButton = self.doc.getElementsByClassName('jp-pause')[0];
		self.nextButton = self.doc.getElementsByClassName('jp-next')[0];
		self.prevButton = self.doc.getElementsByClassName('jp-prev')[0];
		
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
	};
	
	self.unregisterListeners = function() {
		self.playObserver.disconnect();
	};
	
	self.base = BeQuiet.Handler;
	self.base(aBrowser, self);
};

BeQuiet.Playlist.prototype = Object.create(BeQuiet.Handler.prototype);
BeQuiet.Playlist.prototype.constructor = BeQuiet.Playlist;
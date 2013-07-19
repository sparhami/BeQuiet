"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");

BeQuiet.Controls = new function() {
	let self = this;
	
	self.playing = false;
	
	/** The handler that is currently playing media */
	self.playingHandler = null;
	
	self.setPlayingState = function(playing) {
		for(let browserWindow of BeQuiet.Main.getWindows()) {
		 	let controls = browserWindow.document.getElementsByClassName('com_sppad_beQuiet_mediaControl');
			
	    	for(let control of controls)
				control.setAttribute('playing', playing);
		}
	};
	
	self.updateToggleTooltip = function(aEvent) {
		aEvent.target.setAttribute('label', self.playing ? 'Pause' : 'Play');
	};
	
	self.setControlsEnabled = function(enabled) {
		for(let browserWindow of BeQuiet.Main.getWindows()) {
		 	let controls = browserWindow.document.getElementsByClassName('com_sppad_beQuiet_mediaControl');
	    	for(let control of controls) {
	    		if(enabled)
	    			control.removeAttribute('disabled');
	    		else
	    			control.setAttribute('disabled', true);
	    	}
		}
	};
	
	self.isPlaying = function() {
		return self.playing;
	};
	
	self.onPlay = function(aHandler) {
		self.playing = true;
		self.playingHandler = aHandler;
		self.setPlayingState(true);
		
		self.onMediaInfoChanged(aHandler);
	};
	
	self.onPause = function(aHandler) {
		self.playing = false;
		self.setPlayingState(false);
	};
	
	self.onMediaInfoChanged = function(aHandler) {
		for(let browserWindow of BeQuiet.Main.getWindows()) {
		 	let likeButton = browserWindow.document.getElementById('com_sppad_beQuiet_media_like');
			
		 	likeButton && likeButton.setAttribute('liked', aHandler.isLiked());
		}
	};
	
	self.play = function() {
		BeQuiet.MediaState.play();
	};
	
	self.pause = function() {
		BeQuiet.MediaState.pause();
	};
	
	self.like = function() {
		if(!self.playing)
			return;
		
		self.playingHandler.like();
	};
	
	self.toggle = function() {
		if(self.playing)
			self.pause();
		else
			self.play();
	};
	
	self.next = function() {
		BeQuiet.MediaState.next();
	};
	
	self.previous = function() {
		BeQuiet.MediaState.previous();
	};
	
	BeQuiet.MediaState.addObserver(self);
};
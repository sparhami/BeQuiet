"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");

BeQuiet.Controls = new function() {
	let self = this;
	
	self.playing = false;
	
	self.setPlayhingState = function(playing) {
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
		self.setPlayhingState(true);
		
		self.onMediaInfoChanged(aHandler);
	};
	
	self.onPause = function(aHandler) {
		self.playing = false;
		self.setPlayhingState(false);
	};
	
	self.onMediaInfoChanged = function(aHandler) {
		dump("isLiked " + aHandler.isLiked() + "\n");
	};
	
	self.play = function() {
		BeQuiet.MediaState.play();
	};
	
	self.pause = function() {
		BeQuiet.MediaState.pause();
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
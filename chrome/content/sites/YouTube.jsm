"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");

/**
 * Handles Flash videos on YouTube. While it mostly works for HMTL5 videos, it
 * can be unreliable. As such, it does not attempt to handle any HMTL5 videos,
 * letting the HmtlVideo handler deal with it instead.
 * <p>
 * JavaScript code is injected into the web page in order to interact with the
 * YouTube flash player. In order to add the event listener, which takes in a
 * function name and not a function, as well as using the functions to control
 * playback, injected code must be used.
 */
BeQuiet.YouTube = function(aBrowser) {
	
	const PLAYER_STATE_PLAYING = 1;
	
	const JAVASCRIPT_INJECTION_DELAY = 600;
	
	let self = this;
	self.ready = false;
	
	self.isLiked = function() {
		return false;
	};
	
	self.hasMedia = function() {
		return self.initialized;
	};
	
	self.isPlaying = function() {
		if(!self.initialized || !self.ready)
			return false;
		
		let state = self.doc.defaultView.wrappedJSObject.com_sppad_getState();
		return state == PLAYER_STATE_PLAYING;
	};
	
	self.play = function() {
		if(!self.initialized)
			return;
		
		self.doc.defaultView.wrappedJSObject.com_sppad_play();
	};
	
	self.pause = function() {
		if(!self.initialized)
			return;
		
		self.doc.defaultView.wrappedJSObject.com_sppad_pause();
	};
	
	self.next = function() {
		
	};
	
	self.previous = function() {

	};
	
	self.stateChange = function(aEvent) {
		// event name is shared by all handlers, ensure its the same document
		if(aEvent.target != self.doc)
			return;
		
		self.updatePlayingState();
    };
	
    /**
	 * Allows access to the to the player controls and status by injecting a
	 * JavaScript script. Need to use self.doc.defaultView.wrappedJSObject
	 * to access the functions. Cannot access the functions otherwise.
	 */
	self.injectJavaScript = function() {
		let text = '\
			com_sppad_stateChangeListener = function(data) {\n\
			  var evt = document.createEvent("Events");\n\
			  evt.initEvent("com_sppad_ytStateChange", true, false);\n\
			  document.dispatchEvent(evt);\n\
			};\n\
			com_sppad_register = function() {\n\
			  document.getElementById("movie_player").addEventListener("onStateChange", "com_sppad_stateChangeListener");\
			};\n\
			com_sppad_getState = function() {\n\
			  return document.getElementById("movie_player").getPlayerState();\n\
			}\n\
			com_sppad_play = function() {\n\
			  return document.getElementById("movie_player").playVideo();\n\
			}\n\
			com_sppad_pause = function() {\n\
			  return document.getElementById("movie_player").pauseVideo();\n\
			}';
		
		let script = self.doc.createElement('script');
		let textNode = self.doc.createTextNode(text);
		
		script.appendChild(textNode);
		
		self.doc.body.appendChild(script);
	};
    
	self.initialize = function() {
		let moviePlayer = self.doc.getElementById('movie_player');
		
		return moviePlayer && !moviePlayer.classList.contains('html5-video-player');
	};
	
	self.registerListeners = function() {
        self.doc.addEventListener("com_sppad_ytStateChange", self.stateChange, false, true);
		
		self.injectJavaScript();
        
	    /*
		 * self doesn't work without the timeout. Seems like something
		 * is not initialized properly yet.
		 */
        setTimeout(function() {
    		self.doc.defaultView.wrappedJSObject.com_sppad_register();
    		self.ready = true;
            self.updatePlayingState();
        }, JAVASCRIPT_INJECTION_DELAY);
	};
	
	self.unregisterListeners = function() {
	    self.doc.removeEventListener("com_sppad_ytStateChange", self.stateChange);
	};
	
	self.base = BeQuiet.Handler;
	self.base(aBrowser, self);
};

BeQuiet.YouTube.prototype = Object.create(BeQuiet.Handler.prototype);
BeQuiet.YouTube.prototype.constructor = BeQuiet.YouTube;
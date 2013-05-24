if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.BeQuiet = com.sppad.BeQuiet || {};

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
com.sppad.BeQuiet.YouTube = function(aBrowser) {
	
	const PLAYER_STATE_PLAYING = 1;
	
	const JAVASCRIPT_INJECTION_DELAY = 600;
	
	let self = this;
	self.ready = false;
	
	this.isPlaying = function() {
		if(!self.initialized || !self.ready)
			return false;
		
		let state = self.doc.defaultView.wrappedJSObject.com_sppad_getState();
		return state == PLAYER_STATE_PLAYING;
	};
	
	this.play = function() {
		if(!self.initialized)
			return;
		
		self.doc.defaultView.wrappedJSObject.com_sppad_play();
	};
	
	this.pause = function() {
		if(!self.initialized)
			return;
		
		self.doc.defaultView.wrappedJSObject.com_sppad_pause();
	};
	
	this.stateChange = function(aEvent) {
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
	this.injectJavaScript = function() {
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
    
	this.initialize = function() {
		let moviePlayer = self.doc.getElementById('movie_player');
		
		return moviePlayer && !moviePlayer.classList.contains('html5-video-player');
	};
	
	this.registerListeners = function() {
        document.addEventListener("com_sppad_ytStateChange", self.stateChange, false, true);
		
		self.injectJavaScript();
        
	    /*
		 * This doesn't work without the timeout. Seems like something
		 * is not initialized properly yet.
		 */
        window.setTimeout(function() {
    		self.doc.defaultView.wrappedJSObject.com_sppad_register();
    		self.ready = true;
            self.updatePlayingState();
        }, JAVASCRIPT_INJECTION_DELAY);
	};
	
	this.unregisterListeners = function() {
	    document.removeEventListener("com_sppad_ytStateChange", self.stateChange);
	};
	
	this.base = com.sppad.BeQuiet.Handler;
	this.base(aBrowser, self);
}

com.sppad.BeQuiet.YouTube.prototype = Object.create(com.sppad.BeQuiet.Handler.prototype);
com.sppad.BeQuiet.YouTube.prototype.constructor = com.sppad.BeQuiet.YouTube;
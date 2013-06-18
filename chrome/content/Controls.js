com.sppad.BeQuiet.Controls = new function() {
	
	let self = this;
	
	self.strings = null;
	self.playing = false;
	
	self.setButtonState	 = function(playing) {
		let control = document.getElementById('com_sppad_beQuiet_media_playPause');
		
		if(!control)
			return;
		
		if(playing)
			control.setAttribute('playing', true);
		else
			control.removeAttribute('playing');
	};
	
	self.updateToggleTooltip = function(aEvent) {
		let text = self.strings.getString(self.playing ? 'pause' : 'play');
		
		aEvent.target.setAttribute('label', text);
	};
	
	self.setControlsEnabled = function(enabled) {
	 	let controls = document.getElementsByClassName('com_sppad_beQuiet_mediaControl');
    	for(let control of controls) {
    		if(enabled)
    			control.removeAttribute('disabled');
    		else
    			control.setAttribute('disabled', true);
    	}
	};
	
	self.isPlaying = function() {
		return self.playing;
	};
	
	self.onPlay = function(aEvent) {
		self.playing = true;
		self.setButtonState(true);
	};
	
	self.onPause = function(aEvent) {
		self.playing = false;
		self.setButtonState(false);
	};
	
	self.play = function() {
		com.sppad.BeQuiet.MediaState.play();
	};
	
	self.pause = function() {
		com.sppad.BeQuiet.MediaState.pause();
	};
	
	self.toggle = function() {
		if(self.playing)
			self.pause();
		else
			self.play();
	};
	
	self.next = function() {
		com.sppad.BeQuiet.MediaState.next();
	};
	
	self.previous = function() {
		com.sppad.BeQuiet.MediaState.previous();
	};
	
	window.addEventListener("load", function() {
		self.strings = document.getElementById('com_sppad_BeQuiet_strings');
		
		document.addEventListener("com_sppad_media_play", self.onPlay, false);
		document.addEventListener("com_sppad_media_pause", self.onPause, false);
	});
	
	window.addEventListener("unload", function() {
		document.removeEventListener("com_sppad_media_play", self.onPlay);
		document.removeEventListener("com_sppad_media_pause", self.onPause);
	});
};
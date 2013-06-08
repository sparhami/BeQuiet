com.sppad.BeQuiet.Controls = new function() {
	
	let self = this;
	
	self.strings = null;
	self.playing = false;
	
	this.setButtonState	 = function(playing) {
		let control = document.getElementById('com_sppad_beQuiet_media_playPause');
		
		if(!control)
			return;
		
		if(playing)
			control.setAttribute('playing', true);
		else
			control.removeAttribute('playing');
	};
	
	this.updateToggleTooltip = function(aEvent) {
		let text = self.strings.getString(self.playing ? 'pause' : 'play');
		
		aEvent.target.setAttribute('label', text);
	};
	
	this.isPlaying = function() {
		return self.playing;
	};
	
	this.onPlay = function(aEvent) {
		self.playing = true;
		self.setButtonState(true);
	};
	
	this.onPause = function(aEvent) {
		self.playing = false;
		self.setButtonState(false);
	};
	
	this.play = function() {
		com.sppad.BeQuiet.MediaState.play();
	};
	
	this.pause = function() {
		com.sppad.BeQuiet.MediaState.pause();
	};
	
	this.toggle = function() {
		if(self.playing)
			self.pause();
		else
			self.play();
	};
	
	this.next = function() {
		com.sppad.BeQuiet.MediaState.next();
	};
	
	this.previous = function() {
		com.sppad.BeQuiet.MediaState.previous();
	};
	
	window.addEventListener("load", function() {
		self.strings = document.getElementById('com_sppad_BeQuiet_strings');
		
		document.addEventListener("com_sppad_media_play", self.onPlay, false);
		document.addEventListener("com_sppad_media_pause", self.onPause, false);
	});
};
com.sppad.BeQuiet.Controls = new function() {
	
	let self = this;
	
	self.playing = false;
	
	this.setButtonState	 = function(playing) {
		let control = document.getElementById('com_sppad_beQuiet_media_playPause');
		
		if(!control)
			return;
		
		if(playing) {
			control.setAttribute('playing', true);
			control.setAttribute('tooltiptext', 'Pause');
		} else {
			control.removeAttribute('playing');
			control.setAttribute('tooltiptext', 'Play');
		}
	}
	
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
	
	window.addEventListener("load", function() {
		document.addEventListener("com_sppad_media_play", self.onPlay, false);
		document.addEventListener("com_sppad_media_pause", self.onPause, false);
	});
};
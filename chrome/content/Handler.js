if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.mediamaestro = com.sppad.mediamaestro || {};

com.sppad.mediamaestro.Handler = function(aBrowser) {
	
	let self = this;
	this.browser = aBrowser;
	this.doc = aBrowser.contentDocument;
	
	this.onPlay = function(source) {
		dump("handler onPlay\n");
		
		let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_media_play', true, true);
		evt.handler = self;
		
		document.dispatchEvent(evt);
	};
	
	this.onPause = function(source) {
		dump("handler onPause\n");
		
		let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_media_pause', true, true);
		evt.handler = self;
		
		document.dispatchEvent(evt);
	};
}
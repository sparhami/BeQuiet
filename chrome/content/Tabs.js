com.sppad.BeQuiet.Tabs = new function() {
	
	let self = this;
	
    this.onPause = function(aEvent) {
    	let handler = aEvent.handler;
    	
    	let tab = com.sppad.BeQuiet.Main.getTabForBrowser(handler.browser);
    	tab.removeAttributeNS(com.sppad.BeQuiet.xmlns, 'mediaPlaying');
    };
    
    this.onPlay = function(aEvent) {
    	let handler = aEvent.handler;
    	
    	let tab = com.sppad.BeQuiet.Main.getTabForBrowser(handler.browser);
      	tab.setAttributeNS(com.sppad.BeQuiet.xmlns, 'mediaPlaying', 'true');
    };
    
	window.addEventListener("load", function() {
		document.addEventListener("com_sppad_handler_play", self.onPlay, false);
		document.addEventListener("com_sppad_handler_pause", self.onPause, false);
	});
};



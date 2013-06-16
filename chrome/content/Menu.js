com.sppad.BeQuiet.Menu = new function() {
	
	const prefs = com.sppad.BeQuiet.CurrentPrefs;
	
	const faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
		.getService(Components.interfaces.mozIAsyncFavicons);
	
	let self = this;
	
	this.preparePlayContext = function(event) {
		let menu = event.target;
		
		for(let item of menu.querySelectorAll('[dynamic]'))
			menu.removeChild(item);
		
		let handlerCount = 0;
		for(let handler of com.sppad.BeQuiet.Main.handlers.values())
			if(handler.isActive())
				self.addMenuitem(menu, handler, handlerCount++);
		
		menu.setAttribute('noMediaSites', handlerCount === 0);
		
    	self.updateToggleButtonState();
	};
	
	this.updateToggleButtonState = function() {
		let toggleButton = document.getElementById('com_sppad_beQuiet_toggleEnabledButton');
    	toggleButton.setAttribute('checked', prefs.enablePauseResume);
	};
	
	this.addMenuitem = function(menu, handler) {
		let browser = handler.browser;
		let label = browser.contentTitle || browser.currentURI.asciiSpec;
		
		let item = document.createElement('menuitem');
		item.handler = handler;
		
		item.setAttribute('class', 'menuitem-iconic');
		item.setAttribute('label', label);
		item.setAttribute('playing', handler.playing);
		item.setAttribute('dynamic', true);

		faviconService.getFaviconURLForPage(browser.currentURI, function(icon) {
			let image = handler.playing ? 'chrome://BeQuiet/skin/images/note.svg'
					: icon ? icon.asciiSpec
				    : 'chrome://mozapps/skin/places/defaultFavicon.png';
			
			item.setAttribute('image', image);	
		});
		
		item.addEventListener('command', self.menuitemCommand, false);

		menu.appendChild(item);
	};
	
	this.menuitemCommand = function(aEvent) {
		let item = aEvent.target;
		item.handler.play();
	};
};
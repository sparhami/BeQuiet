var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");

BeQuiet.Menu = new function() {
	
	const prefs = BeQuiet.CurrentPrefs;
	
	const faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
		.getService(Components.interfaces.mozIAsyncFavicons);
	
	let self = this;
	
	self.preparePlayContext = function(event) {
		let menu = event.target;
		let document = menu.ownerDocument;
		
		for(let item of menu.querySelectorAll(':not([static])'))
			menu.removeChild(item);
		
		let handlerCount = 0;
		for(let handler of BeQuiet.Main.handlers.values())
			if(handler.isActive())
				self.addMenuitem(menu, handler, handlerCount++);
		
		menu.setAttribute('noMediaSites', handlerCount === 0);
		
		let toggleButton = document.getElementById('com_sppad_beQuiet_toggleEnabledButton');
		toggleButton.setAttribute('checked', prefs.enablePauseResume);
	};
	
	self.cleanupPlayContext = function(event) {
		let menu = event.target;
		
		for(let item of menu.querySelectorAll(':not([static])'))
			menu.removeChild(item);
	};
	
	self.addMenuitem = function(menu, handler) {
		let document = menu.ownerDocument;
		let browser = handler.browser;
		let label = browser.contentTitle || browser.currentURI.asciiSpec;
		
		let item = document.createElement('menuitem');
		item.handler = handler;
		
		item.setAttribute('class', 'menuitem-iconic');
		item.setAttribute('label', label);
		item.setAttribute('playing', handler.playing);

		faviconService.getFaviconURLForPage(browser.currentURI, function(icon) {
			let image = handler.playing ? 'chrome://BeQuiet/skin/images/note.svg'
					: icon ? icon.asciiSpec
				    : 'chrome://mozapps/skin/places/defaultFavicon.png';
			
			item.setAttribute('image', image);	
		});
		
		item.addEventListener('command', self.menuitemCommand, false);

		menu.appendChild(item);
	};
	
	self.menuitemCommand = function(aEvent) {
		let item = aEvent.target;
		item.handler.play();
	};
};
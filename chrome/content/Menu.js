com.sppad.BeQuiet.Menu = new function() {
	
	let self = this;
	
	self.faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
		.getService(Components.interfaces.mozIAsyncFavicons);

	
	this.preparePlayContext = function(event) {
		
		let node = event.target;
		
		while (node.firstChild) {
		    node.removeChild(node.firstChild);
		}
		
		com.sppad.collect.Iterable.from(com.sppad.BeQuiet.Main.handlers.values())
			.filter(function(item) { return item.isActive() })
			.forEach(function(item) { self.addMenuitem(node, item); });
		
	};
	
	this.addMenuitem = function(menu, handler) {
		let browser = handler.browser;
		let label = browser.contentTitle || browser.currentURI.asciiSpec;
		
		let item = document.createElement('menuitem');
		item.browser = browser;
		
		item.setAttribute('class', 'menuitem-iconic');
		item.setAttribute('label', label);
		item.setAttribute('selected', handler.playing);

		self.faviconService.getFaviconURLForPage(browser.currentURI, function(icon) {
			let image = icon ? icon.asciiSpec : 'chrome://mozapps/skin/places/defaultFavicon.png';
			
			item.setAttribute('image', image);	
		});
		
		item.addEventListener('command', self.menuitemCommand, false);

		menu.appendChild(item);
	};
	
	this.menuitemCommand = function(aEvent) {
		let item = aEvent.target;
		let tab = com.sppad.BeQuiet.Main.getTabForBrowser(item.browser);
		
		gBrowser.selectedTab = tab;
	};
	
};
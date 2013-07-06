Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/SiteFilterRules.jsm");
Components.utils.import("chrome://BeQuiet/content/collect/Iterable.jsm");


BeQuiet.ConfigSitePreferences = new function() {

	const faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
		.getService(Components.interfaces.mozIAsyncFavicons);
	
	let self = this;
	
	self.deleteSelectedRules = function() {
		for(let list of [ self.allowList, self.blockList ]) {
			// Make a copy of items so they can be deleted since removal updates selectedItems
			let items = BeQuiet.Iterable.from(list.selectedItems).toArray();
			for(let item of items) {
				self.deleteRule(item.uri);
			}
		}
	};
	
	self.deleteRule = function(aUri) {
		BeQuiet.SiteFilterRules.removeRule(aUri);
	};
	
	self.clearOtherFocus = function(aEvent) {
		for(list of [ self.allowList, self.blockList ])
			if(list !== aEvent.target)
				list.clearSelection();
	};
	
	self.onRuleAdded = function(aUri, allowed) {
		let list = allowed ? self.allowList : self.blockList;
		
		let item = list.appendItem(aUri.asciiSpec);
		item.uri = aUri;
		item.setAttribute('class', 'listitem-iconic');
		
		faviconService.getFaviconURLForPage(aUri, function(icon) {
    		icon && item.setAttribute('image', icon.asciiSpec);	
		});
	};
	
	self.onRuleRemoved = function(aUri) {
		for(let list of [ self.allowList, self.blockList ]) {
			let count = list.getRowCount();
			
			for(let i=0; i<count; i++) {
				let item = list.getItemAtIndex(i);
				
				if(item.uri == aUri) {
					list.removeItemAt(i);
					break;
				}
			}
		}
	};
	
	window.addEventListener('load', function() {
		self.allowList = document.getElementById('allowedSites');
		self.blockList = document.getElementById('blockedSites');
		
		document.getElementById('filterDeleteButton').addEventListener('command', self.deleteSelectedRules, true);
		
		self.allowList.addEventListener('focus', self.clearOtherFocus);
		self.blockList.addEventListener('focus', self.clearOtherFocus);
		
		for(let rule of BeQuiet.SiteFilterRules.getFilterRules()) {
			self.onRuleAdded(rule.uri, rule.allowed);
		}
		
		BeQuiet.SiteFilterRules.addObserver(self);
	});

	window.addEventListener('unload', function() {
		BeQuiet.SiteFilterRules.removeObserver(self);
	});
};
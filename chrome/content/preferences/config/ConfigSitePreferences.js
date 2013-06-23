if (typeof com == "undefined") {
	var com = {};
}

com.sppad = com.sppad || {};
com.sppad.BeQuiet = com.sppad.BeQuiet || {};

Components.utils.import("chrome://BeQuiet/content/SiteFilterRules.jsm", com.sppad.BeQuiet);
Components.utils.import("chrome://BeQuiet/content/collect/Iterable.jsm", com.sppad.BeQuiet);


com.sppad.BeQuiet.ConfigSitePreferences = new function() {

	const faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
		.getService(Components.interfaces.mozIAsyncFavicons);
	
	let self = this;
	
	self.deleteSelectedRules = function() {
		for(let list of self.lists) {
			// Make a copy of items so they can be deleted since removal updates selectedItems
			let items = com.sppad.BeQuiet.Iterable.from(list.selectedItems).toArray();
			for(let item of items) {
				self.deleteRule(item.uri);
			}
		}
	};
	
	self.deleteRule = function(aUri) {
		com.sppad.BeQuiet.SiteFilterRules.removeRule(aUri);
	};
	
	self.clearOtherFocus = function(aEvent) {
		for(list of self.lists)
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
		for(let list of self.lists) {
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
		
		self.lists = [ self.allowList, self.blockList ];
		
		document.getElementById('filterDeleteButton').addEventListener('command', self.deleteSelectedRules, true);
		
		self.allowList.addEventListener('focus', self.clearOtherFocus);
		self.blockList.addEventListener('focus', self.clearOtherFocus);
		
		for(let rule of com.sppad.BeQuiet.SiteFilterRules.getFilterRules()) {
			self.onRuleAdded(rule.uri, rule.allowed);
		}
		
		com.sppad.BeQuiet.SiteFilterRules.addObserver(self);
	});

	window.addEventListener('unload', function() {
		com.sppad.BeQuiet.SiteFilterRules.removeObserver(self);
	});
}
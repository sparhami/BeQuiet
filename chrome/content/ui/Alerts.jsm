"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");

BeQuiet.Alerts = new function() {
	const alertsService = Components.classes["@mozilla.org/alerts-service;1"]
		.getService(Components.interfaces.nsIAlertsService);
	
	const prefs = BeQuiet.CurrentPrefs;
	
	let self = this;
	
	self.onPlay = function(aHandler) {
		if(!prefs['notifications.showOnPlay'])
			return;
		
		self.showAlert(aHandler);
	};
	
	self.onPause = function(aHandler) {

	};
	
	self.onMediaInfoChanged = function(aHandler) {
		self.showAlert(aHandler);
	};
	
	self.showAlert = function(aHandler) {
		if(!prefs['notifications.showTrackInfo'])
			return;
		
		let trackInfo = aHandler.getTrackInfo();
		
		alertsService.showAlertNotification(
				null,
				self.getAlertTitle(trackInfo),
				self.getAlertText(trackInfo),
				false,
				"",
				null,
				"BeQuiet_trackInfoAlert");
	};
	
	self.getAlertTitle = function(trackInfo) {
		return self.truncate(trackInfo.title, prefs['notifications.maxCharactersPerLine']);
	};
	
	self.getAlertText = function(trackInfo) {
		return [trackInfo.artist, trackInfo.album]
			.filter( a => a )
			.map( a => self.truncate(a, prefs['notifications.maxCharactersPerLine']) )
			.join("\n");
	};
	
	// TODO - figure out how to get ellipsis character into alert text
	self.truncate = function(aString, n) {
		return aString.length <= n ? aString : aString.substr(0, n-3) + '...';
	};
	
	BeQuiet.MediaState.addObserver(self);
};
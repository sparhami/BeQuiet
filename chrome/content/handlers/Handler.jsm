"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/SiteFilter.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");

/**
 * A generic web-page handler.
 * 
 * @param aBrowser
 *            The browser object the handler handles
 * @param aImplementation
 *            An object with the following functions:
 *            <ul>
 *            <li>isLiked
 *            <li>isPlaying
 *            <li>getTrackInfo
 *            <li>hasMedia
 *            <li>pause
 *            <li>play
 *            <li>previous
 *            <li>next
 *            <li>like
 *            <li>initialize
 *            <li>registerListeners
 *            <li>unregisterListeners
 *            </ul>
 */
BeQuiet.Handler = function(aBrowser, aImplementation) {

	const MEDIA_INFO_UPDATE_INTERVAL = 200;
	const prefs = BeQuiet.CurrentPrefs;

	let self = this;
	

	/**
	 * The XUL browser corresponding to the page document. Used for getting the
	 * tab, etc. to update the browser UI.
	 */
	self.browser = aBrowser;
	
	/** The content document for the page being handled */
	self.doc = aBrowser.contentDocument;

	/** The implementation providing the functions and events for the handler */
	self.implementation = aImplementation;

	/**
	 * If the handler has finished initialization, no need to continue to try to
	 * initialize
	 */
	self.initialized = false;

	/**
	 * Used to determine when playing state changes in order to fire play/pause
	 * events
	 */
	self.playing = undefined;

	/** The last time the handler started playing */
	self.lastPlayTime = 0;
	
	/** Last time media info was updated */
	self.lastUpdateTime = 0;

	/** Delay after pause before firing a pause event */
	self.pauseCheckTimer = null;
	
	/** Timer for only updating media info at a maximum frequency */
	self.mediaUpdateTimer = null;
	

	/**
	 * @return True if the handler is able to be used for playing/pausing, false
	 *         otherwise
	 */
	self.isActive = function() {
		return self.implementation.hasMedia();
	};

	/**
	 * Switches the current tab to the the tab for the handler. TODO - Find a
	 * way to give focus to Window if in a different window.
	 */
	self.switchToTab = function() {
		let tab = BeQuiet.Main.getTabForBrowser(self.browser);
		let win = BeQuiet.Main.getWindowForBrowser(self.browser);

		win.gBrowser.selectedTab = tab;
	};

	/**
	 * @return The timestamp of the last time the handler started playing
	 */
	self.getLastPlayTime = function() {
		return self.lastPlayTime;
	};

	/**
	 * Handles a play event by the implementation, checking for permission for
	 * media events and firing a play event if it does.
	 */
	self.onPlay = function() {
		BeQuiet.SiteFilter.checkPermission(self.browser, function() {
			self.handlePlay();
		}, true);
	};

	/**
	 * Handles a pause event by the implementation. Guards against brief pauses
	 * (e.g. changing video location) by siting a timeout. Some implementations
	 * might be able to provide a seeking state that would cover this, but all
	 * do not, so this is necessary.
	 */
	self.onPause = function() {
		clearTimeout(self.pauseCheckTimer);
		self.pauseCheckTimer = setTimeout(function() {
			self.handlePause();
		}, Math.max(1, prefs.pauseCheckDelay));
	};

	self.mediaInfoChanged = function() {
		let timeUntilUpdate = (self.lastUpdateTime + MEDIA_INFO_UPDATE_INTERVAL) - Date.now();
		
		clearTimeout(self.mediaUpdateTimer);
		self.mediaUpdateTimer = setTimeout(function() {
			self.lastUpdateTime = Date.now();
			self.createEvent('com_sppad_handler_mediaInfo');
		}, Math.max(1, timeUntilUpdate));
	};

	self.handlePlay = function() {
		clearTimeout(self.pauseCheckTimer);

		if (self.playing === true)
			return;

		self.lastPlayTime = Date.now();

		self.playing = true;
		self.createEvent('com_sppad_handler_play');
	};

	self.handlePause = function() {
		if (self.playing === false)
			return;

		self.playing = false;
		self.createEvent('com_sppad_handler_pause');
	};

	/**
	 * Creates an event and fires it on the XUL Window's document.
	 */
	self.createEvent = function(eventName) {
		let doc = aBrowser.ownerDocument;

		let evt = doc.createEvent('Event');
		evt.initEvent(eventName, false, false);
		evt.handler = self;

		doc.dispatchEvent(evt);
	};

	self.updatePlayingState = function() {
		if (self.isPlaying())
			self.onPlay();
		else
			self.onPause();
	};

	self.setup = function() {
		self.initialized = self.implementation.initialize();

		if (!self.initialized)
			return;

		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		self.implementation.registerListeners();

		self.updatePlayingState();
	};

	self.cleanup = function() {
		self.browser.removeEventListener("DOMContentLoaded", self.setup);

		if (!self.initialized)
			return;

		self.implementation.unregisterListeners();

		clearTimeout(self.pauseCheckTimer);
		self.handlePause();
	};

	self.browser.addEventListener("DOMContentLoaded", self.setup, false);
	self.setup();
};
"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/collect/Iterable.jsm");

BeQuiet.HtmlVideo = function(aBrowser) {
    const prefs = BeQuiet.CurrentPrefs;

    let self = this;

    self.media = null;
    self.mediaItems = new Set();

    self.isLiked = function() {
        return false;
    };

    self.isPlaying = function() {
        if(self.media == null)
            return false;

        return !self.media.paused;
    };

    self.getAlbumArt = function() {
        return null;
    };

    self.getTitle = function() {
        let title = self.media.ownerDocument.title;
        return title && title.length > 0 ? title : aBrowser.contentTitle;
    };

    self.getArtist = function() {
        return null;
    };

    self.getAlbum = function() {
        return null;
    };

    self.hasMedia = function() {
        return self.media != null || self.getFirstMedia() != null;
    };

    self.pause = function() {
        if(self.media != null)
            self.media.pause();
    };

    self.play = function() {
        let media = self.media || self.getFirstMedia();

        if(media != null)
            media.play();
    };

    self.previous = function() {

    };

    self.next = function() {

    };

    self.like = function() {

    };

    self.getFirstMedia = function() {
        for(let media of self.mediaItems) {
            return media;
        }

        return null;
    };

    self.pauseOtherMedia = function(media) {
        self.removeDeadNodes();
        
        for(let node of self.mediaItems) {
            if(node !== media) {
                node.pause();
            }
        }
    };
    
    /* 
     * TODO - Can't tell when iframe is destroyed and remove the media nodes then
     * Seem to get an unload event in Nightly but not in stable. Need to fix this.
     */ 
    self.removeDeadNodes = function() {
        var deadNodes = [];

        for(let node of self.mediaItems) {
            try {
                node.played; // Perhaps a better way to check for dead nodes
            } catch(e) {
                deadNodes.push(node);
            }
        }

        deadNodes.forEach( n => self.removeMedia(n) );
    };

    self.mediaPlay = function(aEvent) {
        let media = aEvent.target;
        let tagName = media.tagName.toUpperCase();

        if(tagName !== "VIDEO" && tagName !== "AUDIO")
            return;

        self.media = media;

        if(prefs.pauseMediaOnSamePage)
            self.pauseOtherMedia(media);

        self.onPlay();
    };

    self.mediaPause = function(aEvent) {
        if(self.media === aEvent.target)
            self.onPause();
    };

    self.nodeAdded = function(aNode) {
        switch(aNode.tagName) {
        case 'AUDIO':
        case 'VIDEO':
            self.addMedia(aNode);
            break;
        }
    };

    self.nodeRemoved = function(aNode) {
        switch(aNode.tagName) {
        case 'IFRAME':
            setTimeout(function() {
                self.removeDeadNodes();
            }, 1);
            break;
        case 'AUDIO':
        case 'VIDEO':
            self.removeMedia(aNode);
            break;
        }
    };

    self.addDocument = function(aDocument) {
        if(aDocument.com_sppad_beQuiet_node_observer)
            return;

        aDocument.com_sppad_beQuiet_node_observer = new aDocument.defaultView.MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                for(let node of mutation.addedNodes || [])
                    self.nodeAdded(node);
                for(let node of mutation.removedNodes || [])
                    self.nodeRemoved(node);
            });
        });

        aDocument.com_sppad_beQuiet_node_observer.observe(aDocument, { childList: true, subtree: true });

        for(let node of aDocument.querySelectorAll('video, audio'))
            self.addMedia(node);

        aDocument.addEventListener('play', self.mediaPlay, true);
        aDocument.addEventListener('pause', self.mediaPause, true);
    };

    self.removeDocument = function(aDocument) {
        if(aDocument.com_sppad_beQuiet_node_observer)
            aDocument.com_sppad_beQuiet_node_observer.disconnect();

        for(let node of aDocument.querySelectorAll('video, audio'))
            self.removeMedia(node);

        aDocument.removeEventListener('play', self.mediaPlay, true);
        aDocument.removeEventListener('pause', self.mediaPause, true);
    };

    self.addMedia = function(aNode) {
        self.mediaItems.add(aNode);
    };

    self.removeMedia = function(aNode) {
        self.mediaItems.delete(aNode);

        if(self.media === aNode) {
            self.onPause();
            self.media = null;
        }
    };

    self.initialize = function() {
        return true;
    };	

    self.onPageLoad = function(aEvent) {
        self.addDocument(aEvent.originalTarget);
    };

    self.onPageUnload = function(aEvent) {
        self.removeDocument(aEvent.originalTarget);
    };

    self.registerListeners = function() {
        self.browser.addEventListener("DOMContentLoaded", self.onPageLoad, false);
        self.browser.addEventListener("unload", self.onPageUnload, false);

        self.addDocument(self.doc);
    };

    self.unregisterListeners = function() {
        self.browser.removeEventListener("DOMContentLoaded", self.onPageLoad);
        self.browser.removeEventListener("unload", self.onPageUnload);

        self.removeDocument(self.doc);
    };

    self.base = BeQuiet.Handler;
    self.base(aBrowser, self);
};

BeQuiet.HtmlVideo.prototype = Object.create(BeQuiet.Handler.prototype);
BeQuiet.HtmlVideo.prototype.constructor = BeQuiet.HtmlVideo;

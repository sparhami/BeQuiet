var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

Components.utils.import("resource://gre/modules/Services.jsm");

var styleSheetService = Components.classes["@mozilla.org/content/style-sheet-service;1"]
        .getService(Components.interfaces.nsIStyleSheetService);

var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
        .getService(Ci.nsIWindowMediator);

function loadIntoWindow(window) {
    // Get the anchor for "overlaying" but make sure the UI is loaded
    let browser = window.document.getElementById('browser');

    if(!browser)
        return;

    Cu.import('chrome://BeQuiet/content/ns.jsm');
    Cu.import('chrome://BeQuiet/content/Main.jsm');
    BeQuiet.Main.setupWindow(window);
    BeQuiet.MediaState.setupWindow(window);
}

function unloadFromWindow(window) {

}

var windowListener = {
    onOpenWindow : function(aWindow) {
        // Wait for the window to finish loading
        let
        domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                .getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
        domWindow.addEventListener("load", function() {
            domWindow.removeEventListener("load", arguments.callee, false);
            loadIntoWindow(domWindow);
        }, false);
    },
    onCloseWindow : function(aWindow) {
    },
    onWindowTitleChange : function(aWindow, aTitle) {
    }
};

function startup(aData, aReason) {
    // Load into any existing windows
    let enumerator = wm.getEnumerator("navigator:browser");
    while (enumerator.hasMoreElements())
        loadIntoWindow(enumerator.getNext().QueryInterface(Ci.nsIDOMWindow));

    // Load into any new windows
    wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
    // When the application is shutting down we normally don't have to clean up
    // any UI changes
    if (aReason == APP_SHUTDOWN)
        return;

    // Stop watching for new windows
    wm.removeListener(windowListener);

    // Unload from any existing windows
    let enumerator = wm.getEnumerator("navigator:browser");
    while (enumerator.hasMoreElements())
        unloadFromWindow(enumerator.getNext().QueryInterface(Ci.nsIDOMWindow));
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}

startup(null, null);
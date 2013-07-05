var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");

BeQuiet.PREF_WINDOW_FILE = "chrome://BeQuiet/content/preferences/config/config.xul";
BeQuiet.PREF_WINDOW_ID = "BeQuiet-preferences-window";
BeQuiet.PREF_BRANCH = "extensions.BeQuiet.";
BeQuiet.PREFS = {
		
	/* Delay after detecting a potential pause before firing a pause event */
	pauseCheckDelay: 200,
	
	/* Automatically pause playing media when one starts playing */
	enablePauseResume: true,
	
	/* Delay after pausing before resuming last playing media */
	resumeDelay: 0,
	
	usePlayingIcon: false,
	
	usePlayingAnimation: false,
		
	/*
	 * When playing using a button/keyboard shortcut, play current tab if it has
	 * media
	 */
	prioritizeCurrentTabForPlay: true,
	
	shortcut: {
		com_sppad_mediaToggleState: {
	    	key: 'p',
	    	modifiers: {
	    		shift: false,
	    		alt: true,
	    		control: false,
	    		meta: false,
	    	},
	    },
	    
	    com_sppad_mediaNext: {
	    	key: 'n',
	    	modifiers: {
	    		shift: false,
	    		alt: true,
	    		control: false,
	    		meta: false,
	    	},
	    },
	    
	    com_sppad_mediaPrevious: {
	    	key: 'n',
	    	modifiers: {
	    		shift: true,
	    		alt: true,
	    		control: false,
	    		meta: false,
	    	},
	    },
	},
};

/**
 * From https://developer.mozilla.org/en/Code_snippets/Preferences
 * 
 * @constructor
 * 
 * @param {string}
 *            branch_name
 * @param {Function}
 *            callback must have the following arguments: branch, pref_leaf_name
 */
BeQuiet.PrefListener = function(branch_name, callback) {
    // Keeping a reference to the observed preference branch or it will get
    // garbage collected.
    let prefService = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefService);
    this._branch = prefService.getBranch(branch_name);
    this._branch.QueryInterface(Components.interfaces.nsIPrefBranch);
    this._callback = callback;
}

BeQuiet.PrefListener.prototype.observe = function(subject, topic, data) {
    if (topic == 'nsPref:changed')
        this._callback(this._branch, data);
};

/**
 * @param {boolean=}
 *            trigger if true triggers the registered function on registration,
 *            that is, when this method is called.
 */
BeQuiet.PrefListener.prototype.register = function(trigger) {
    this._branch.addObserver('', this, false);
    if (trigger) {
        let that = this;
        this._branch.getChildList('', {}).forEach(function(pref_leaf_name) {
            that._callback(that._branch, pref_leaf_name);
        });
    }
};

BeQuiet.PrefListener.prototype.unregister = function() {
    if (this._branch)
        this._branch.removeObserver('', this);
};

BeQuiet.CurrentPrefs = {};

BeQuiet.Preferences = new function() {

	const prefService = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService);
	
    let self = this;

    self._observers = new Set();
    self._EVENT_PREFERENCE_CHANGED = 'EVENT_PREFERENCE_CHANGED';

    /** Listens for prefs changes in order to record them, fire event */
    self._myListener = new BeQuiet.PrefListener(
            BeQuiet.PREF_BRANCH, function(branch, name) {
                BeQuiet.CurrentPrefs[name] = _getPreference(branch,
                        name);
                
                for(let observer of self._observers)
                	observer.prefChanged(name, BeQuiet.CurrentPrefs[name]);
            });

    /**
	 * Sets the current preferences for a given branch.
	 * 
	 * @param prefBranch
	 *            The branch to set preferences for, e.g. extension.mine.
	 * @param prefs
	 *            A javascript object containing key-value pairs mapping to
	 *            preferences and their values. Objects and their keys/values
	 *            map to sub-branches.
	 */
    let _setPrefBranch = function(prefBranch, prefs) {
        let branch = prefService.getBranch(prefBranch);
        for (let[key, val] in Iterator(prefs)) {
            switch (typeof val) {
                case "boolean":
                    branch.setBoolPref(key, val);
                    break;
                case "number":
                    branch.setIntPref(key, val);
                    break;
                case "string":
                    branch.setCharPref(key, val);
                    break;
                case "object":
                    _setPrefBranch(prefBranch + key + ".", val);
                    break;
            }
        }
    };

    /**
	 * Sets the default preferences for a given branch.
	 * 
	 * @param prefBranch
	 *            The branch to set preferences for, e.g. extension.mine.
	 * @param prefs
	 *            A javascript object containing key-value pairs mapping to
	 *            preferences and their values. Objects and their keys/values
	 *            map to sub-branches.
	 */
    let _setDefaultPrefBranch = function(prefBranch, prefs) {
        let branch = prefService.getDefaultBranch(prefBranch);
        for (let[key, val] in Iterator(prefs)) {
            switch (typeof val) {
                case "boolean":
                    branch.setBoolPref(key, val);
                    break;
                case "number":
                    branch.setIntPref(key, val);
                    break;
                case "string":
                    branch.setCharPref(key, val);
                    break;
                case "object":
                    _setDefaultPrefBranch(prefBranch + key + ".", val);
                    break;
            }
        }
    };

    let _getPreference = function(branch, preference) {
        switch (branch.getPrefType(preference)) {
            case branch.PREF_BOOL:
                return branch.getBoolPref(preference);
            case branch.PREF_INT:
                return branch.getIntPref(preference);
            case branch.PREF_STRING:
                return branch.getCharPref(preference);
        }
    };

    self._myListener.register(true);

    // Set the default preferences.
    _setDefaultPrefBranch(BeQuiet.PREF_BRANCH, BeQuiet.PREFS);

    return {

        EVENT_PREFERENCE_CHANGED : self._EVENT_PREFERENCE_CHANGED,

        /**
		 * Sets a preference to the given value
		 * 
		 * @param preference
		 *            The preference key set
		 * @param value
		 *            The value to set for the preference
		 */
        setPreference : function(preference, value) {
            let obj = {};
            obj[preference] = value;

            _setPrefBranch(BeQuiet.PREF_BRANCH, obj);
        },

        /**
		 * Gets the value of a preference
		 * 
		 * @param preference
		 *            The preference to get
		 */
        getPreference : function(preference) {
            let branch = prefService.getBranch(BeQuiet.PREF_BRANCH);
            return _getPreference(branch, preference);
        },

        /**
		 * Toggles a boolean preference to have the opposite of the current
		 * value.
		 * 
		 * @param preference
		 *            The preference key to toggle
		 */
        togglePreference : function(preference) {
            this.setPreference(preference, !this.getPreference(preference));
        },

        /**
		 * Opens a preferences window. Note that on non-Windows platforms, it is
		 * possible to have a window created here open as well as one from the
		 * addons manager.
		 * 
		 * @param aWindow
		 *            A window object to use for opening up the preferences
		 *            dialog.
		 */
        openPreferences : function(aWindow) {
            if (this._preferencesWindow == null
                    || this._preferencesWindow.closed) {
                let instantApply = _getPreference(prefService
                        .getBranch('browser.preferences.'), 'instantApply');
                let features = "chrome,titlebar,toolbar,centerscreen"
                        + (instantApply ? ",dialog=no" : ",modal");
                this._preferencesWindow = aWindow.openDialog(
                        BeQuiet.PREF_WINDOW_FILE,
                        BeQuiet.PREF_WINDOW_ID, features);
            }

            this._preferencesWindow.focus();
        },

        cleanup : function() {
            self._myListener.unregister();
        },

    	addObserver : function(observer) {
    		self._observers.add(observer);
    	},
    	
    	removeObserver : function(observer) {
    		self._observers.delete(observer);
    	},
    }
};
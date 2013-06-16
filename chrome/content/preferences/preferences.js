if (typeof com == "undefined") {
    var com = {};
}

com.sppad = com.sppad || {};
com.sppad.BeQuiet = com.sppad.BeQuiet || {};

com.sppad.BeQuiet.PREF_WINDOW_FILE = "chrome://BeQuiet/content/preferences/config.xul";
com.sppad.BeQuiet.PREF_WINDOW_ID = "BeQuiet-preferences-window";
com.sppad.BeQuiet.PREF_BRANCH = "extensions.BeQuiet.";
com.sppad.BeQuiet.PREFS = {
		
	/* Delay after detecting a potential pause before firing a pause event */
	pauseCheckDelay: 200,
	
	/* Delay after pausing before resuming last playing media */
	resumeDelay: 0,
	
	usePlayingIcon: true,
	usePlayingAnimation: true,
		
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
com.sppad.BeQuiet.PrefListener = function(branch_name, callback) {
    // Keeping a reference to the observed preference branch or it will get
    // garbage collected.
    let prefService = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefService);
    this._branch = prefService.getBranch(branch_name);
    this._branch.QueryInterface(Components.interfaces.nsIPrefBranch);
    this._callback = callback;
}

com.sppad.BeQuiet.PrefListener.prototype.observe = function(subject, topic, data) {
    if (topic == 'nsPref:changed')
        this._callback(this._branch, data);
};

/**
 * @param {boolean=}
 *            trigger if true triggers the registered function on registration,
 *            that is, when this method is called.
 */
com.sppad.BeQuiet.PrefListener.prototype.register = function(trigger) {
    this._branch.addObserver('', this, false);
    if (trigger) {
        let that = this;
        this._branch.getChildList('', {}).forEach(function(pref_leaf_name) {
            that._callback(that._branch, pref_leaf_name);
        });
    }
};

com.sppad.BeQuiet.PrefListener.prototype.unregister = function() {
    if (this._branch)
        this._branch.removeObserver('', this);
};

com.sppad.BeQuiet.CurrentPrefs = {};

com.sppad.BeQuiet.Preferences = new function() {

    let self = this;

    self._eventSupport = new com.sppad.BeQuiet.EventSupport();
    self._EVENT_PREFERENCE_CHANGED = 'EVENT_PREFERENCE_CHANGED';

    /** Listens for prefs changes in order to record them, fire event */
    self._myListener = new com.sppad.BeQuiet.PrefListener(
            com.sppad.BeQuiet.PREF_BRANCH, function(branch, name) {
                com.sppad.BeQuiet.CurrentPrefs[name] = _getPreference(branch,
                        name);
                
                self._eventSupport.fire({
                    'name' : name,
                    'value' : com.sppad.BeQuiet.CurrentPrefs[name]
                }, self._EVENT_PREFERENCE_CHANGED);
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
        let branch = Services.prefs.getBranch(prefBranch);
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
        let branch = Services.prefs.getDefaultBranch(prefBranch);
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
            case Services.prefs.PREF_BOOL:
                return branch.getBoolPref(preference);
            case Services.prefs.PREF_INT:
                return branch.getIntPref(preference);
            case Services.prefs.PREF_STRING:
                return branch.getCharPref(preference);
        }
    };

    // No need to unregister, taken care of by unloading the module.
    self._myListener.register(true);

    // Set the default preferences.
    _setDefaultPrefBranch(com.sppad.BeQuiet.PREF_BRANCH, com.sppad.BeQuiet.PREFS);

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

            _setPrefBranch(com.sppad.BeQuiet.PREF_BRANCH, obj);
        },

        /**
         * Gets the value of a preference
         * 
         * @param preference
         *            The preference to get
         */
        getPreference : function(preference) {
            let branch = Services.prefs.getBranch(com.sppad.BeQuiet.PREF_BRANCH);
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
                let instantApply = _getPreference(Services.prefs
                        .getBranch('browser.preferences.'), 'instantApply');
                let features = "chrome,titlebar,toolbar,centerscreen"
                        + (instantApply ? ",dialog=no" : ",modal");
                this._preferencesWindow = aWindow.openDialog(
                        com.sppad.BeQuiet.PREF_WINDOW_FILE,
                        com.sppad.BeQuiet.PREF_WINDOW_ID, features);
            }

            this._preferencesWindow.focus();
        },

        cleanup : function() {
            self._myListener.unregister();
        },

        addListener : function(listener, type) {
            self._eventSupport.addListener(listener, type);
        },
        
        removeListener : function(listener, type) {
            self._eventSupport.removeListener(listener, type);
        },
    }
};
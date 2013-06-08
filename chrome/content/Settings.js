com.sppad.BeQuiet.Settings = new function() {
	
	let self = this;
	
	self.prefs = com.sppad.BeQuiet.CurrentPrefs;

    this.handleEvent = function(aEvent) {
        switch (aEvent.type) {
            case com.sppad.BeQuiet.Preferences.EVENT_PREFERENCE_CHANGED:
                this.prefChanged(aEvent.name, aEvent.value);
                break;
            default:
                break;
        }
    };

    this.prefChanged = function(name, value) {
        if(name.startsWith('shortcut')) {
        	self.updateKeybind(name.split('\.')[1]);
        }
    };
    
    /**
     * Note: currently requires browser restart in order to change key-bind.
     */
    this.updateKeybind = function(name) {
      	dump("updating keybind " + name + "\n");
    	
    	let branch = "shortcut." + name + ".";
    	
    	let key = self.prefs[branch + "key"];
    	let enabled = key != '';
    	let modifiers = ['alt', 'shift', 'control', 'meta']
    		.filter(function(mod) { return self.prefs[branch + "modifiers." + mod]; })
    		.join(',');
    	
    	let commandNode = document.getElementById(name);
    	let keySet = commandNode.parentNode;
    	
    	if(enabled)
    		commandNode.removeAttribute('disabled');
    	else
    		commandNode.setAttribute('disabled', true);

    	commandNode.setAttribute('key', key);   	
    	commandNode.setAttribute('modifiers', modifiers);
    	
    	dump("done updating keybind " + name + "\n");
    };

    window.addEventListener('load', function() {
    	com.sppad.BeQuiet.Preferences.addListener(self);
    	
    	let prefs = ['shortcut.com_sppad_mediaToggleState.'];
    	
        prefs.forEach(function(pref) {
            self.prefChanged(pref, self.prefs[pref]);
        });
    });
	

}
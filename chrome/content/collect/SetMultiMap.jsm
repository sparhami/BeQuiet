var EXPORTED_SYMBOLS = ["SetMultiMap"];

SetMultiMap = function() {

	let self = this;
	self.backingMap = new Map();

	self.clear = function() {
		self.backingMap.clear();
	};
	
	self.containsKey = function(key) {
		return self.backingMap.has(key);
	};
	
	self.containsValue = function(value) {
		for(let element of self.values())
			if(element == value)
				return true;
		
		return false;
	};
	
	self.get = function(key) {
		return self.backingMap.get(key) || new Set();
	};
	
	self.keys = function() {
		return self.backingMap.keys();
	};
	
	self.put = function(key, value) {
		if(!self.backingMap.has(key))
			self.backingMap.set(key, new Set());
		
		self.backingMap.get(key).add(value);
	};

	self.remove = function(key, value) {
		if(!self.backingMap.has(key))
			return;
		
		let set = self.backingMap.get(key);
		set.delete(value);
		
		if(set.size == 0)
			self.backingMap.delete(key);
	};
	
	self.removeAll = function(key) {
		let values = self.get(key);
		
		self.backingMap.delete(key);
		
		return values;
	};
	
	self.size = function() {
		let count = 0;
		
		for (let set of self.backingMap.values())
			count += set.size;
		
		return count;
	};

	self.values = function() {
		for (let set of self.backingMap.values())
			for(let value of set)
				yield value;
	};
};
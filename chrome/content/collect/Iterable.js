com.sppad.collect.Iterable = function(iterator) {

	let self = this;
	
	self.iterator = iterator;
	
	
	/**
	 * Performs a filter, returning an Iterable that will skip over any elements
	 * not selected by the predicate.
	 * 
	 * @param predicate
	 *            A function that returns true if the item should be included
	 */
	this.filter = function(predicate) {
		return new com.sppad.collect.Iterable(new function() {
			for(let item of self.iterator)
				if(predicate(item))
					yield item;
		});
	};
	
	/**
	 * Peforms a map, returning an Iterable that will apply the mapping function
	 * to each item while iterating, yielding the mapped value.
	 * 
	 * @param func
	 *            A function that maps an input parameter to an output parameter
	 */
	this.map = function(func) {
		return new com.sppad.collect.Iterable(new function() {
			for(let item of self.iterator)
				yield func(item);
		});
	};
	
	/**
	 * Iterates over the values, performing a function for each value.
	 * 
	 * @param func
	 *            A function to apply on each element
	 */
	this.forEach = function(func) {
		return new com.sppad.collect.Iterable(new function() {
			for(let item of self.iterator)
				func(item);
		});
	};
	
	/**
	 * @param func
	 *            A function(current, previous) that performs a reduction over
	 *            the iterator
	 */
	this.reduce = function(func) {
		try {
			let previous = self.iterator.next();
			
			for(let current of self.iterator)
				previous = func(previous, current);
			
			return previous;
		} catch(e) {
			if (e instanceof StopIteration) {
				return null;			// There was nothing to reduce
			} else {
				throw e;
			}
		}
	};

	/**
	 * Returns the maximum value in the Iterable.
	 * 
	 * @param comparator
	 *            A function(a, b) that returns less than 0, 0 or greater than 0
	 *            as a is less than, equal to or greater than b
	 */
	this.max = function(comparator) {
		return self.reduce(function (previous, current) {
			return comparator(previous, current) > 0 ? previous : current;
		});
	};
	
	/**
	 * Returns the minimum value in the Iterable.
	 * 
	 * @param comparator
	 *            A function(a, b) that returns less than 0, 0 or greater than 0
	 *            as a is less than, equal to or greater than b
	 */
	this.min = function(comparator) {
		return self.reduce(function (previous, current) {
			return comparator(previous, current) < 0 ? previous : current;
		});
	};
	
	/**
	 * @return The first element in the Iterable
	 */
	this.first = function() {
		try {
			return self.iterator.next();
		} catch(e) {
			return null;
		}
	};
	
	/**
	 * @return An array containing the items in the iterator
	 */
	this.toArray = function() {
		let items = [];
		
		for(let item of self.iterator)
			items.push(item);
		
		return items;
	};
	
	/**
	 * @return A Set containing the unique items in the iterator
	 */
	this.toSet = function() {
		return new Set(self.iterator);
	};
};

/**
 * Creates an Iterable from one or more iterators.
 */
com.sppad.collect.Iterable.from = function() {
	let args = arguments;
	
	if(args.length == 0)
		throw new ReferenceError("Need an iterator to operate on");
	else if(args.length == 1)
		return new com.sppad.collect.Iterable(args[0]);
	else
		return new com.sppad.collect.Iterable(new function() {
			for(let i=0; i<args.length; i++)
				for(let item of args[i])
					yield item;
		});
};
"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");

BeQuiet.Iterable = function(iterator) {
	this.iterator = iterator;
};

BeQuiet.Iterable.prototype = {
    /**
     * Performs a filter, returning an Iterable that will skip over any elements
     * not selected by the predicate.
     * 
     * @param predicate
     *            A function that returns true if the item should be included
     */
    filter: function(predicate) {
        let iter = this.iterator;
        
        return new BeQuiet.Iterable(new function() {
            for(let item of iter)
                if(predicate(item))
                    yield item;
        });
    },
    
    /**
     * Peforms a map, returning an Iterable that will apply the mapping function
     * to each item while iterating, yielding the mapped value.
     * 
     * @param func
     *            A function that maps an input parameter to an output parameter
     */
    map: function(func) {
        let iter = this.iterator;
        
        return new BeQuiet.Iterable(new function() {
            for(let item of iter)
                yield func(item);
        });
    },
    
    /**
     * Iterates over the values, performing a function for each value.
     * 
     * @param func
     *            A function to apply on each element
     */
    forEach: function(func) {
        for(let item of this.iterator)
            func(item);
    },
    
    /**
     * @param func
     *            A function(current, previous) that performs a reduction over
     *            the iterator
     */
    reduce: function(func) {
        try {
            let previous = this.iterator.next();
            
            for(let current of this.iterator)
                previous = func(previous, current);
            
            return previous;
        } catch(e) {
            if (e instanceof StopIteration) {
                return null;            // There was nothing to reduce
            } else {
                throw e;
            }
        }
    },

    /**
     * Returns the maximum value in the Iterable.
     * 
     * @param comparator
     *            A function(a, b) that returns less than 0, 0 or greater than 0
     *            as a is less than, equal to or greater than b
     */
    max: function(comparator) {
        return this.reduce( (p, c) => comparator(p, c) > 0 ? p : c );
    },
    
    /**
     * Returns the minimum value in the Iterable.
     * 
     * @param comparator
     *            A function(a, b) that returns less than 0, 0 or greater than 0
     *            as a is less than, equal to or greater than b
     */
    min:function(comparator) {
        return this.reduce( (p, c) => comparator(p, c) < 0 ? p : c );
    },
    
    /**
     * @return The first element in the Iterable
     */
    first: function() {
        for(let item of this.iterator)
            return item;
        
        return null;
    },
    
    /**
     * @return An array containing the items in the iterator
     */
    toArray: function() {
        let items = [];
        
        for(let item of this.iterator)
            items.push(item);
        
        return items;
    },
    
    /**
     * @return A Set containing the unique items in the iterator
     */
    toSet: function() {
        return new Set(this.iterator);
    }
};

/**
 * Creates an Iterable from one or more iterators.
 */
BeQuiet.Iterable.from = function() {
	let args = arguments;
	
	if(args.length == 0)
		throw new ReferenceError("Need an iterator to operate on");
	else if(args.length == 1)
		return new BeQuiet.Iterable(args[0]);
	else
		return new BeQuiet.Iterable(new function() {
			for(let i=0; i<args.length; i++)
				for(let item of args[i])
					yield item;
		});
};
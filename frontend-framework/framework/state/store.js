/**
 * A simple state management system for the framework.
 * It allows us to create a store with an initial state and subscribe to changes.
 * When the state changes, all listeners will be notified and can re-render.
 */

export class Store {

    /**
     * Creates a new store with the given initial state.
     * @param {*} initialState - The initial state of the store. Usually an object like { count: 0, name: "John" }
     */
    constructor(initialState) {
        //Create a new set of listeners that are always listening for changes
        this.listeners = new Set();

        //Create a new proxy to wrap the initial state and intercept changes.
        this.state = this._createProxy(initialState);
    }

    /**
     * Recursively creates a proxy for the given target.
     * @param {*} target - The object to create a proxy for.
     * @returns {*} The proxy for the target.
     */
    _createProxy(target) {
        //If the target is not an object, return it as is.
        if (target === null || typeof target !== 'object') {
            return target;
        }

        //Return a new proxy for the target.
        return new Proxy(target, this._createProxyHandler());
    }

    /**
     * Creates a proxy handler for the given target.
     * @returns {Object} The proxy handler for the target.
     */
    _createProxyHandler() {
        return {

            //This function is called whenever a property is accessed on the state.
            get: (target, property) => {
                //Get the value of the property.
                const value = target[property];

                //If the value is an object, create a new proxy for it.
                if (value && typeof value === 'object') {
                    return this._createProxy(value);
                }

                //Return the value.
                return value;
            },

            //This function is called whenever a property is set(changed) on the state.
            set: (target, property, value) => {
                //The property of the target object is set to the new value.
                target[property] = value;

                //Notify all listeners that the state has changed.
                this.notify();

                //Return true to indicate that the set operation was successful(required by proxy).
                return true;
            },

            //This function is called whenever a property is deleted from the state.
            deleteProperty: (target, property) => {
                //Delete the property from the target object.
                delete target[property];

                //Notify all listeners that the state has changed.
                this.notify();

                //Return true to indicate that the delete operation was successful(required by proxy).
                return true;
            }
        }
    }

    /**
     * Subscribes a listener to our store. When it's data changes, the listener will be called.
     * @param {*} listener - The function to be called when the state changes. (usually a component's render function like this.render)
     */
    subscribe(listener) {
        this.listeners.add(listener);
    }


    /**
     * Notifies all listeners that a state has changed and they should re-render.
     */
    notify() {
        this.listeners.forEach(listener => listener());
    }
}

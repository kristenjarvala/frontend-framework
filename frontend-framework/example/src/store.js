import { Store } from '../../framework/state/store.js';
import { persistStore } from '../../framework/common/persistence.js';

// Create a global store with some initial state
export const store = new Store({
    theme: 'dark', // 'light' or 'dark'
    user: {
        name: 'Guest'
    }
});

// Add persistence to the store
// This will automatically save state changes to localStorage
// and load them when the app starts
persistStore(store, 'todo-app-state');

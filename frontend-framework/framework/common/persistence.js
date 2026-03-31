/**
 * State Persistence Helper
 * Saves and loads state from localStorage
 */

export class StatePersistence {
  constructor(key = "app-state") {
    this.storageKey = key;
  }

  /**
   * Save state to localStorage
   * @param {Object} state - State to save
   */
  save(state) {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(this.storageKey, serialized);
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  }

  /**
   * Load state from localStorage
   * @returns {Object|null} Loaded state or null
   */
  load() {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (serialized === null) {
        return null;
      }
      return JSON.parse(serialized);
    } catch (error) {
      console.error("Failed to load state:", error);
      return null;
    }
  }

  /**
   * Clear saved state
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error("Failed to clear state:", error);
    }
  }
}

/**
 * Add persistence to a Store
 * @param {Store} store - Store instance to persist
 * @param {string} key - localStorage key
 */
export function persistStore(store, key = "app-state") {
  const persistence = new StatePersistence(key);

  // Load initial state
  const savedState = persistence.load();
  if (savedState) {
    Object.assign(store.state, savedState);
  }

  // Save on every change
  store.subscribe(() => {
    persistence.save(store.state);
  });

  return persistence;
}

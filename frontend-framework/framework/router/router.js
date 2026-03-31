import { mount } from '../dom/mount.js';

/**
 * The router class handles the routing logic of the application.
 * @param {Object} routes - An object containing the routes of the application. example: { '/home': Home, '/about': About }
 */
export class Router {
  constructor(routes) {
    this.routes = routes; // Stores { '/home': Home, '/about': About }

    // Initialize the outlet, the container where the content will be rendered
    this.outlet = null;
  }

  /**
   * Initializes the router and handles the initial loading of the application.
   * @param {HTMLElement} container - The container element to render the components in.
   */
  /**
   * Initializes the router and handles the initial loading of the application.
   * @param {HTMLElement} container - The container element to render the components in.
   */
  init(container) {
    this.outlet = container;

    // Handle initial load
    this.handleRoute(this.getHashPath());

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      this.handleRoute(this.getHashPath());
    });

    // Listen for clicks on links
    this.enableLinkInterception();
  }

  /**
   * Helper to get the current path from the hash
   * @returns {string} The current path (e.g. "/about" from "#/about")
   */
  getHashPath() {
    const hash = window.location.hash.slice(1); // remove '#'
    return hash === '' ? '/' : hash;
  }

  /**
   * Adds event listener to all links in the document.
   * Prevents default link behavior and updates the hash.
   */
  enableLinkInterception() {
    document.addEventListener('click', (e) => {
      // Targeting closest a tag in case they click an icon inside a link
      const link = e.target.closest('a');

      // If it is a link, and it is accessing our app (starts with /), prevent default and update hash
      if (link && link.getAttribute('href').startsWith('/')) {
        e.preventDefault();
        const path = link.getAttribute('href');

        // Update the hash, which will trigger the hashchange listener
        window.location.hash = path;
      }
    });
  }

  /**
   * Handles the routing logic.
   * @param {string} path - The path to route to.
   */
  handleRoute(path) {
    let ComponentClass = null;
    let params = {};

    // 1. Exact match
    if (this.routes[path]) {
      ComponentClass = this.routes[path];
    } else {
      // 2. Dynamic route matching
      // Iterate over defined routes to find a matching pattern
      for (const routePath of Object.keys(this.routes)) {
        if (routePath.includes(':')) {
          const match = this.matchDynamicRoute(routePath, path);
          if (match) {
            ComponentClass = this.routes[routePath];
            params = match;
            break;
          }
        }
      }
    }

    // 3. Trailing slash normalization fallback (if still no match)
    if (!ComponentClass) {
      if (path.endsWith('/') && path.length > 1) {
        // quick check for simple routes
        ComponentClass = this.routes[path.slice(0, -1)];
      } else if (!path.endsWith('/')) {
        ComponentClass = this.routes[path + '/'];
      }
    }

    if (ComponentClass) {
      const props = {
        route: path,
        params: params
      };

      // Create a new instance of the component, passing props immediately
      const component = new ComponentClass(props);

      // Wipe the previous screen
      this.outlet.innerHTML = '';

      // Render the new component
      console.log(`Switched to ${path}. Rendering component...`);
      component.mountTo(this.outlet);
    } else {
      console.error(`404 Not Found: ${path} (checked variants too)`);
      this.outlet.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>404 - Page Not Found</h2>
          <p>The path <code>${path}</code> does not exist.</p>
          <a href="#/">Go Home</a>
        </div>
      `;
    }
  }

  /**
   * Helper to match a current path against a route pattern
   * @param {string} pattern - Route pattern e.g. "/filter/:status"
   * @param {string} path - Current path e.g. "/filter/active"
   * @returns {Object|null} - Params object {status: "active"} or null if no match
   */
  matchDynamicRoute(pattern, path) {
    const patternSegments = pattern.split('/');
    const pathSegments = path.split('/');

    if (patternSegments.length !== pathSegments.length) {
      return null;
    }

    const params = {};

    for (let i = 0; i < patternSegments.length; i++) {
      const patternSegment = patternSegments[i];
      const pathSegment = pathSegments[i];

      if (patternSegment.startsWith(':')) {
        // It's a param, extract it
        const paramName = patternSegment.slice(1);
        params[paramName] = pathSegment;
      } else if (patternSegment !== pathSegment) {
        // Static segment mismatch
        return null;
      }
    }

    return params;
  }
}
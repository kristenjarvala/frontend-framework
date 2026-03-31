export function mount(vnode, container) {
    const targetElement = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    // Fix #1: Set up event delegation once on the root container
    // Check if this is the root app container and hasn't been set up yet
    if (targetElement.id === 'app' && !window.__appEventDelegationSetup) {
        // console.log('Setting up event delegation on #app (One time setup)');

        const events = ['click', 'dblclick', 'input', 'change', 'submit', 'keydown', 'keyup', 'focusin', 'focusout'];

        for (const eventType of events) {
            targetElement.addEventListener(eventType, (event) => {
                let target = event.target;

                // Walk up the DOM tree to find a handler
                while (target && target !== targetElement) {
                    const handlerProp = `_${eventType}`;

                    if (target[handlerProp]) {
                        // Call handler and return to prevent bubbling to duplicate handlers
                        target[handlerProp](event);
                        return;
                    }

                    target = target.parentNode;
                }
            }, false); // Use capture phase = false (bubbling)
        }

        // Mark globally that event delegation is set up
        window.__appEventDelegationSetup = true;

        // Fix for scroll: Scroll events don't bubble, so we must use capture
        targetElement.addEventListener('scroll', (event) => {
            const target = event.target;
            // Check if the target has a scroll handler attached
            if (target && target._scroll) {
                target._scroll(event);
            }
        }, true); // useCapture = true
    }

    // Handle component classes
    if (typeof vnode.tag === 'function') {
        const componentInstance = new vnode.tag(vnode.props);
        const blueprint = componentInstance.render();

        // Mount the component's rendered output
        const mountedElement = mount(blueprint, targetElement);

        // Fix: Initialize component internals so update() works
        componentInstance._vnode = blueprint;
        componentInstance._container = targetElement;

        // Store references
        vnode.componentInstance = componentInstance;
        vnode.element = mountedElement;

        return mountedElement;
    }

    // Create the DOM element
    const newElement = document.createElement(vnode.tag);

    // Fix #2: Attach event handlers directly to elements
    // Store them so they can be cleaned up later
    const props = vnode.props || {};
    for (const [key, value] of Object.entries(props)) {
        if (key.startsWith('on')) {
            const eventName = key.slice(2).toLowerCase();

            // Store the handler function on the element
            // The event delegation system will find and call this
            newElement[`_${eventName}`] = value;

        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(newElement.style, value);

        } else if (typeof value === 'boolean') {
            if (value) {
                newElement.setAttribute(key, '');
            }

        } else if (key === 'className') {
            newElement.setAttribute('class', value);

        } else if (key === 'value') {
            // Handle input values specially
            if (newElement.tagName === 'INPUT' || newElement.tagName === 'TEXTAREA') {
                newElement.value = value;
            } else {
                newElement.setAttribute(key, value);
            }

        } else if (key !== 'key' && value != null) {
            // Skip 'key' prop (used for list reconciliation)
            // Skip null/undefined values
            newElement.setAttribute(key, String(value));
        }
    }

    // Mount children
    const children = vnode.children || [];
    for (const child of children) {
        if (child == null) {
            continue;
        }

        if (typeof child === 'string' || typeof child === 'number') {
            const textNode = document.createTextNode(String(child));
            newElement.appendChild(textNode);
        } else {
            mount(child, newElement);
        }
    }

    // Append to parent
    targetElement.appendChild(newElement);
    vnode.element = newElement;

    return newElement;
}

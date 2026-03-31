import { mount } from "./mount.js";

export function patch(oldVNode, newVNode) {
  // If tags don't match, replace the entire element
  if (oldVNode.tag !== newVNode.tag) {
    const parentElement = oldVNode.element.parentNode;
    const newElement = mount(newVNode, parentElement);
    parentElement.removeChild(oldVNode.element);
    return newElement;
  }

  // Check if this is a Component
  if (typeof oldVNode.tag === 'function') {
    // It's a component! We need to update existing instance props and re-render
    const instance = oldVNode.componentInstance;
    newVNode.componentInstance = instance;

    // Update props
    instance.props = newVNode.props;

    // Trigger update
    instance.update();

    // Update element reference
    newVNode.element = instance._vnode.element;
    return newVNode.element;
  }

  const element = oldVNode.element;
  newVNode.element = element;

  const oldProps = oldVNode.props || {};
  const newProps = newVNode.props || {};

  // Fix #3: Properly update event handlers
  // Compare old and new handlers and only update if they've changed
  for (const key in newProps) {
    const oldValue = oldProps[key];
    const newValue = newProps[key];

    // Only update if the value has actually changed
    if (oldValue !== newValue) {
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();

        // Update the handler on the element
        // This replaces the old handler with the new one
        element[`_${eventName}`] = newValue;
      } else if (key === "style") {
        Object.assign(element.style, newValue);
      } else if (key === "className") {
        element.setAttribute("class", newValue);
      } else if (
        key === "value" &&
        (element.tagName === "INPUT" || element.tagName === "TEXTAREA")
      ) {
        // Only update input value if it's different from current value
        // This prevents cursor jumping
        if (element.value !== newValue) {
          element.value = newValue;
        }
      } else if (key === "checked" && element.tagName === "INPUT") {
        // Handle checkbox checked state
        element.checked = newValue;
      } else if (typeof newValue === "boolean") {
        if (newValue) {
          element.setAttribute(key, "");
        } else {
          element.removeAttribute(key);
        }
      } else if (key !== "key") {
        element.setAttribute(key, newValue);
      }
    }
  }

  // Remove old props that don't exist in newProps
  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        // Remove the handler
        delete element[`_${eventName}`];
      } else if (key === "style") {
        element.style.cssText = "";
      } else {
        element.removeAttribute(key);
      }
    }
  }

  // Diff children
  const oldChildren = oldVNode.children || [];
  const newChildren = newVNode.children || [];
  const commonLength = Math.min(oldChildren.length, newChildren.length);

  // Patch existing children
  for (let i = 0; i < commonLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (typeof newChild === "string" || typeof newChild === "number") {
      if (typeof oldChild === "string" || typeof oldChild === "number") {
        // Both are text - update if different
        if (newChild !== oldChild) {
          const node = element.childNodes[i];
          if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = newChild;
          }
        }
      } else {
        // Replace element with text
        const node = element.childNodes[i];
        node.replaceWith(document.createTextNode(newChild));
      }
    } else if (typeof oldChild === "string" || typeof oldChild === "number") {
      // Replace text with element
      const node = element.childNodes[i];
      const newElement = mount(newChild, element);
      node.replaceWith(newElement);
    } else {
      // Both are vnodes - recursive patch
      patch(oldChild, newChild);
    }
  }

  // Add new children
  if (newChildren.length > oldChildren.length) {
    newChildren.slice(oldChildren.length).forEach((child) => {
      if (typeof child === "string" || typeof child === "number") {
        element.appendChild(document.createTextNode(child));
      } else {
        mount(child, element);
      }
    });
  }

  // Remove extra old children
  if (newChildren.length < oldChildren.length) {
    for (let i = newChildren.length; i < oldChildren.length; i++) {
      const nodeToRemove = element.childNodes[newChildren.length];
      if (nodeToRemove) {
        element.removeChild(nodeToRemove);
      }
    }
  }

  return element;
}

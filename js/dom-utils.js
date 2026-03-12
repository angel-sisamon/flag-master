// Safe DOM manipulation utilities

/**
 * Sets text content of an element, preventing XSS attacks.
 * @param {Element} element - The DOM element to set text content.
 * @param {string} text - The text to set.
 */
function setTextContent(element, text) {
    element.textContent = text;
}

/**
 * Appends a child element to a parent element, preventing XSS attacks.
 * @param {Element} parent - The parent DOM element.
 * @param {Element} child - The child DOM element to append.
 */
function appendChildSafe(parent, child) {
    parent.appendChild(child);
}

/**
 * Creates a safe text node and appends it to a parent element.
 * @param {Element} parent - The parent DOM element.
 * @param {string} text - The text to append as a child.
 */
function appendTextNode(parent, text) {
    const textNode = document.createTextNode(text);
    appendChildSafe(parent, textNode);
}

// Example usage:
// const div = document.createElement('div');
// setTextContent(div, 'Hello, World!');
// appendTextNode(div, ' This is safe from XSS.');

// document.body.appendChild(div);

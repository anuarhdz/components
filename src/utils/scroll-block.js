/**
 * Observes the DOM for changes related to a specific selector or attribute,
 * and toggles the "scroll-block" attribute on the <body> element based on the presence
 * of the selector in the document.
 *
 * @param {string} selector - The CSS selector to watch for in the DOM.
 * @param {string} [attributeName="open"] - The attribute name to observe for mutations.
 * @throws {Error} Throws an error if the selector is not provided.
 */
export function ScrollBlock(selector, attributeName = "open") {
  if (!selector) {
    throw new Error("Selector is required for ScrollBlock.");
  }

  const callback = () => {
    const hasSelector = document.querySelector(selector);

    document.body.toggleAttribute("scroll-block", Boolean(hasSelector));
  };

  const observer = new MutationObserver(callback);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [attributeName],
  });

  callback();
}

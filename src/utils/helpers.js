/**
 * Creates a debounced function that delays calling the provided function (fn)
 * until after wait milliseconds have elapsed since the last time
 * the debounced function was invoked. The returned function has a .cancel()
 * method to cancel any pending calls.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn The function to debounce
 * @param {number} wait The time (in milliseconds) to wait before calling fn
 * @returns {T & { cancel(): void }} A debounced version of fn with a .cancel() method
 */
export function debounce(fn, wait) {
  /** @type {number | undefined} */
  let timeout;

  /** @param {...any} args */
  function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  }

  // Add the .cancel method:
  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return /** @type {T & { cancel(): void }} */ (debounced);
}

/**
 * Creates a throttled function that calls the provided function (fn) at most once per every wait milliseconds
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn The function to throttle
 * @param {number} delay The time (in milliseconds) to wait before calling fn
 * @returns {T & { cancel(): void }} A throttled version of fn with a .cancel() method
 */
export function throttle(fn, delay) {
  let lastCall = 0;

  /** @param {...any} args */
  function throttled(...args) {
    const now = performance.now();
    // If the time since the last call exceeds the delay, execute the callback
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  }

  throttled.cancel = () => {
    lastCall = performance.now();
  };

  return /** @type {T & { cancel(): void }} */ (throttled);
}

/**
 * Check if the document is ready and call the callback when it is.
 * @param {() => void} callback The function to call when the document is ready.
 */
export function onDocumentReady(callback) {
  if (document.readyState === "complete") {
    callback();
  } else {
    window.addEventListener("load", callback);
  }
}

/**
 * Wait for all animations to finish before calling the callback.
 * @param {Element | Element[]} elements The element(s) whose animations to wait for.
 * @param {() => void} [callback] The function to call when all animations are finished.
 * @param {Object} [options] The options to pass to `Element.getAnimations`.
 * @returns {Promise<void>} A promise that resolves when all animations are finished.
 */
export function onAnimationEnd(elements, callback, options = { subtree: true }) {
  const animations = Array.isArray(elements)
    ? elements.flatMap(element => element.getAnimations(options))
    : elements.getAnimations(options);
  const animationPromises = animations.reduce((acc, animation) => {
    // Ignore ViewTimeline animations
    if (animation.timeline instanceof DocumentTimeline) {
      acc.push(animation.finished);
    }

    return acc;
  }, /** @type {Promise<Animation>[]} */ ([]));

  return Promise.allSettled(animationPromises).then(callback);
}

/**
 * Check if the click is outside the element.
 * @param {MouseEvent} event The mouse event.
 * @param {Element} element The element to check.
 * @returns {boolean} True if the click is outside the element, false otherwise.
 */
export function isClickedOutside(event, element) {
  if (event.target instanceof HTMLDialogElement || !(event.target instanceof Element)) {
    return !isPointWithinElement(event.clientX, event.clientY, element);
  }

  return !element.contains(event.target);
}

/**
 * Check if a point is within an element.
 * @param {number} x The x coordinate of the point.
 * @param {number} y The y coordinate of the point.
 * @param {Element} element The element to check.
 * @returns {boolean} True if the point is within the element, false otherwise.
 */
export function isPointWithinElement(x, y, element) {
  const { left, right, top, bottom } = element.getBoundingClientRect();

  return x >= left && x <= right && y >= top && y <= bottom;
}

/**
 * Get the visible elements within a root element.
 * @template {Element} T
 * @param {Element} root - The element within which elements should be visible.
 * @param {T[] | undefined} elements - The elements to check for visibility.
 * @param {number} [ratio=1] - The minimum percentage of the element that must be visible.
 * @param {'x' | 'y'} [axis] - Whether to only check along 'x' axis, 'y' axis, or both if undefined.
 * @returns {T[]} An array containing the visible elements.
 */
export function getVisibleElements(root, elements, ratio = 1, axis) {
  if (!elements?.length) return [];
  const rootRect = root.getBoundingClientRect();

  return elements.filter(element => {
    const { width, height, top, right, left, bottom } = element.getBoundingClientRect();

    if (ratio < 1) {
      const intersectionLeft = Math.max(rootRect.left, left);
      const intersectionRight = Math.min(rootRect.right, right);
      const intersectionWidth = Math.max(0, intersectionRight - intersectionLeft);

      if (axis === "x") {
        return width > 0 && intersectionWidth / width >= ratio;
      }

      const intersectionTop = Math.max(rootRect.top, top);
      const intersectionBottom = Math.min(rootRect.bottom, bottom);
      const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);

      if (axis === "y") {
        return height > 0 && intersectionHeight / height >= ratio;
      }

      const intersectionArea = intersectionWidth * intersectionHeight;
      const elementArea = width * height;

      // Check that at least the specified ratio of the element is visible
      return elementArea > 0 && intersectionArea / elementArea >= ratio;
    }

    const isWithinX = left >= rootRect.left && right <= rootRect.right;
    if (axis === "x") {
      return isWithinX;
    }

    const isWithinY = top >= rootRect.top && bottom <= rootRect.bottom;
    if (axis === "y") {
      return isWithinY;
    }

    return isWithinX && isWithinY;
  });
}

/**
 * Change the meta theme color of the header.
 * @param {Element} colorSourceElement - The HTML element whose background-color will determine the new theme-color.
 */
export function changeMetaThemeColor(colorSourceElement) {
  const metaThemeColor = document.head.querySelector('meta[name="theme-color"]');
  const containerStyle = window.getComputedStyle(colorSourceElement);
  if (metaThemeColor)
    metaThemeColor.setAttribute("content", containerStyle.backgroundColor);
}

/**
 * Sets the content of the <meta name="theme-color"> tag to the value of a specified CSS property
 * from a given element. This is useful for dynamically updating the browser's theme color.
 *
 * @param {Element} colorSourceElement - The DOM element from which to read the CSS property value.
 * @param {string} [propertyName="--color-background"] - The CSS custom property to use for the theme color.
 */
export function setMetaThemeColor(
  colorSourceElement,
  propertyName = "--color-background"
) {
  const metaThemeColor = document.head.querySelector('meta[name="theme-color"]');
  const containerStyle = window.getComputedStyle(colorSourceElement);
  if (metaThemeColor)
    metaThemeColor.setAttribute("content", containerStyle.getPropertyValue(propertyName));
}


/**
 * from https://web.dev/custom-elements-best-practices/#make-properties-lazy
 * Captures the value from the unupgraded instance and deletes the property so it does
 * not shadow the custom element's own property setter. This way, when the element's
 * definition does finally load, it can immediately reflect the correct state.
 *
 * @template T
 * @param {T} obj
 * @param {keyof T} prop
 */
export function upgradeProperty(obj, prop) {
  const self = /** @type {any} */ (obj);
  if (Object.prototype.hasOwnProperty.call(obj, prop)) {
    const value = self[prop];
    delete self[prop];
    self[prop] = value;
  }
}

/**
 * Observes the DOM for an element matching the given selector that has the specified attribute.
 * Resolves with the element once it is found with the attribute present.
 *
 * @param {string} selector - The CSS selector for the target element.
 * @param {string} attributeName - The name of the attribute to observe.
 * @returns {Promise<HTMLElement>} A promise that resolves with the element once it has the attribute.
 */
export function waitForAttribute(selector, attributeName) {
  return new Promise(resolve => {
    const element = document.querySelector(selector);

    if (element instanceof HTMLElement && element.hasAttribute(attributeName)) {
      return resolve(element);
    }

    const observer = new MutationObserver(mutations => {
      const el = document.querySelector(selector);
      if (el instanceof HTMLElement && el.hasAttribute(attributeName)) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: [attributeName],
    });
  });
}

/**
 * Observes the presence of a specific attribute on a DOM element matching a selector.
 * Calls the provided callback whenever the attribute is added or removed.
 *
 * @export
 * @class AttributeObserver
 */
export class AttributeObserver {
  /**
   * Creates an instance of AttributeObserver.
   * @param {string} selector - CSS selector for the target element.
   * @param {string} attributeName - The attribute to observe.
   * @param {(hasAttribute: boolean, element: HTMLElement) => void} callback - Function to call when the attribute changes.
   */
  constructor(selector, attributeName, callback) {
    this.selector = selector;
    this.attributeName = attributeName;
    this.callback = callback;

    this.element = null;
    this.mutationObserver = null;
    this.elementObserver = null;

    this.init();
  }

  /**
   * Initializes the observer by finding the element and setting up mutation observers.
   * @private
   * @method
   */
  init() {
    this.element = document.querySelector(this.selector);

    if (this.element instanceof HTMLElement) {
      this.#observeAttributes();
      this.#notify();
    } else {
      this.#observerElementAppearance();
    }
  }

  /**
   * Observes the appearance of the element in the DOM and starts attribute observation when found.
   * @method
   */
  #observerElementAppearance() {
    this.elementObserver = new MutationObserver(mutations => {
      const el = document.querySelector(this.selector);
      if (el instanceof HTMLElement) {
        this.element = el;
        this.#observeAttributes();
        this.#notify();
        this.elementObserver.disconnect();
      }
    });

    this.elementObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Sets up a MutationObserver to watch for changes to the specified attribute.
   * @method
   */
  #observeAttributes() {
    this.mutationObserver = new MutationObserver(() => this.#notify());

    if (this.element) {
      this.mutationObserver.observe(this.element, {
        attributes: true,
        attributeFilter: [this.attributeName],
      });
    }
  }

  /**
   * Notifies the callback with the current attribute state.
   * @method
   */
  #notify() {
    if (!(this.element instanceof HTMLElement)) return;

    const hasAttribute = this.element.hasAttribute(this.attributeName);
    this.callback(hasAttribute, this.element);
  }

  /**
   * Disconnects all MutationObservers to clean up resources.
   * @method
   */
  disconnect() {
    if (this.mutationObserver) this.mutationObserver.disconnect();
    if (this.elementObserver) this.elementObserver.disconnect();
  }
}
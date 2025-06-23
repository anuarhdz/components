/**
 * HeaderComponent is a custom HTML element that manages a sticky header with various behaviors.
 * It supports "always", "scroll-up", and "never" sticky modes, and updates a CSS custom property
 * for the header's height. The component uses IntersectionObserver and ResizeObserver to track
 * its position and size, and manages scroll direction and sticky state via data attributes.
 *
 * @class
 * @extends HTMLElement
 *
 * @property {number} #lastScrollTop - The last recorded scrollTop of the document, used for "scroll-up" sticky behavior.
 * @property {number|null} #timeout - Timeout for hiding animation in "scroll-up" sticky mode.
 * @property {number} #animationDelay - Duration to wait for hiding animation (ms).
 * @property {IntersectionObserver|null} #intersectionObserver - Observer for sticky header position.
 * @property {boolean} #offscreen - Whether the header is currently offscreen in "scroll-up" mode.
 * @property {ResizeObserver} #resizeObserver - Observer to keep the global `--header-block-size` property updated.
 *
 * @method #observeStickyPosition
 * Observes the header's sticky position using IntersectionObserver.
 * @param {boolean} alwaysSticky - If true, observes when header is offscreen.
 *
 * @method #handleWindowScroll
 * Handles scroll events to update sticky state and scroll direction.
 *
 * @constructor
 * Initializes the HeaderComponent.
 *
 * @method connectedCallback
 * Lifecycle method called when the element is added to the DOM.
 *
 * @method disconnectedCallback
 * Lifecycle method called when the element is removed from the DOM.
 */
export class HeaderComponent extends HTMLElement {
  /**
   * The last recorder scrollTop of the document, when sticky behavior is 'scroll-up'.
   * @type {number}
   */
  #lastScrollTop = 0;

  /**
   * A timeout to allow for hiding animation, when sticky behavior is 'scroll-up'
   * @type {number | null}
   */
  #timeout = null;

  /**
   * The duration to wait for hiding animation, when sticky behavior is 'scroll-up'
   * @constant {number}
   */
  #animationDelay = 150;

  /**
   * An intersection observer for monitoring sticky header position.
   * @type {IntersectionObserver | null}
   */
  #intersectionObserver = null;

  /**
   * Whether the header has been scrolled offscreen, when sticky behavior is 'scroll-up'
   * @type {boolean}
   */
  #offscreen = false;

  /**
   * Keeps the global `--header-block-size` custom property up to date,
   * which other theme components can then consume
   */
  #resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return;

    const { height } = entry.target.getBoundingClientRect();
    document.body.style.setProperty("--header-block-size", `${height}px`);
  });

  /**
   * Observes the header while scrolling the viewport to track when its actively sticky
   * @param {Boolean} alwaysSticky - Determines if we need to observe when the header is offscreen
   */
  #observeStickyPosition = (alwaysSticky = true) => {
    if (this.#intersectionObserver) return;

    const config = {
      threshold: alwaysSticky ? 1 : 0,
    };

    this.#intersectionObserver = new IntersectionObserver(([entry]) => {
      if (!entry) return;

      const { isIntersecting } = entry;

      if (alwaysSticky) {
        this.dataset.stickyState = isIntersecting ? "inactive" : "active";
        //changeMetaThemeColor(this.refs.headerRowTop);
      } else {
        this.#offscreen =
          !isIntersecting || this.dataset.stickyState === "active";
      }
    }, config);

    this.#intersectionObserver.observe(this);
  };

  #handleWindowScroll = () => {
    const stickyMode = this.getAttribute("sticky");
    if (!this.#offscreen && stickyMode !== "always") return;

    const scrollTop = document.scrollingElement?.scrollTop ?? 0;
    const isScrollingUp = scrollTop < this.#lastScrollTop;
    if (this.#timeout) {
      clearTimeout(this.#timeout);
      this.#timeout = null;
    }

    if (stickyMode === "always") {
      if (isScrollingUp) {
        if (this.getBoundingClientRect().top >= 0) {
          this.dataset.scrollDirection = "none";
        } else {
          this.dataset.scrollDirection = "up";
        }
      } else {
        this.dataset.scrollDirection = "down";
      }

      this.#lastScrollTop = scrollTop;
      return;
    }

    if (isScrollingUp) {
      this.removeAttribute("data-animating");

      if (this.getBoundingClientRect().top >= 0) {
        // reset sticky state when header is scrolled up to natural position
        this.#offscreen = false;
        this.dataset.stickyState = "inactive";
        this.dataset.scrollDirection = "none";
      } else {
        // show sticky header when scrolling up
        this.dataset.stickyState = "active";
        this.dataset.scrollDirection = "up";
      }
    } else if (this.dataset.stickyState === "active") {
      this.dataset.scrollDirection = "none";
      // delay transitioning to idle hidden state for hiding animation
      this.setAttribute("data-animating", "");

      this.#timeout = setTimeout(() => {
        this.dataset.stickyState = "idle";
        this.removeAttribute("data-animating");
      }, this.#animationDelay);
    } else {
      this.dataset.scrollDirection = "none";
      this.dataset.stickyState = "idle";
    }

    this.#lastScrollTop = scrollTop;
  };

  constructor() {
    super();
  }

  connectedCallback() {
    this.#resizeObserver.observe(this);
    const stickyMode = this.getAttribute("sticky");
    const transparent = this.getAttribute("transparent");

    if (stickyMode === "never") {
      this.removeAttribute("sticky");
    }

    if (transparent === "false") {
      this.removeAttribute("transparent");
    }

    if (stickyMode) {
      this.#observeStickyPosition(stickyMode === "always");

      if (stickyMode === "scroll-up" || stickyMode == "always") {
        window.addEventListener("scroll", this.#handleWindowScroll);
      }
    }
  }

  disconnectedCallback() {
    this.#resizeObserver.disconnect();
    this.#intersectionObserver?.disconnect();
    document.removeEventListener("scroll", this.#handleWindowScroll);
    document.body.style.setProperty("--header-block-size", "0px");
  }
}

customElements.define("header-component", HeaderComponent);




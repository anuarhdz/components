/**
 * A custom HTML element that renders a simple message.
 * 
 * @class
 * @extends HTMLElement
 */
export class CustomElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `<p>Hello, this is a custom element!</p>`;
  }
}
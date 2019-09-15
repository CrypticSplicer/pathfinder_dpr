let dice_span = document.querySelector('#dice-span-template');
customElements.define('dice-span', class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.appendChild(dice_span.content.cloneNode(true));
  }
  disconnectedCallback() {
    this.removeChild(this.firstChild);
  }
});

let attack_card = document.querySelector('#attack-card-template');
customElements.define('attack-card', class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.appendChild(attack_card.content.cloneNode(true));
  }
  disconnectedCallback() {
    this.removeChild(this.firstChild);
  }
});

let spell_card = document.querySelector('#spell-card-template');
customElements.define('spell-card', class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.appendChild(spell_card.content.cloneNode(true));
  }
  disconnectedCallback() {
    this.removeChild(this.firstChild);
  }
});

let comparison_column = document.querySelector('#comparison-column-template');
customElements.define('comparison-column', class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.appendChild(comparison_column.content.cloneNode(true));
  }
  disconnectedCallback() {
    this.removeChild(this.firstChild);
  }
});

document.addEventListener('blur', (event) => {
  if (event.target.tagName == "INPUT") {
    AverageDPR();
  }
}, true);
document.addEventListener('keypress', (event) => {
  let key = event.which || event.keyCode;
  if (key === 13) {
    AverageDPR();
  }
}, true);
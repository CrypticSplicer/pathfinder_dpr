let dice_span = document.querySelector('#dice-span-template');
customElements.define('dice-span', class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    if (!this.hasChildNodes()) {
      this.appendChild(dice_span.content.cloneNode(true));
    }
    AverageDPR();
  }
  disconnectedCallback() {
    this.removeChild(this.firstChild);
    AverageDPR();
  }
});

let attack_card = document.querySelector('#attack-card-template');
customElements.define('attack-card', class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    if (!this.hasChildNodes()) {
      this.appendChild(attack_card.content.cloneNode(true));
    }
    AverageDPR();
  }
  disconnectedCallback() {
    this.removeChild(this.firstChild);
    AverageDPR();
  }
});

let spell_card = document.querySelector('#spell-card-template');
customElements.define('spell-card', class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    if (!this.hasChildNodes()) {
      this.appendChild(spell_card.content.cloneNode(true));
    }
    AverageDPR();
  }
  disconnectedCallback() {
    this.removeChild(this.firstChild);
    AverageDPR();
  }
});

let comparison_column = document.querySelector('#comparison-column-template');
customElements.define('comparison-column', class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    if (!this.hasChildNodes()) {
      this.appendChild(comparison_column.content.cloneNode(true));
    }
  }
  disconnectedCallback() {
    this.removeChild(this.firstChild);
  }
});

function DeepClone(element) {
  let output = element.cloneNode()
}

function AddAttack(event) {
  let card = document.createElement("attack-card");
  event.target.closest(".comparison-column").getElementsByClassName("comparison-column-main")[0].appendChild(card);
}

function AddSpell(event) {
  let card = document.createElement("spell-card");
  event.target.closest(".comparison-column").getElementsByClassName("comparison-column-main")[0].appendChild(card);
}

function AddColumn(event) {
  let column = document.createElement("comparison-column");
  event.target.closest(".main").appendChild(column);
}

function CloseGreatGreatGrandParent(event) {
  event.target.parentElement.parentElement.parentElement.parentElement.parentElement.removeChild(
    event.target.parentElement.parentElement.parentElement.parentElement);
}

function DuplicateAttack(event) {
  const card = event.target.parentElement.parentElement.parentElement.parentElement.cloneNode(true);
  event.target.closest(".comparison-column").getElementsByClassName("comparison-column-main")[0].appendChild(card);
}

function DuplicateSpell(event) {
  const card = event.target.parentElement.parentElement.parentElement.parentElement.cloneNode(true);
  event.target.closest(".comparison-column").getElementsByClassName("comparison-column-main")[0].appendChild(card);
}

function DuplicateColumn(event) {
  const column = event.target.parentElement.parentElement.parentElement.parentElement.cloneNode(true);
  event.target.closest(".main").appendChild(column);
}

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
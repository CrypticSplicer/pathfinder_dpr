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

function CreateDiceExpression(type, prefix, dataName, textExpression, numDiceTypes, hasStatic) {
  let output = document.createElement('span');
  output.classList.add('damage');
  output.classList.add(type);
  output.append(document.createTextNode(prefix + ': ' + textExpression));

  if (!dataName) {
    return output;
  }
  output.setAttribute('data-name', dataName)

  for (let i = 0; i < numDiceTypes; i++) {
    if (i != 0 || textExpression) {
      output.append(document.createTextNode(' + '));
    }
    output.append(document.createElement('dice-span'));
  }

  if (hasStatic) {
    if (numDiceTypes > 0 || textExpression) {
      output.append(document.createTextNode(' + '));
    }
    let staticInput = document.createElement('input');
    staticInput.classList.add('static-bonus');
    staticInput.setAttribute('size', '1');
    staticInput.setAttribute('maxlength', '2');
    output.append(staticInput);
  }

  return output;
}

function UpdateDiceExpression(inputNode) {
  const damageExpressionMain = inputNode.closest('.damage-expression-main');
  const rollType = Array.from(damageExpressionMain.classList)
    .reduce((x, y) => {
      if (y.startsWith('roll-type')) {
        return y;
      }
      return x;
    }, '');
  const prefix = damageExpressionMain.previousElementSibling.innerText;

  // Either the input is within the '.damage-expression-child' or its the checkbax element preceding the '.damage-expression-child'
  const damageExpression = inputNode.closest('.damage-expression-child') || inputNode.nextElementSibling;
  const dataName = damageExpression.dataset.name;

  let textExpression = '';
  let numDiceTypes = 0;
  let addStatic = false;
  Array.from(damageExpression.childNodes).forEach(node => {
    if (node.nodeName == '#text') {
      return;
    }

    if (node.classList.contains('text-expression')) {
      textExpression = node.innerText;
    } else if (node.classList.contains('number-dice-types')) {
      numDiceTypes = node.value;
    } else if (node.classList.contains('add-static-damage')) {
      addStatic = node.checked;
    }
  });

  const parentCardMain = inputNode.closest('.damage-source')
    .getElementsByClassName('card-main')[0];
  Array.from(parentCardMain.childNodes).forEach(node => {
    if (node.nodeName == '#text') {
      return;
    }
    if (node.classList.contains(rollType)) {
      parentCardMain.removeChild(node);
    }
  });

  if (dataName || textExpression) {
    parentCardMain.appendChild(CreateDiceExpression(rollType, prefix, dataName, textExpression, numDiceTypes, addStatic));
  }
}

function SelectDiceExpression(event) {
  let selectedNode = event.target;
  for (let node of event.target.closest('.damage-expression-main').childNodes) {
    if (node.nodeName == '#text') {
      continue;
    }

    if (!selectedNode.checked) {
      selectedNode = node.childNodes[1];
      selectedNode.checked = true;
      break;
    }

    if (node !== event.target.parentElement) {
      node.childNodes[1].checked = false;
    }
  }

  UpdateDiceExpression(selectedNode);
}

document.addEventListener('blur', (event) => {
  if (event.target.tagName == "INPUT") {
    if (event.target.classList.contains('number-dice-types') ||
      event.target.classList.contains('add-static-damage')) {
      UpdateDiceExpression(event.target);
    } else {
      AverageDPR();
    }
  }
}, true);
document.addEventListener('keypress', (event) => {
  let key = event.which || event.keyCode;
  if (key === 13) {
    AverageDPR();
  }
}, true);
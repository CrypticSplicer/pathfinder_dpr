function ParseDamage(damage) {
  return {
    staticBonus: damage[0].getElementsByClassName("static-bonus") ?
      Number(damage[0].getElementsByClassName("static-bonus")[0].value) || 0 : 0,
    dice: Array.from(damage[0].getElementsByClassName("dice"))
      .map(x => {
        return {
          dieNumber: x.getElementsByClassName("die-number") ?
            Number(x.getElementsByClassName("die-number")[0].value) || 0 : 0;
          dieSize: x.getElementsByClassName("die-size") ?
            Number(x.getElementsByClassName("die-size")[0].value) || 0 : 0;
        }
      })
      .filter(x => x.dieNumber > 0);
  };
}

function ParseAttack(card) {
  let output = {}
  if (card.classList.contains("attack-card")) {
    output.type = 'attack';
    output.attackBonus = Number(card.getElementsByClassName("attack-bonus")[0].value) || 0;
  } else if (x.classList.contains("spell-card")) {
    output.type = 'spell'
    output.spellSave = Number(card.getElementsByClassName("spell-save")[0].value) || 0;
    let selector = card.getElementsByClassName("save-selector")[0];
    output.saveType = selector.options[selector.selectedIndex].value;
  } else {
    output.type = 'err'
    return output;
  }

  output.damage = new Map(Array.from(card.getElementsByClassName("damage"))
    .map(x => {
      return [x.dataset.name, ParseDamage(x)];
    })
    .filter(x => x[1].dice.length > 0));

  return output;
}

function ParseColumn(column) {
  return {
    ac: Number(column.getElementsByClassName("comparison-ac")[0].value);
    ref: Number(column.getElementsByClassName("comparison-ref")[0].value);
    fort: Number(column.getElementsByClassName("comparison-fort")[0].value);
    will: Number(column.getElementsByClassName("comparison-will")[0].value);
    attacks: Array.from(column.getElementsByClassName("damage-source"))
      .map(x => {
        return ParseAttack(x);
      })
      .filter(x => x.damage.size > 0);
  }
}

function Sum(list) {
  return list.reduce((a, b) => Number(a) + Number(b));
}

function AdjustedCheckSuccess(adjustedCheck, roll) {
  let successModifier = (roll == 20) ? -1 : (roll == 1) ? 1 : 0;
  if (roll >= adjustedCheck + 10) {
    return successModifier > 0 ? 1 : 0;
  }
  if (roll >= adjustedCheck) {
    return 1 + successModifier;
  }
  if (roll > adjustedCheck - 10) {
    return 2 + successModifier;
  }
  return successModifier < 0 ? 2 : 3;
}

function SuccessPercentiles(adjustedCheck) {
  let results = [0.0, 0.0, 0.0, 0.0];
  for (let i = 1; i <= 20; i++) {
    results[AdjustedCheckSuccess(adjustedCheck, i)] += 1.0;
  }
  return results.map(x => x * 0.05);
}

function DiceAverage(dice) {
  return Sum(dice.map(x => {
    let dieNumber = x.getElementsByClassName("die-number") ?
      Number(x.getElementsByClassName("die-number")[0].value) : 0;
    let dieSize = x.getElementsByClassName("die-size") ?
      Number(x.getElementsByClassName("die-size")[0].value) : 0;
    if (dieNumber == 0 || dieSize == 0) {
      return 0;
    }
    return dieNumber * ((dieSize / 2.0) + 0.5);
  }));
}

function AverageDiceExpressionDamage(damage) {
  if (damage.length != 1) {
    return 0;
  }
  let staticBonus = damage[0].getElementsByClassName("static-bonus") ?
    Number(damage[0].getElementsByClassName("static-bonus")[0].value) : 0;
  let diceAverage = DiceAverage(Array.from(damage[0].getElementsByClassName("dice")));

  return diceAverage + staticBonus;
}

function DamageAverage(adjustedCheck, card) {
  let percentiles = SuccessPercentiles(adjustedCheck);
  let critDamage = AverageDiceExpressionDamage(Array.from(card.getElementsByClassName("crit")));
  let hitDamage = AverageDiceExpressionDamage(Array.from(card.getElementsByClassName("hit")));
  let missDamage = AverageDiceExpressionDamage(Array.from(card.getElementsByClassName("miss")));
  let fumbleDamage = AverageDiceExpressionDamage(Array.from(card.getElementsByClassName("fumble")));

  return critDamage * percentiles[0] + hitDamage * percentiles[1] +
    missDamage * percentiles[2] + fumbleDamage * percentiles[3];
}

function AttackAverage(ac, attackCard) {
  let attackBonus = Number(attackCard.getElementsByClassName("attack-bonus")[0].value);
  let adjustedCheck = Number(ac) - attackBonus;

  return DamageAverage(adjustedCheck, attackCard);
}

function SpellAverage(ref, fort, will, spellCard) {
  let adjustedCheck = Number(spellCard.getElementsByClassName("spell-save")[0].value);
  let saveSelector = spellCard.getElementsByClassName("save-selector")[0];
  switch (saveSelector.options[saveSelector.selectedIndex].value) {
    case "ref":
      adjustedCheck -= Number(ref);
      break;
    case "fort":
      adjustedCheck -= Number(fort);
      break;
    case "will":
      adjustedCheck -= Number(will);
      break;
    default:
      break;
  }
  let targets = Number(spellCard.getElementsByClassName("spell-targets")[0].value);

  console.log("Check", adjustedCheck, ", targets: ", targets);
  return DamageAverage(adjustedCheck, spellCard) * targets;
}

function AverageDPR() {
  Array.from(document.getElementsByClassName("comparison-column")).forEach(column => {
    let ac = Number(column.getElementsByClassName("comparison-ac")[0].value);
    let ref = Number(column.getElementsByClassName("comparison-ref")[0].value);
    let fort = Number(column.getElementsByClassName("comparison-fort")[0].value);
    let will = Number(column.getElementsByClassName("comparison-will")[0].value);
    let damage = Sum(Array.from(column.getElementsByClassName("damage-source")).map(x => {
      if (x.classList.contains("attack-card")) {
        console.log("Attack card average!");
        return AttackAverage(ac, x);
      } else if (x.classList.contains("spell-card")) {
        console.log("Attack card average!");
        return SpellAverage(ref, fort, will, x);
      }
      return 0;
    }));
    column.getElementsByClassName("average-damage")[0].innerHTML = damage.toFixed(2);
  });
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

function CloseGreatGrandParent(event) {
  event.target.parentElement.parentElement.parentElement.parentElement.removeChild(
    event.target.parentElement.parentElement.parentElement);
}
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

function ParseDamage(damage) {
  return {
    staticBonus: damage.getElementsByClassName("static-bonus") ?
      Number(damage.getElementsByClassName("static-bonus")[0].value) || 0 : 0,
    dice: Array.from(damage.getElementsByClassName("dice"))
      .map(x => {
        return {
          dieNumber: x.getElementsByClassName("die-number") ?
            Number(x.getElementsByClassName("die-number")[0].value) || -1 : -1,
          dieSize: x.getElementsByClassName("die-size") ?
            Number(x.getElementsByClassName("die-size")[0].value) || 0 : 0,
        }
      })
      .filter(x => x.dieNumber >= 0),
  };
}

function ParseAttack(card) {
  let output = {}
  if (card.classList.contains("attack-card")) {
    if (!Number(card.getElementsByClassName("attack-bonus")[0].value)) {
      return output;
    }

    output.type = 'attack';
    output.attackBonus = Number(card.getElementsByClassName("attack-bonus")[0].value) || 0;
  } else if (card.classList.contains("spell-card")) {
    if (!Number(card.getElementsByClassName("spell-save")[0].value)) {
      return output;
    }

    output.type = 'spell'
    output.spellSave = Number(card.getElementsByClassName("spell-save")[0].value) || 0;
    let selector = card.getElementsByClassName("save-selector")[0];
    output.saveType = selector.options[selector.selectedIndex].value;
    output.spellTargets = Number(card.getElementsByClassName("spell-targets")[0].value) || 0;
  } else {
    return output;
  }

  output.damage = new Map(Array.from(card.getElementsByClassName("damage"))
    .map(x => {
      return [x.dataset.name, ParseDamage(x)];
    })
    .filter(x => Object.getOwnPropertyNames(x).length > 0 && x[1].dice.length > 0));

  return output;
}

function ParseColumn(column) {
  return {
    ac: Number(column.getElementsByClassName("comparison-ac")[0].value),
    ref: Number(column.getElementsByClassName("comparison-ref")[0].value),
    fort: Number(column.getElementsByClassName("comparison-fort")[0].value),
    will: Number(column.getElementsByClassName("comparison-will")[0].value),
    attacks: Array.from(column.getElementsByClassName("damage-source"))
      .map(x => {
        return ParseAttack(x);
      })
      .filter(x => Object.getOwnPropertyNames(x).length > 0 && x.damage.size > 0),
  }
}

function DamageAverage(damage) {
  if (damage == undefined) {
    return 0;
  }
  return Sum(damage.dice.map(x => {
    if (x.dieNumber <= 0 || x.dieSize <= 0) {
      return 0;
    }
    return x.dieNumber * (x.dieSize / 2.0 + 0.5);
  })) + damage.staticBonus;
}

function AttackAverage(ac, ref, fort, will, attack) {
  if (attack.type == 'attack') {
    if (Number.isNaN(ac)) {
      return 0;
    }

    let adjustedCheck = ac - attack.attackBonus;
    let percentiles = SuccessPercentiles(adjustedCheck);
    let hit = DamageAverage(attack.damage.get('hit'));
    let crit = attack.damage.has('crit') ?
      DamageAverage(attack.damage.get('crit')) :
      (hit * 2) + DamageAverage(attack.damage.get('critBonus'));
    let miss = DamageAverage(attack.damage.get('miss'));
    let fumble = DamageAverage(attack.damage.get('fumble'));

    let damage = [crit, hit, miss, fumble];
    return Sum([... damage.keys()].map(i => percentiles[i] * damage[i]));
  } else if (attack.type == 'spell') {
    let adjustedCheck = 0;
    let targets = attack.spellTargets;
    switch(attack.saveType) {
      case 'ref':
        if (Number.isNaN(ref)) {
          return 0;
        }
        adjustedCheck = attack.spellSave - ref;
        break;
      case 'fort':
        if (Number.isNaN(fort)) {
          return 0;
        }
        adjustedCheck = attack.spellSave - fort;
        break;
      case 'will':
        if (Number.isNaN(will)) {
          return 0;
        }
        adjustedCheck = attack.spellSave - will;
        break;
      default:
        return 0;
        break;
    }

    let percentiles = SuccessPercentiles(adjustedCheck);
    let miss = DamageAverage(attack.damage.get('miss'));
    let fumble = attack.damage.has('fumble') ?
      DamageAverage(attack.damage.get('fumble')) :
      (miss * 2) + DamageAverage(attack.damage.get('fumbleBonus'));
    let hit = attack.damage.has('hit') ?
      DamageAverage(attack.damage.get('hit')) :
      miss / 2.0;
    let crit = DamageAverage(attack.damage.get('crit'));

    let damage = [crit, hit, miss, fumble];
    return Sum([... damage.keys()].map(i => percentiles[i] * damage[i])) * targets;
  }

  return 0;
}

function ColumnAverage(column) {
  return Sum(column.attacks.map(x => {

    return AttackAverage(column.ac, column.ref, column.fort, column.will, x);
  }));
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

function AverageDPR() {
  Array.from(document.getElementsByClassName("comparison-column")).forEach(column => {
    let columnData = ParseColumn(column);
    let damage = ColumnAverage(columnData);
    column.getElementsByClassName("average-damage")[0].innerHTML = +damage.toFixed(2);
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

module.exports = {
  ParseDamage: ParseDamage,
  ParseAttack: ParseAttack,
  ParseColumn: ParseColumn,
  DamageAverage: DamageAverage,
  AttackAverage: AttackAverage,
  ColumnAverage: ColumnAverage,
  AdjustedCheckSuccess: AdjustedCheckSuccess,
  SuccessPercentiles: SuccessPercentiles,
};
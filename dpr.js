function Sum(list) {
  return list.reduce((a, b) => Number(a) + Number(b));
}

function AdjustedCheckSuccess(adjusted_check, roll) {
  let success_modifier = (roll == 20) ? -1 : (roll == 1) ? 1 : 0;
  if (roll >= adjusted_check + 10) {
    return success_modifier > 0 ? 1 : 0;
  }
  if (roll >= adjusted_check) {
    return 1 + success_modifier;
  }
  if (roll > adjusted_check - 10) {
    return 2 + success_modifier;
  }
  return success_modifier < 0 ? 2: 3;
}

function SuccessPercentiles(adjusted_check) {
  let results = [0.0, 0.0, 0.0, 0.0];
  for (let i = 1; i <= 20; i++) {
    results[AdjustedCheckSuccess(adjusted_check, i)] += 1.0;
  }
  return results.map(x => x * 0.05);
}

function DiceAverage(dice) {
  return Sum(dice.map(x => {
    let die_number = x.getElementsByClassName("die-number") ?
        Number(x.getElementsByClassName("die-number")[0].value) : 0;
    let die_size = x.getElementsByClassName("die-size") ?
        Number(x.getElementsByClassName("die-size")[0].value) : 0;
    if (die_number == 0 || die_size == 0) {
      return 0;
    }
    return die_number * ((die_size / 2.0) + 0.5);
  }));
}

function AverageDiceExpressionDamage(dice_expression) {
  if (dice_expression.length != 1) {
    return 0;
  }
  let static_bonus = dice_expression[0].getElementsByClassName("static-bonus") ?
        Number(dice_expression[0].getElementsByClassName("static-bonus")[0].value) : 0;
  let dice_average = DiceAverage(Array.from(dice_expression[0].getElementsByClassName("dice")));

  return dice_average + static_bonus;
}

function DamageAverage(adjusted_check, card) {
  let percentiles = SuccessPercentiles(adjusted_check);
  let crit_damage = AverageDiceExpressionDamage(Array.from(card.getElementsByClassName("crit")));
  let hit_damage = AverageDiceExpressionDamage(Array.from(card.getElementsByClassName("hit")));
  let miss_damage = AverageDiceExpressionDamage(Array.from(card.getElementsByClassName("miss")));
  let fumble_damage = AverageDiceExpressionDamage(Array.from(card.getElementsByClassName("fumble")));

  return crit_damage * percentiles[0] + hit_damage * percentiles[1] +
    miss_damage * percentiles[2] + fumble_damage * percentiles[3];
}

function AttackAverage(ac, attack_card) {
  let attack_bonus = Number(attack_card.getElementsByClassName("attack-bonus")[0].value);
  let adjusted_check = Number(ac) - attack_bonus;

  return DamageAverage(adjusted_check, attack_card);
}

function SpellAverage(ref, fort, will, spell_card) {
  let adjusted_check = Number(spell_card.getElementsByClassName("spell-save")[0].value);
  let save_selector = spell_card.getElementsByClassName("save-selector")[0];
  switch (save_selector.options[save_selector.selectedIndex].value) {
    case "ref":
      adjusted_check -= Number(ref);
      break;
    case "fort":
      adjusted_check -= Number(fort);
      break;
    case "will":
      adjusted_check -= Number(will);
      break;
    default:
      break;
  }
  let targets = Number(spell_card.getElementsByClassName("spell-targets")[0].value);

  console.log("Check", adjusted_check, ", targets: ", targets);
  return DamageAverage(adjusted_check, spell_card) * targets;
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
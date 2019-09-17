const DPR = require('../../dpr.js');

var _ = require('lodash');
var jsdom = require("jsdom");
const {
	JSDOM
} = jsdom;
const {
	window
} = new JSDOM();
const {
	document
} = (new JSDOM('')).window;

describe("Math Suite", function() {
	it("DamageAverage Succeeds", function() {
		let damageExpression = {
			staticBonus: 4,
			dice: [{
				dieNumber: 2,
				dieSize: 8,
			}, ],
		};
		expect(DPR.DamageAverage(damageExpression)).toBeCloseTo(13, 0.002);
	});
	it("AttackAverage Attack Average Succeeds", function() {
		let attackExpression = {
			"type": "attack",
			"attackBonus": 18,
			"damage": new Map([
				[
					"crit", {
						"staticBonus": 32,
						"dice": [{
							"dieNumber": 6,
							"dieSize": 12
						}]
					}
				],
				[
					"hit", {
						"staticBonus": 13,
						"dice": [{
							"dieNumber": 2,
							"dieSize": 10
						}]
					}
				]
			]),
		};
		expect(DPR.AttackAverage(23, 12, 12, 11, attackExpression)).toBeCloseTo(33.3, 0.002);
	});

	it("AttackAverage Spell Average Succeeds", function() {
		let attackExpression = {
			"type": "spell",
			"spellSave": 25,
			"saveType": "ref",
			"spellTargets": 2,
			"damage": new Map([
				[
					"miss", {
						"staticBonus": 4,
						"dice": [{
							"dieNumber": 4,
							"dieSize": 4
						}]
					}
				]
			]),
		};
		expect(DPR.AttackAverage(23, 12, 13, 11, attackExpression)).toBeCloseTo(25.9, 0.002);
	});

	it("AttackAverage Spell Average No Hit Damage Succeeds", function() {
		let attackExpression = {
			"type": "spell",
			"spellSave": 21,
			"saveType": "ref",
			"spellTargets": 1,
			"damage": new Map([
				[
					"hit", {
						"staticBonus": 0,
						"dice": [{
							"dieNumber": 0,
							"dieSize": 0
						}]
					}
				],
				[
					"miss", {
						"staticBonus": 0,
						"dice": [{
							"dieNumber": 3,
							"dieSize": 6
						}]
					}
				]
			]),
		};
		expect(DPR.AttackAverage(20, 9, 10, 8, attackExpression)).toBeCloseTo(6.825, 0.00002);
	});

	it("ColumnAverage Succeeds", function() {
		let columnExpression = {
			"ac": 23,
			"ref": 12,
			"fort": 13,
			"will": 11,
			"attacks": [{
				"type": "attack",
				"attackBonus": 18,
				"damage": new Map([
					[
						"crit", {
							"staticBonus": 32,
							"dice": [{
								"dieNumber": 6,
								"dieSize": 12
							}]
						}
					],
					[
						"hit", {
							"staticBonus": 13,
							"dice": [{
								"dieNumber": 2,
								"dieSize": 10
							}]
						}
					]
				]),
			}, {
				"type": "spell",
				"spellSave": 25,
				"saveType": "ref",
				"spellTargets": 2,
				"damage": new Map([
					[
						"miss", {
							"staticBonus": 4,
							"dice": [{
								"dieNumber": 4,
								"dieSize": 4
							}]
						}
					]
				]),
			}]
		};
		expect(DPR.ColumnAverage(columnExpression)).toBeCloseTo(59.2, 0.002);
	});

	it("AdjustedCheckSuccess Succeeds", function() {
		expect(DPR.AdjustedCheckSuccess(21, 20)).toBe(1);
		expect(DPR.AdjustedCheckSuccess(21, 15)).toBe(2);
		expect(DPR.AdjustedCheckSuccess(21, 10)).toBe(3);
		expect(DPR.AdjustedCheckSuccess(21, 5)).toBe(3);
		expect(DPR.AdjustedCheckSuccess(21, 1)).toBe(3);

		expect(DPR.AdjustedCheckSuccess(15, 20)).toBe(0);
		expect(DPR.AdjustedCheckSuccess(15, 15)).toBe(1);
		expect(DPR.AdjustedCheckSuccess(15, 10)).toBe(2);
		expect(DPR.AdjustedCheckSuccess(15, 5)).toBe(3);
		expect(DPR.AdjustedCheckSuccess(15, 1)).toBe(3);

		expect(DPR.AdjustedCheckSuccess(10, 20)).toBe(0);
		expect(DPR.AdjustedCheckSuccess(10, 15)).toBe(1);
		expect(DPR.AdjustedCheckSuccess(10, 10)).toBe(1);
		expect(DPR.AdjustedCheckSuccess(10, 5)).toBe(2);
		expect(DPR.AdjustedCheckSuccess(10, 1)).toBe(3);

		expect(DPR.AdjustedCheckSuccess(5, 20)).toBe(0);
		expect(DPR.AdjustedCheckSuccess(5, 15)).toBe(0);
		expect(DPR.AdjustedCheckSuccess(5, 10)).toBe(1);
		expect(DPR.AdjustedCheckSuccess(5, 5)).toBe(1);
		expect(DPR.AdjustedCheckSuccess(5, 1)).toBe(3);

		expect(DPR.AdjustedCheckSuccess(0, 20)).toBe(0);
		expect(DPR.AdjustedCheckSuccess(0, 15)).toBe(0);
		expect(DPR.AdjustedCheckSuccess(0, 10)).toBe(0);
		expect(DPR.AdjustedCheckSuccess(0, 5)).toBe(1);
		expect(DPR.AdjustedCheckSuccess(0, 1)).toBe(2);
	});

	it("SuccessPercentiles Succeeds", function() {
		expect(DPR.SuccessPercentiles(21)).toContainOrderedElements([0, 0.05, 0.4, 0.55]);
		expect(DPR.SuccessPercentiles(15)).toContainOrderedElements([0.05, 0.25, 0.45, 0.25]);
		expect(DPR.SuccessPercentiles(10)).toContainOrderedElements([0.05, 0.5, 0.4, 0.05]);
		expect(DPR.SuccessPercentiles(5)).toContainOrderedElements([0.3, 0.5, 0.15, 0.05]);
		expect(DPR.SuccessPercentiles(0)).toContainOrderedElements([0.55, 0.4, 0.05, 0]);
	});

	beforeAll(function() {
		jasmine.addMatchers({
			toContainOrderedElements: function(util, customEqualityTesters) {
				return {
					compare: function(actual, expected) {
						let result = {};
						if (expected === undefined) {
							expected = [];
						}
						if (actual.length != expected.length) {
							result.pass = false;
							return result;
						}

						result.pass = true;
						for (i = 0; i < actual.length; i++) {
							result.pass = result.pass && Math.abs(actual[i] - expected[i]) < 0.0002;
						}
						return result;
					}
				};
			}
		});
	});
});

describe("Parse Suite", function() {
	beforeAll(function() {
		jasmine.addMatchers({
			compareObject: function(util, customEqualityTesters) {
				return {
					compare: function(actual, expected) {
						return {
							pass: _.isMatch(expected, actual) && _.isMatch(actual, expected)
						};
					}
				};
			}
		});
		document.write(`
		  <div class="comparison-column">
		   <div class="button-container close-container">
		      <button type="button" class="btn btn-default btn-circle btn-close btn-absolute" onclick="CloseGreatGrandParent(event)">
		      <i class="fa fa-close"></i>
		      </button>
		   </div>
		   <span align="center"><input type="text" size="20" maxlength="20" class="comparison-name" placeholder="Name"></span>
		   <div class="comparison-stats">
		      <span>AC: <input type="text" size="1" maxlength="2" class="comparison-ac" value="23"></span>
		      <span>Ref: <input type="text" size="1" maxlength="2" class="comparison-ref" value="8"></span>
		      <span>Fort: <input type="text" size="1" maxlength="2" class="comparison-fort" value="8"></span>
		      <span>Will: <input type="text" size="1" maxlength="2" class="comparison-will" value="7"></span>
		   </div>
		   <div class="comparison-column-main">
		      <attack-card>
		         <div class="attack-card damage-source">
		            <div class="button-container close-container">
		               <button type="button" class="btn btn-default btn-circle btn-close btn-absolute" onclick="CloseGreatGrandParent(event)">
		                	<i class="fa fa-close"></i>
		               </button>
		            </div>
		            <div class="card-header">
		               <span>Attack Bonus: <input type="number" size="1" maxlength="2" width="min" class="attack-bonus" value="15"></span>
		            </div>
		            <div class="card-main">
		               <span class="damage" data-name="crit">
		                  Crit:
		                  <dice-span>
		                     <span class="dice"><input type="number" size="1" maxlength="2" class="die-number" value="4">d<input type="number" size="1" maxlength="2" class="die-size" value="8"></span>
		                  </dice-span>
		                  + <input type="number" size="1" maxlength="2" class="static-bonus" value="8">
		               </span>
		               <span class="damage" data-name="hit">
		                  Hit:
		                  <dice-span>
		                     <span class="dice"><input type="number" size="1" maxlength="2" class="die-number" value="2">d<input type="number" size="1" maxlength="2" class="die-size" value="8"></span>
		                  </dice-span>
		                  + <input type="number" size="1" maxlength="2" class="static-bonus" value="4">
		               </span>
		               <span class="damage" data-name="miss">
		                  Miss:
		                  <dice-span>
		                     <span class="dice"><input type="number" size="1" maxlength="2" class="die-number">d<input type="number" size="1" maxlength="2" class="die-size"></span>
		                  </dice-span>
		                  + <input type="number" size="1" maxlength="2" class="static-bonus">
		               </span>
		            </div>
		         </div>
		      </attack-card>
		      <spell-card>
		         <div class="spell-card damage-source">
		            <div class="button-container close-container">
		               <button type="button" class="btn btn-default btn-circle btn-close btn-absolute" onclick="CloseGreatGrandParent(event)">
		               <i class="fa fa-close"></i>
		               </button>
		            </div>
		            <div class="card-header">
		               <div>
		                  <span>
		                     Spell Save: <input type="number" size="1" maxlength="2" width="min" class="spell-save" value="25">
		                     <span>
		                        <select class="inline-selector save-selector">
		                           <option value="ref">Ref</option>
		                           <option value="fort" selected="">Fort</option>
		                           <option value="will">Will</option>
		                        </select>
		                     </span>
		                  </span>
		               </div>
		               <span>Targets: <input type="number" size="1" maxlength="2" width="min" class="spell-targets" value="1"><span>
		               </span></span>
		            </div>
		            <div class="card-main">
		               <span class="damage" data-name="crit">
		                  Crit Failure:
		                  <dice-span>
		                     <span class="dice"><input type="number" size="1" maxlength="2" class="die-number" value="16">d<input type="number" size="1" maxlength="2" class="die-size" value="6"></span>
		                  </dice-span>
		                  + <input type="number" size="1" maxlength="2" class="static-bonus">
		               </span>
		               <span class="damage" data-name="hit">
		                  Failure:
		                  <dice-span>
		                     <span class="dice"><input type="number" size="1" maxlength="2" class="die-number" value="8">d<input type="number" size="1" maxlength="2" class="die-size" value="6"></span>
		                  </dice-span>
		                  + <input type="number" size="1" maxlength="2" class="static-bonus">
		               </span>
		               <span class="damage" data-name="miss">
		                  Success:
		                  <dice-span>
		                     <span class="dice"><input type="number" size="1" maxlength="2" class="die-number" value="4">d<input type="number" size="1" maxlength="2" class="die-size" value="6"></span>
		                  </dice-span>
		                  + <input type="number" size="1" maxlength="2" class="static-bonus">
		               </span>
		               <span class="damage" data-name="fumble">
		                  Crit Success:
		                  <dice-span>
		                     <span class="dice"><input type="number" size="1" maxlength="2" class="die-number">d<input type="number" size="1" maxlength="2" class="die-size"></span>
		                  </dice-span>
		                  + <input type="number" size="1" maxlength="2" class="static-bonus">
		               </span>
		            </div>
		         </div>
		      </spell-card>
		   </div>
		   <div class="footer">
		      <span>Average Damage: <span class="average-damage">78.80</span></span>
		      <div class="button-container plus-container dropdown">
		         <button class="btn btn-default btn-circle btn-plus btn-absolute dropbtn" type="button">
		         <i class="fa fa-plus"></i>
		         </button>
		         <div class="dropdown-content">
		            <button onclick="AddAttack(event)">Attack</button>
		            <button onclick="AddSpell(event)">Spell</button>
		         </div>
		      </div>
		   </div>
		</div>`);
	});

	it("ParseDamage", function() {
		expect(DPR.ParseDamage(document.querySelector('.damage')))
			.compareObject({
				"staticBonus": 8,
				"dice": [{
					"dieNumber": 4,
					"dieSize": 8
				}]
			});
	});

	it("ParseAttack", function() {
		expect(DPR.ParseAttack(document.querySelector('.damage-source')))
			.compareObject({
				"type": "attack",
				"attackBonus": 15,
				"damage": new Map([
					[
						"crit", {
							"staticBonus": 8,
							"dice": [{
								"dieNumber": 4,
								"dieSize": 8
							}]
						}
					],
					[
						"hit", {
							"staticBonus": 4,
							"dice": [{
								"dieNumber": 2,
								"dieSize": 8
							}]
						}
					]
				]),
			});
	});

	it("ParseColumn", function() {
		expect(DPR.ParseColumn(document.querySelector('.comparison-column')))
			.compareObject({
				"ac": 23,
				"ref": 8,
				"fort": 8,
				"will": 7,
				"attacks": [{
					"type": "attack",
					"attackBonus": 15,
					"damage": new Map([
						[
							"crit", {
								"staticBonus": 8,
								"dice": [{
									"dieNumber": 4,
									"dieSize": 8
								}]
							}
						],
						[
							"hit", {
								"staticBonus": 4,
								"dice": [{
									"dieNumber": 2,
									"dieSize": 8
								}]
							}
						]
					])
				}, {
					"type": "spell",
					"spellSave": 25,
					"saveType": "fort",
					"spellTargets": 1,
					"damage": new Map([
						[
							"crit", {
								"staticBonus": 0,
								"dice": [{
									"dieNumber": 16,
									"dieSize": 6
								}, ]
							}
						],
						[
							"hit", {
								"staticBonus": 0,
								"dice": [{
									"dieNumber": 8,
									"dieSize": 6
								}]
							}
						],
						[
							"miss", {
								"staticBonus": 0,
								"dice": [{
									"dieNumber": 4,
									"dieSize": 6
								}]
							}
						]
					])
				}]
			});
	});
});
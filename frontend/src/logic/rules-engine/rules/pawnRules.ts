import type { square, SquarePressure } from "../../feature-extraction/featureExtraction.types";
import { getSquare } from "../../feature-extraction/featureExtractionUtils";
import { centralTypes, phases, vulnerabilityMetrics, type CentralType } from "../constants";
import { capitalize, getPieceCentrality, isPieceVulnerable } from "../rulesEngineUtils";
import type { EnrichedContext } from "../types/context.types";
import type { Rule, RuleResult, Severity } from "../types/rules.types";

/* ------------------------------ PASSED PAWNS ------------------------------ */
export const PassedPawnRule: Rule = {
	id: "PASSED_PAWN",
	displayName: "Passed Pawn",
	category: "pawn",
	evaluate: evaluatePassedPawns,
};

function evaluatePassedPawns(enrichedContext: EnrichedContext): RuleResult[] {
	const results: RuleResult[] = [];
	const { pawnHeuristics, imbalanceHeuristics } = enrichedContext.heuristics;
	const { pressureMap } = imbalanceHeuristics;

	const processColor = (color: "white" | "black") => {
		const passedPawns = pawnHeuristics.passedPawns[color];
		const isolatedPawns = pawnHeuristics.isolatedPawns[color];

		passedPawns.forEach((pawnPosition) => {
			const pawnSquare = getSquare(pawnPosition);
			const pawnRank = parseInt(pawnSquare.charAt(1));
			let importance = 1;
			let isIsolated = false;
			const messages = [];

			const [rank, file] = pawnPosition;
			const squarePressure = pressureMap[rank][file];
			const friendlySquarePressure = squarePressure[color];

			/* --------------------------------- GAME PHASE -------------------------------- */
			switch (enrichedContext.gamePhase) {
				case phases.ENDGAME:
					messages.push(
						`The passed pawn on ${pawnSquare} is an important asset in the endgame for ${capitalize(color)}`
					);
					break;
				case phases.MIDDLEGAME:
					importance -= 0.2;
					messages.push(
						`${capitalize(
							color
						)} should try to defend the passed pawn on ${pawnSquare} if possible to prepare for the endgame`
					);
					break;
				case phases.OPENING:
					importance -= 0.5;
					messages.push(
						`${capitalize(
							color
						)} has a passed pawn on ${pawnSquare}, but it is early in the game and it is unlikely to promote`
					);
			}

			/* ---------------------------------- RANK ---------------------------------- */
			const isAdvanced = color === "white" ? pawnRank >= 5 : pawnRank <= 4;
			if (isAdvanced) {
				messages.push(
					`${capitalize(color)}'s passed pawn on ${pawnSquare} is far up the board, making it a valuable asset`
				);
			} else {
				importance -= 0.2;
			}

			/* -------------------------------- ISOLATED -------------------------------- */
			isIsolated = isolatedPawns.some((p) => p[0] === pawnPosition[0] && p[1] === pawnPosition[1]);
			if (isIsolated) {
				importance -= 0.3;
				messages.push(`${capitalize(color)}'s passed pawn on ${pawnSquare} is vulnerable to attacks.`);
			}

			/* ----------------------------- DEFENDED BY PAWN ---------------------------- */
			const isDefendedByPawn = friendlySquarePressure.pieces.some((p) => p.type.toLowerCase() === "p");
			if (isDefendedByPawn) {
				importance += 0.3;
				messages.push(`The pawn on ${pawnSquare} is well-supported by another pawn.`);
			}

			/* -------------------------------- SEVERITY -------------------------------- */
			let severity: Severity = "neutral";

			if (importance >= 0.7) {
				severity = "significant advantage";
			} else if (importance >= 0.6) {
				severity = "minor advantage";
			} else {
				severity = "neutral";
			}

			/* --------------------------- GOING TO BE TAKEN? --------------------------- */
			const isPawnVulnerable = isPieceVulnerable(color, squarePressure, 1);
			if (isPawnVulnerable != vulnerabilityMetrics.SAFE) {
				messages.push();
				severity = "neutral";

				results.push({
					ruleId: "PASSED_PAWN",
					ruleName: "Passed Pawn",
					severity: severity,
					color: color,
					messages: [`The pawn on ${pawnSquare} is passed, however is immediately vulnerable to capture.`],
					parsedAffectedSquares: [pawnSquare],
				});
				return;
			} //edge case where having a passed pawn honestly does not matter

			const ruleResult: RuleResult = {
				ruleId: "PASSED_PAWN",
				ruleName: "Passed Pawn",
				severity,
				color,
				messages: messages.slice(0, 3),
				parsedAffectedSquares: [pawnSquare],
			};

			results.push(ruleResult);
		});
	};

	processColor("white");
	processColor("black");

	return results;
}

/* ----------------------------- ISOLATED PAWNS ----------------------------- */
export const IsolatedPawnRule: Rule = {
	id: "ISOLATED_PAWN",
	displayName: "Isolated Pawn",
	category: "pawn",
	evaluate: evaluateIsolatedPawns,
};

function evaluateIsolatedPawns(enrichedContext: EnrichedContext): RuleResult[] {
	const isolatedPawnRuleResults: RuleResult[] = [];

	const parsedPawnHeuristics = enrichedContext.parsedHeuristics.pawnHeuristics;
	const parsedSquarePressure = enrichedContext.parsedHeuristics.imbalanceHeuristics.pressureMap;
	const phase = enrichedContext.gamePhase;

	const processColor = (color: "white" | "black") => {
		const opposingColor = color === "white" ? "black" : "white";

		const parsedIsolatedPawns = parsedPawnHeuristics.isolatedPawns[color];

		const colorRulesResult: RuleResult[] = [];

		parsedIsolatedPawns.forEach((pawn) => {
			let severity: Severity = "minor weakness";
			const messages = [];

			const pawnCentrality: CentralType = getPieceCentrality(pawn);
			const pawnSquarePressure: SquarePressure = parsedSquarePressure[pawn];

			const isPawnVulnerable = isPieceVulnerable(color, pawnSquarePressure, 1);

			if (pawnCentrality !== centralTypes.NOT_CENTRAL) {
				severity = "significant weakness";
				messages.push(
					`${capitalize(color)}'s isolated pawn on ${pawn} is central, making it a clear target for ${opposingColor}.`
				);
			}
			if (phase === phases.ENDGAME) {
				severity = "significant weakness";
				messages.push(
					`During the endgame, ${capitalize(color)}'s isolated pawn on ${pawn} becomes a clearer weakness.`
				);
			}
			if (isPawnVulnerable === vulnerabilityMetrics.HANGING) {
				severity = "significant weakness";
				messages.push(`${capitalize(color)}'s isolated pawn on ${pawn} is especially vulnerable as it is hanging.`);
			}

			if (messages.length === 0) {
				messages.push(`${capitalize(color)} has an isolated pawn on ${pawn}`);
			}

			colorRulesResult.push({
				ruleId: IsolatedPawnRule.id,
				ruleName: IsolatedPawnRule.displayName,
				severity,
				color,
				messages: messages.slice(0, 3),
				parsedAffectedSquares: [pawn],
			});
		});

		return colorRulesResult;
	};

	const whiteIsolatedPawnRuleResults = processColor("white");
	const blackIsolatedPawnRuleResults = processColor("black");

	isolatedPawnRuleResults.push(...whiteIsolatedPawnRuleResults);
	isolatedPawnRuleResults.push(...blackIsolatedPawnRuleResults);

	return isolatedPawnRuleResults;
}

/* ----------------------------- BACKWARDS PAWNS ---------------------------- */
export const BackwardsPawnRule: Rule = {
	id: "BACKWARDS_PAWN",
	displayName: "Backwards Pawn",
	category: "pawn",
	evaluate: evaluateBackwardsPawns,
};

function evaluateBackwardsPawns(enrichedContext: EnrichedContext): RuleResult[] {
	const backwardsPawnRuleResults: RuleResult[] = [];

	const backwardsPawns = enrichedContext.parsedHeuristics.pawnHeuristics.backwardsPawns;
	const whiteBackwardsPawns = backwardsPawns.white;
	const blackBackwardsPawns = backwardsPawns.black;
	const pressureMap = enrichedContext.parsedHeuristics.imbalanceHeuristics.pressureMap;
	const gamePhase = enrichedContext.gamePhase;

	const processColor = (color: "white" | "black"): RuleResult[] => {
		const colorBackwardsPawnRuleResults: RuleResult[] = [];
		const currentBackwardsPawns = color === "white" ? whiteBackwardsPawns : blackBackwardsPawns;

		currentBackwardsPawns.forEach((pawn) => {
			let severity: Severity = "minor weakness";
			const messages: string[] = [];

			const pawnSquarePressure: SquarePressure = pressureMap[pawn];
			const pawnCentrality: CentralType = getPieceCentrality(pawn);

			const vulnerability = isPieceVulnerable(color, pawnSquarePressure, 1);
			if (vulnerability === vulnerabilityMetrics.HANGING) {
				severity = "significant weakness";
				messages.push(`${capitalize(color)}'s backwards pawn on ${pawn} is under attack.`);
			}

			if (gamePhase === phases.ENDGAME) {
				severity = "significant weakness";
				messages.push(`The endgame makes the backwards pawn on ${pawn} a clear target.`);
			}

			if (pawnCentrality !== centralTypes.NOT_CENTRAL) {
				messages.push(`The backwards pawn on ${pawn} is a weakness in the center.`);
			}

			if (messages.length === 0) {
				messages.push(`${capitalize(color)} has a backwards pawn on ${pawn}.`);
			}

			const currentPawnRuleResult: RuleResult = {
				ruleId: BackwardsPawnRule.id,
				ruleName: BackwardsPawnRule.displayName,
				severity,
				color,
				messages: messages.slice(0, 3),
				parsedAffectedSquares: [pawn],
			};

			colorBackwardsPawnRuleResults.push(currentPawnRuleResult);
		});

		return colorBackwardsPawnRuleResults;
	};

	const whiteBackwardsPawnRuleResults = processColor("white");
	const blackBackwardsPawnRuleResults = processColor("black");

	backwardsPawnRuleResults.push(...whiteBackwardsPawnRuleResults);
	backwardsPawnRuleResults.push(...blackBackwardsPawnRuleResults);

	return backwardsPawnRuleResults;
}

/* ------------------------------- PAWN CHAINS ------------------------------ */
export const PawnChainRule: Rule = {
	id: "PAWN_CHAIN",
	displayName: "Pawn Chain",
	category: "pawn",
	evaluate: evaluatePawnChains,
};

function evaluatePawnChains(enrichedContext: EnrichedContext): RuleResult[] {
	const results: RuleResult[] = [];
	const allPawnChains = enrichedContext.parsedHeuristics.pawnHeuristics.pawnChains;

	const processColor = (color: "white" | "black") => {
		const chains = allPawnChains[color].filter((chain) => chain.pawns.length >= 2);

		chains.forEach((chain) => {
			const chainSequence = chain.pawns.join(" -> ");

			results.push({
				ruleId: PawnChainRule.id,
				ruleName: PawnChainRule.displayName,
				severity: "minor advantage",
				color: color,
				messages: [chainSequence],
				parsedAffectedSquares: chain.pawns,
			});
		});
	};

	processColor("white");
	processColor("black");

	return results;
}

export const PawnStructureRule: Rule = {
	id: "PAWN_STRUCTURE",
	displayName: "Pawn Structure",
	category: "pawn",
	evaluate: evaluatePawnStructures,
};

function evaluatePawnStructures(enrichedContext: EnrichedContext): RuleResult[] {
	const pawnStructureRuleResults: RuleResult[] = [];

	const gamePhase = enrichedContext.gamePhase;

	const allPawnChains = enrichedContext.parsedHeuristics.pawnHeuristics.pawnChains;
	const whitePawnChains = allPawnChains.white.filter((pawnChain) => pawnChain.pawns.length >= 2);
	const whitePawnIslands = allPawnChains.white.filter((pawnChain) => pawnChain.pawns.length < 2);

	const blackPawnChains = allPawnChains.black.filter((pawnChain) => pawnChain.pawns.length >= 2);
	const blackPawnIslands = allPawnChains.black.filter((pawnChain) => pawnChain.pawns.length < 2);

	const processColor = (color: "white" | "black") => {
		const colorPawnStructureVerdict: RuleResult = {
			ruleId: PawnStructureRule.id,
			ruleName: PawnStructureRule.displayName,
			severity: "neutral",
			color,
			messages: [],
			parsedAffectedSquares: [],
		};

		colorPawnStructureVerdict.ruleName = color === "white" ? "Structure (White)" : "Structure (Black)";

		const colorPawnChains = color === "white" ? whitePawnChains : blackPawnChains;
		const colorPawnIslands = color === "white" ? whitePawnIslands : blackPawnIslands;

		if (colorPawnIslands.length > 3) {
			if (gamePhase !== phases.OPENING) {
				colorPawnStructureVerdict.severity = "significant weakness";
				colorPawnStructureVerdict.messages.push(
					`${capitalize(color)}'s pawn structure gives the opponent many good targets.`
				);
			}
		}
		if (colorPawnChains.some((pawnChain) => pawnChain.pawns.length >= 4)) {
			colorPawnStructureVerdict.severity = "minor advantage";
			if (gamePhase !== phases.OPENING) {
				colorPawnStructureVerdict.severity = "significant advantage";
				colorPawnStructureVerdict.messages.push(
					`${capitalize(color)}'s big pawn chain is a major strength in this phase of the game.`
				);
			} else {
				colorPawnStructureVerdict.severity = "minor advantage";
				colorPawnStructureVerdict.messages.push(
					`${capitalize(color)} has maintained a solid pawn structure so far, but it is still early in the game.`
				);
			}
		}

		pawnStructureRuleResults.push(colorPawnStructureVerdict);
	};

	processColor("white");
	processColor("black");

	return pawnStructureRuleResults;
}

const PAWN_PRIORITY: Record<string, number> = {
	PAWN_CHAIN: 4,
	PASSED_PAWN: 3,
	ISOLATED_PAWN: 2,
	BACKWARDS_PAWN: 1,
};

export function mergePawnRules(pawnRules: RuleResult[]): RuleResult[] {
	const mapPawnToRules: Record<square, RuleResult[]> = {};
	const chainRules: RuleResult[] = [];

	for (const rule of pawnRules) {
		if (rule.ruleId === "PAWN_CHAIN" || rule.ruleId === "PAWN_STRUCTURE") {
			chainRules.push(rule);
			continue;
		}

		const squares = rule.parsedAffectedSquares;
		squares.forEach((square) => {
			if (!mapPawnToRules[square]) {
				mapPawnToRules[square] = [];
			}
			mapPawnToRules[square].push(rule);
		});
	}

	const mergedRules = Object.values(mapPawnToRules).map((rules) => {
		return rules.reduce((prev, current) => {
			const prevPriority = PAWN_PRIORITY[prev.ruleId] || 0;
			const currentPriority = PAWN_PRIORITY[current.ruleId] || 0;
			return currentPriority > prevPriority ? current : prev;
		});
	});

	return [...chainRules, ...mergedRules];
}

export const pawnRules: Rule[] = [
	PawnStructureRule,
	PassedPawnRule,
	IsolatedPawnRule,
	BackwardsPawnRule,
	PawnChainRule,
];

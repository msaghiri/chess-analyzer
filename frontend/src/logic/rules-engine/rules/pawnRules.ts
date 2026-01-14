import type { SquarePressure } from "../../feature-extraction/featureExtraction.types";
import { getSquare } from "../../feature-extraction/featureExtractionUtils";
import { centralTypes, phases, vulnerabilityMetrics, type CentralType } from "../constants";
import { capitalize, getPieceCentrality, isPieceVulnerable } from "../rulesEngineUtils";
import type { EnrichedContext } from "../types/context.types";
import type { Rule, RuleResult, Severity } from "../types/rules.types";

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
					messages.push(`The passed pawn on ${pawnSquare} is an important asset in the endgame for ${color}`);
					break;
				case phases.MIDDLEGAME:
					importance -= 0.2;
					messages.push(
						`${
							color.charAt(0).toUpperCase() + color.slice(1)
						} should try to defend the passed pawn on ${pawnSquare} if possible to prepare for the endgame`
					);
					break;
				case phases.OPENING:
					importance -= 0.5;
					messages.push(
						`${
							color.charAt(0).toUpperCase() + color.slice(1)
						} has a passed pawn on ${pawnSquare}, but it is early in the game and it is unlikely to promote`
					);
			}

			/* ---------------------------------- RANK ---------------------------------- */
			const isAdvanced = color === "white" ? pawnRank >= 5 : pawnRank <= 4;
			if (isAdvanced) {
				messages.push(
					`${
						color.charAt(0).toUpperCase() + color.slice(1)
					}'s passed pawn on ${pawnSquare} is far up the board, making it a valuable asset`
				);
			} else {
				importance -= 0.2;
			}

			/* -------------------------------- ISOLATED -------------------------------- */
			isIsolated = isolatedPawns.some((p) => p[0] === pawnPosition[0] && p[1] === pawnPosition[1]);
			if (isIsolated) {
				importance -= 0.3;
				messages.push(
					`${color.charAt(0).toUpperCase() + color.slice(1)}'s passed pawn on ${pawnSquare} is vulnerable to attacks.`
				);
			}

			/* ----------------------------- DEFENDED BY PAWN ---------------------------- */
			const isDefendedByPawn = friendlySquarePressure.pieces.some((p) => p.type.toLowerCase() === "p");
			if (isDefendedByPawn) {
				importance += 0.3;
				messages.push(`The pawn on ${pawnSquare} is well-supported by another pawn.`);
			}

			/* -------------------------------- SEVERITY -------------------------------- */
			let severity = "positive" as "critical" | "significant" | "minor" | "positive";

			if (importance >= 0.6) {
				severity = "positive";
			} else {
				severity = "minor";
			}

			/* --------------------------- GOING TO BE TAKEN? --------------------------- */
			const isPawnVulnerable = isPieceVulnerable(color, squarePressure, 1);
			if (isPawnVulnerable != vulnerabilityMetrics.SAFE) {
				messages.push();
				severity = "minor";

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
			let severity: Severity = "minor";
			const messages = [];

			const pawnCentrality: CentralType = getPieceCentrality(pawn);
			const pawnSquarePressure: SquarePressure = parsedSquarePressure[pawn];

			const isPawnVulnerable = isPieceVulnerable(color, pawnSquarePressure, 1);

			if (pawnCentrality !== centralTypes.NOT_CENTRAL) {
				severity = "significant";
				messages.push(`${color}'s isolated pawn on ${pawn} is central, making it a clear target for ${opposingColor}.`);
			}
			if (phase === phases.ENDGAME) {
				severity = "significant";
				messages.push(`During the endgame, ${color}'s isolated pawn on ${pawn} becomes a clearer weakness.`);
			}
			if (isPawnVulnerable === vulnerabilityMetrics.HANGING) {
				severity = "significant";
				messages.push(`${color}'s isolated pawn on ${pawn} is especially vulnerable as it is hanging.`);
			}

			if (messages.length === 0) {
				messages.push(`${color} has an isolated pawn on ${pawn}`);
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
			let severity: Severity = "minor";
			const messages: string[] = [];

			const pawnSquarePressure: SquarePressure = pressureMap[pawn];
			const pawnCentrality: CentralType = getPieceCentrality(pawn);

			const vulnerability = isPieceVulnerable(color, pawnSquarePressure, 1);
			if (vulnerability === vulnerabilityMetrics.HANGING) {
				severity = "significant";
				messages.push(`${capitalize(color)}'s backwards pawn on ${pawn} is under attack.`);
			}

			if (gamePhase === phases.ENDGAME) {
				severity = "significant";
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

export const pawnRules: Rule[] = [PassedPawnRule, IsolatedPawnRule, BackwardsPawnRule];

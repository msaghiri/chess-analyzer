import { getSquare } from "../../feature-extraction/featureExtractionUtils";
import { phases, vulnerabilityMetrics } from "../constants";
import { isPieceVulnerable } from "../rulesEngineUtils";
import type { EnrichedContext } from "../types/context.types";
import type { Rule, RuleResult } from "../types/rules.types";

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
					affectedSquares: [pawnPosition],
					parsedAffectedSquares: [pawnSquare],
				});
				return;
			} //edge case where having a passed pawn honestly does not matter

			const ruleResult: RuleResult = {
				ruleId: "PASSED_PAWN",
				ruleName: "Passed Pawn",
				severity,
				color,
				messages,
				affectedSquares: [pawnPosition],
				parsedAffectedSquares: [pawnSquare],
			};

			results.push(ruleResult);
		});
	};

	processColor("white");
	processColor("black");

	return results;
}

export const pawnRules: Rule[] = [PassedPawnRule];

import { getSquare, RANKS, FILES } from "../../feature-extraction/featureExtractionUtils";
import { phases } from "../constants";
import type { EnrichedContext } from "../types/context.types";
import type { Rule, RuleResult } from "../types/rules.types";

export const BishopPairRule: Rule = {
	id: "BISHOP_PAIR",
	displayName: "Bishop Pair",
	category: "imbalance",
	evaluate: evaluateBishopPair,
};

function findBishops(chessboard: string[][]): string[] {
	const bishopSquares: string[] = [];

	for (let rank = 0; rank < RANKS; rank++) {
		for (let file = 0; file < FILES; file++) {
			if (chessboard[rank][file].toLowerCase() === "b") {
				bishopSquares.push(getSquare([rank, file]));
			}
		}
	}

	return bishopSquares;
}

//TODO: RETURN SQUARES FOR THE BISHOPS OF THE SIDE WITH THE BISHOP PAIR
function evaluateBishopPair(enrichedContext: EnrichedContext): RuleResult[] {
	const bishopPairRuleResult: RuleResult = {
		ruleId: BishopPairRule.id,
		ruleName: BishopPairRule.displayName,
		messages: [],
		color: "neutral",
		severity: "neutral",
		affectedSquares: [],
		parsedAffectedSquares: [],
	};

	const bishopPairWhite = enrichedContext.heuristics.imbalanceHeuristics.bishopPair.white;
	const bishopPairBlack = enrichedContext.heuristics.imbalanceHeuristics.bishopPair.black;

	if (bishopPairWhite && bishopPairBlack) {
		bishopPairRuleResult.color = "neutral";
		bishopPairRuleResult.severity = "neutral";
		bishopPairRuleResult.messages.push("Both sides have the bishop pair.");
	} else if (!bishopPairWhite && !bishopPairBlack) {
		bishopPairRuleResult.color = "neutral";
		bishopPairRuleResult.severity = "neutral";
		bishopPairRuleResult.messages.push("Neither side has the bishop pair.");
	} else if (bishopPairWhite && !bishopPairBlack) {
		bishopPairRuleResult.color = "white";
		bishopPairRuleResult.severity = "positive";

		if (enrichedContext.gamePhase === phases.ENDGAME) {
			bishopPairRuleResult.messages.push("White's bishop pair is a valuable asset in the endgame.");
		} else {
			bishopPairRuleResult.messages.push("White has the bishop pair.");
		}
	} else {
		bishopPairRuleResult.color = "black";
		bishopPairRuleResult.severity = "positive";

		if (enrichedContext.gamePhase === phases.ENDGAME) {
			bishopPairRuleResult.messages.push("Black's bishop pair is a valuable asset in the endgame.");
		} else {
			bishopPairRuleResult.messages.push("Black has the bishop pair.");
		}
	}

	const chessboard = enrichedContext.parsedHeuristics.chessboard;
	const bishopPositions: string[] = findBishops(chessboard);

	bishopPairRuleResult.parsedAffectedSquares = bishopPositions;

	return [bishopPairRuleResult];
}

export const MaterialImbalanceRule: Rule = {
	id: "MATERIAL_IMBALANCES",
	displayName: "Material Imbalances",
	category: "imbalance",
	evaluate: evaluateMaterialImbalances,
};

//this one should be returning about two messages
function evaluateMaterialImbalances(enrichedContext: EnrichedContext): RuleResult[] {
	const { materialCount } = enrichedContext.heuristics.imbalanceHeuristics;

	const differences = {
		q: materialCount.white.q - materialCount.black.q,
		r: materialCount.white.r - materialCount.black.r,
		b: materialCount.white.b - materialCount.black.b,
		n: materialCount.white.n - materialCount.black.n,
		p: materialCount.white.p - materialCount.black.p,
	};

	const hasImbalance = Object.values(differences).some((diff) => diff !== 0);
	if (!hasImbalance) return [];

	const result: RuleResult = {
		ruleId: MaterialImbalanceRule.id,
		ruleName: MaterialImbalanceRule.displayName,
		messages: [],
		color: "neutral",
		severity: "minor",
		affectedSquares: [],
		parsedAffectedSquares: [],
	};

	const whiteAdvantages: string[] = [];
	const blackAdvantages: string[] = [];

	const pieceNames = {
		q: "queen",
		r: "rook",
		b: "bishop",
		n: "knight",
		p: "pawn",
	};

	for (const [piece, diff] of Object.entries(differences)) {
		if (diff > 0) {
			const name =
				Math.abs(diff) === 1
					? pieceNames[piece as keyof typeof pieceNames]
					: `${pieceNames[piece as keyof typeof pieceNames]}s`;
			whiteAdvantages.push(`${Math.abs(diff)} ${name}`);
		} else if (diff < 0) {
			const name =
				Math.abs(diff) === 1
					? pieceNames[piece as keyof typeof pieceNames]
					: `${pieceNames[piece as keyof typeof pieceNames]}s`;
			blackAdvantages.push(`${Math.abs(diff)} ${name}`);
		}
	}

	if (whiteAdvantages.length > 0) {
		result.messages.push(`White is up: ${whiteAdvantages.join(", ")}`);
	}

	if (blackAdvantages.length > 0) {
		result.messages.push(`Black is up: ${blackAdvantages.join(", ")}`);
	}

	return [result];
}

export const imbalanceRules = [BishopPairRule, MaterialImbalanceRule];

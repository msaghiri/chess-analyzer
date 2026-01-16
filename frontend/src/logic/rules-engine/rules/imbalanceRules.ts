import type { ParsedPieceAttackMap, ParsedPieceMap, square } from "../../feature-extraction/featureExtraction.types";
import { getSquare, RANKS, FILES } from "../../feature-extraction/featureExtractionUtils";
import { phases } from "../constants";
import { capitalize, getSquareColor, getSquareColorMap, type SquareColorMap } from "../rulesEngineUtils";
import type { EnrichedContext } from "../types/context.types";
import type { Rule, RuleResult, Severity } from "../types/rules.types";

/* ------------------------------ BISHOP PAIRS ------------------------------ */
export const BishopPairRule: Rule = {
	id: "BISHOP_PAIR",
	displayName: "Bishop Pair",
	category: "imbalance",
	evaluate: evaluateBishopPair,
};

function findBishops(chessboard: string[][]): { white: string[]; black: string[] } {
	const WHITE_BISHOP = "B";
	const BLACK_BISHOP = "b";

	const bishopSquares = {
		white: [] as string[],
		black: [] as string[],
	};

	for (let rank = 0; rank < RANKS; rank++) {
		for (let file = 0; file < FILES; file++) {
			if (chessboard[rank][file] === WHITE_BISHOP) {
				bishopSquares.white.push(getSquare([rank, file]));
			} else if (chessboard[rank][file] === BLACK_BISHOP) {
				bishopSquares.black.push(getSquare([rank, file]));
			}
		}
	}

	return bishopSquares;
}

function evaluateBishopPair(enrichedContext: EnrichedContext): RuleResult[] {
	const bishopPairRuleResult: RuleResult = {
		ruleId: BishopPairRule.id,
		ruleName: BishopPairRule.displayName,
		messages: [],
		color: "neutral",
		severity: "neutral",
		parsedAffectedSquares: [],
	};

	const bishopPairWhite = enrichedContext.heuristics.imbalanceHeuristics.bishopPair.white;
	const bishopPairBlack = enrichedContext.heuristics.imbalanceHeuristics.bishopPair.black;

	const chessboard = enrichedContext.parsedHeuristics.chessboard;
	const allBishopPositions = findBishops(chessboard);

	if (bishopPairWhite && bishopPairBlack) {
		bishopPairRuleResult.color = "neutral";
		bishopPairRuleResult.severity = "neutral";
		bishopPairRuleResult.messages.push("Both sides have the bishop pair.");
		bishopPairRuleResult.parsedAffectedSquares.push(...allBishopPositions.white);
		bishopPairRuleResult.parsedAffectedSquares.push(...allBishopPositions.black);
	} else if (!bishopPairWhite && !bishopPairBlack) {
		bishopPairRuleResult.color = "neutral";
		bishopPairRuleResult.severity = "neutral";
		bishopPairRuleResult.messages.push("Neither side has the bishop pair.");
	} else if (bishopPairWhite && !bishopPairBlack) {
		bishopPairRuleResult.color = "white";

		bishopPairRuleResult.severity = "minor advantage";
		bishopPairRuleResult.parsedAffectedSquares.push(...allBishopPositions.white);

		if (enrichedContext.gamePhase === phases.ENDGAME) {
			bishopPairRuleResult.severity = "significant advantage";
			bishopPairRuleResult.messages.push("White's bishop pair is a valuable asset in the endgame.");
		} else {
			bishopPairRuleResult.messages.push("White has the bishop pair.");
		}
	} else {
		bishopPairRuleResult.color = "black";
		bishopPairRuleResult.severity = "minor advantage";
		bishopPairRuleResult.parsedAffectedSquares.push(...allBishopPositions.black);

		if (enrichedContext.gamePhase === phases.ENDGAME) {
			bishopPairRuleResult.severity = "significant advantage";
			bishopPairRuleResult.messages.push("Black's bishop pair is a valuable asset in the endgame.");
		} else {
			bishopPairRuleResult.messages.push("Black has the bishop pair.");
		}
	}

	return [bishopPairRuleResult];
}

/* --------------------------- MATERIAL IMBALANCES -------------------------- */
export const MaterialImbalanceRule: Rule = {
	id: "MATERIAL_IMBALANCES",
	displayName: "Material Imbalances",
	category: "imbalance",
	evaluate: evaluateMaterialImbalances,
};

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
		severity: "neutral",
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

/* -------------------- BAD PIECES (BISHOPS AND KNIGHTS) -------------------- */
export const BadPiecesRule: Rule = {
	id: "BAD_PIECES",
	displayName: "Bad Pieces",
	category: "imbalance",
	evaluate: evaluateBadPieces,
};

interface MinorPieces {
	white: {
		bishops: square[];
		knights: square[];
	};
	black: {
		bishops: square[];
		knights: square[];
	};
}

function findMinorPieces(parsedPieceAttackMap: ParsedPieceAttackMap): MinorPieces {
	const BISHOP = "b";
	const KNIGHT = "n";

	const minorPieces = {
		white: {
			bishops: [] as square[],
			knights: [] as square[],
		},
		black: {
			bishops: [] as square[],
			knights: [] as square[],
		},
	};

	const whitePieces = parsedPieceAttackMap.white;
	const blackPieces = parsedPieceAttackMap.black;

	const processColor = (color: "white" | "black") => {
		const colorPieces = color === "white" ? whitePieces : blackPieces;

		colorPieces.forEach((piece) => {
			if (piece.pieceType === BISHOP) {
				minorPieces[color].bishops.push(piece.attackerPosition);
			} else if (piece.pieceType === KNIGHT) {
				minorPieces[color].knights.push(piece.attackerPosition);
			}
		});
	};

	processColor("white");
	processColor("black");
	return minorPieces;
}

function evaluateBadPieces(enrichedContext: EnrichedContext): RuleResult[] {
	const badPiecesRuleResults: RuleResult[] = [];

	const pawns: ParsedPieceMap = enrichedContext.parsedHeuristics.pawnHeuristics.pawns;
	const bishopsAndKnights: MinorPieces = findMinorPieces(
		enrichedContext.parsedHeuristics.imbalanceHeuristics.attackMap
	);

	const pieceAttackMap = enrichedContext.parsedHeuristics.imbalanceHeuristics.attackMap;

	const whiteMinorPieces = bishopsAndKnights.white;
	const blackMinorPieces = bishopsAndKnights.black;

	const whitePawns = pawns.white;
	const blackPawns = pawns.black;

	const whiteSquareColorMap = getSquareColorMap(whitePawns);
	const blackSquareColorMap = getSquareColorMap(blackPawns);

	const findBishopMoves = (bishop: square, color: "white" | "black"): square[] => {
		const colorAttackMap = pieceAttackMap[color];
		let moves: square[] = [];
		colorAttackMap.forEach((piece) => {
			if (piece.attackerPosition === bishop) {
				console.log(`Bishop found at ${piece.attackerPosition}`);
				console.log(piece.squares);
				moves = piece.squares;
				return;
			}
		});

		return moves;
	};

	//todo-- this can be a lot better
	const evaluateBadBishop = (bishop: square, color: "white" | "black") => {
		let severity: Severity = "neutral";
		const messages: string[] = [];

		const friendlyPawnColorMap = color === "white" ? whiteSquareColorMap : blackSquareColorMap;
		const opposingPawnColorMap = color === "white" ? blackSquareColorMap : whiteSquareColorMap;
		const bishopSquareColor = getSquareColor(bishop);
		const oppositeSquareColor = bishopSquareColor === "light" ? "dark" : "light";

		const bishopMoves = findBishopMoves(bishop, color);

		//bishop cannot move
		if (bishopMoves.length === 0 && enrichedContext.gamePhase !== phases.OPENING) {
			severity = "significant weakness";
			messages.push(`${capitalize(color)}'s ${bishopSquareColor}-square bishop cannot move!`);
			badPiecesRuleResults.push({
				ruleId: BadPiecesRule.id,
				ruleName: "Bad Bishop",
				severity: severity,
				color: color,
				parsedAffectedSquares: [],
				messages: messages,
			});
			return;
		}
		//bishop has low mobility
		if (bishopMoves.length <= 3 && enrichedContext.gamePhase !== phases.OPENING) {
			severity = "minor weakness";
			messages.push(`${capitalize(color)}'s ${bishopSquareColor}-square bishop has bad mobility.`);
			badPiecesRuleResults.push({
				ruleId: BadPiecesRule.id,
				ruleName: "Bad Bishop",
				severity: severity,
				color: color,
				parsedAffectedSquares: [],
				messages: messages,
			});
			return;
		}
		//bishop color relative to friendly pawns
		if (friendlyPawnColorMap[bishopSquareColor].length > friendlyPawnColorMap[oppositeSquareColor].length) {
			severity = "minor weakness";
			messages.push(`${capitalize(color)}'s ${bishopSquareColor}-square bishop is weakened by their pawn structure.`);
		} else if (friendlyPawnColorMap[bishopSquareColor].length < friendlyPawnColorMap[oppositeSquareColor].length) {
			severity = "minor advantage";
			messages.push(
				`${capitalize(color)}'s ${bishopSquareColor}-square bishop is well positioned to support ${capitalize(
					color
				)}'s pawn structure.`
			);
		}

		console.log(bishop);

		badPiecesRuleResults.push({
			ruleId: BadPiecesRule.id,
			ruleName: severity === "minor weakness" ? "Bad Bishop" : "Good Bishop",
			severity,
			color,
			messages,
			parsedAffectedSquares: [],
		});
	};
	const evaluateBadKnight = (knight: square, color: "white" | "black") => {};

	const whiteBishops = whiteMinorPieces.bishops;
	const blackBishops = blackMinorPieces.bishops;
	const whiteKnights = whiteMinorPieces.knights;
	const blackKnights = blackMinorPieces.knights;

	whiteBishops.forEach((bishop) => evaluateBadBishop(bishop, "white"));
	blackBishops.forEach((bishop) => evaluateBadBishop(bishop, "black"));
	whiteKnights.forEach((knight) => evaluateBadKnight(knight, "white"));
	blackKnights.forEach((knight) => evaluateBadKnight(knight, "black"));

	return badPiecesRuleResults;
}

export const imbalanceRules = [BishopPairRule, MaterialImbalanceRule, BadPiecesRule];

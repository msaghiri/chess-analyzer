import type {
	OverallHeuristics,
	ParsedImbalanceHeuristics,
	ParsedOverallHeuristics,
	ParsedPawnChains,
	ParsedPawnHeuristics,
	ParsedPieceMap,
} from "./featureExtraction.types";
import {
	fenToArray,
	parsePawnChains,
	parsePieceAttackMap,
	parsePieceMap,
	parsePressureMap,
} from "./featureExtractionUtils";
import { analyzePieces } from "./heuristics/imbalances";
import { analyzePawns } from "./heuristics/pawns";

export const runAnalysis = (fen: string): OverallHeuristics => {
	const chessboard = fenToArray(fen);
	const imbalanceHeuristics = analyzePieces(chessboard);
	const pawnHeuristics = analyzePawns(chessboard, imbalanceHeuristics.pressureMap);

	return { imbalanceHeuristics, pawnHeuristics, chessboard };
};

export const parseHeuristics = (overallHeuristics: OverallHeuristics): ParsedOverallHeuristics => {
	const pawnHeuristics = overallHeuristics.pawnHeuristics;
	const imbalanceHeuristics = overallHeuristics.imbalanceHeuristics;

	const parsedPassedPawns: ParsedPieceMap = parsePieceMap(pawnHeuristics.passedPawns);
	const parsedIsolatedPawns: ParsedPieceMap = parsePieceMap(pawnHeuristics.isolatedPawns);
	const parsedBackwardsPawns: ParsedPieceMap = parsePieceMap(pawnHeuristics.backwardsPawns);
	const parsedPawnChains: ParsedPawnChains = parsePawnChains(pawnHeuristics.pawnChains);

	const parsedPawnHeuristics: ParsedPawnHeuristics = {
		passedPawns: parsedPassedPawns,
		isolatedPawns: parsedIsolatedPawns,
		backwardsPawns: parsedBackwardsPawns,
		pawnChains: parsedPawnChains,
	};

	const parsedAttackMap = parsePieceAttackMap(imbalanceHeuristics.attackMap);
	const parsedPressureMap = parsePressureMap(imbalanceHeuristics.pressureMap);

	const parsedImbalanceHeuristics: ParsedImbalanceHeuristics = {
		attackMap: parsedAttackMap,
		materialCount: imbalanceHeuristics.materialCount,
		pressureMap: parsedPressureMap,
		bishopPair: imbalanceHeuristics.bishopPair,
	};

	return {
		pawnHeuristics: parsedPawnHeuristics,
		imbalanceHeuristics: parsedImbalanceHeuristics,
		chessboard: overallHeuristics.chessboard,
	};
};

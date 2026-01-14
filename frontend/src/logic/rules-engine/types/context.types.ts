import type {
	OverallHeuristics,
	ParsedOverallHeuristics,
	PiecePosition,
	square,
} from "../../feature-extraction/featureExtraction.types";
import type { CentralType, GamePhase } from "../constants";

export interface WeakSquareInfo {
	square: PiecePosition;
	controlledByOpponent: boolean;
	nearKing: boolean;
	centrality: CentralType;
}

export interface OutpostInfo {
	square: square;
	piece: string;
	piecePosition: PiecePosition;
	protectedByPawn: boolean;
	cannotBeAttackedByPawn: boolean;
	inEnemyTerritory: boolean;
}

export interface EnrichedContext {
	fen: string;
	heuristics: OverallHeuristics;
	parsedHeuristics: ParsedOverallHeuristics;
	gamePhase: GamePhase;
	toPlay: "white" | "black";
}

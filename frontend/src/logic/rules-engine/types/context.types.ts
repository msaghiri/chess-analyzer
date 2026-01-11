// rules-engine/types/context.types.ts
import type { OverallHeuristics, ParsedOverallHeuristics } from "../../feature-extraction/featureExtraction.types";

export interface WeakSquareinfo {
	square: square;
	cannotBeDefendedByPawn: boolean;
	controlledByOpponent: boolean;
	inEnemyTerritory: boolean;
}

export interface OutpostInfo {
	square: square;
	piece: string;
	piecePosition: square;
	protectedByPawn: boolean;
	cannotBeAttackedByPawn: boolean;
	inEnemyTerritory: boolean;
}

export interface OverallContext {
	fen: string;
	heuristics: OverallHeuristics;
	parsedHeuristics: ParsedOverallHeuristics;

	weakSquares: {
		white: WeakSquareInfo[];
		black: WeakSquareInfo[];
	};

	outposts: {
		white: OutpostInfo[];
		black: OutpostInfo[];
	};

	pawnIslands: {
		white: number;
		black: number;
	};
}

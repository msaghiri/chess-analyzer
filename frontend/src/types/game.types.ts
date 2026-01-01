//actual positions
export interface GamePosition {
	fen: string;
	positionFeatures: PositionFeatures;
}

//position features
export interface PositionFeatures {
	evaluation: EvaluationObject[];
}

//for a single given move
export interface EvaluationObject {
	depth: number; //i think we should use seldepth for this, maybe time in the future?
	move: string;
	evaluation: number;
}

//game
export interface ChessGame {
	gamePositions: GamePosition[];
	pgn: string;
}

//What the analysis context returns
export interface AnalysisContextType {
	pgn: string;
	loadPgn: (
		pgn: string,
		onLoad: () => void,
		reportProgressTo?: (progress: number) => void
	) => boolean;
	gamePositions: GamePosition[];
}

//For board navigation
export interface BoardState {
	fen: string;
	index: number;
}

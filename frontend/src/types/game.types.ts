//actual positions
export interface GamePosition {
	fen: string;
	positionFeatures: PositionFeatures;
}

//position features
export interface PositionFeatures {
	evaluation?: string[];
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
		reportProgressTo?: (progress: number) => void
	) => boolean;
	gamePositions: GamePosition[];
}

//For board navigation
export interface BoardState {
	fen: string;
	index: number;
}

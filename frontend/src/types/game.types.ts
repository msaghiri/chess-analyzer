//actual positions
export interface GamePosition {
	fen: string;
	positionFeatures: object;
}

//game
export interface ChessGame {
	gamePositions: GamePosition[];
	pgn: string;
}

//What the analysis context returns
export interface AnalysisContextType {
	pgn: string;
	loadPgn: (pgn: string) => boolean;
	gamePositions: GamePosition[];
}

//For board navigation
export interface BoardState {
	fen: string;
	index: number;
}

//For analysis
export interface GamePosition {
	fen: string;
	positionFeatures: object;
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

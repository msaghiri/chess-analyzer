//For analysis
export interface GamePosition {
	fen: string;
	positionFeatures: object;
}

//What the analysis context returns
export interface AnalysisContextType {
	pgn: string;
	loadPgn: (pgn: string) => void;
	gamePositions: GamePosition[];
}

//For board navigation
export interface PositionObject {
	fen: string;
	index: number;
}

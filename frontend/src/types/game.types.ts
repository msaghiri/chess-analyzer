//actual positions
export interface GamePosition {
	fen: string;
	evaluation: EvaluationObject[];
}

//for a single given move
export interface EvaluationObject {
	depth: number; //i think we should use seldepth for this, maybe time in the future?
	line: string[];
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
	loadPgn: (pgn: string, onLoad: () => void, reportProgressTo?: (progress: number) => void) => boolean;
	gamePositions: GamePosition[];
}

//For board navigation
export interface BoardState {
	fen: string;
	index: number;
}

export interface BoardNav {
	currentPosition: BoardState;
	currentMode: number;
	boardOrientation: "white" | "black";
	nextMove: () => void;
	prevMove: () => void;
	nextMode: () => void;
	prevMode: () => void;
	flipBoard: () => void;
	gamePositions: GamePosition[];
}

export type PiecePosition = number[];
export type square = string;

export interface PieceMap {
	white: PiecePosition[];
	black: PiecePosition[];
}

export interface ParsedPieceMap {
	white: square[];
	black: square[];
}

export interface PieceFiles {
	white: {
		[key: number]: PiecePosition[];
	};
	black: {
		[key: number]: PiecePosition[];
	};
}

export interface PawnChain {
	pawns: PiecePosition[];
	lastPawn: PiecePosition;
}

export interface ParsedPawnChain {
	pawns: square[];
	lastPawn: square;
}

export interface PawnChains {
	white: PawnChain[];
	black: PawnChain[];
}

export interface ParsedPawnChains {
	white: ParsedPawnChain[];
	black: ParsedPawnChain[];
}

export interface PieceDetails {
	type: string;
	position: PiecePosition;
}

export interface ParsedPieceDetails {
	type: string;
	position: square;
}

export interface SquarePressure {
	white: {
		material: number; //total material attacking this square
		pieces: PieceDetails[]; //pieces attacking this square
	};
	black: {
		material: number;
		pieces: PieceDetails[];
	};
	whiteMin: number; //least valuable piece attacking this square
	blackMin: number;
}

export type PressureMap = SquarePressure[][];

export type ParsedPressureMap = {
	[key: square]: SquarePressure;
};

export interface AttackedSquares {
	pieceType: string;
	attackerPosition: PiecePosition;
	value: number;
	squares: PiecePosition[];
}

export interface ParsedAttackedSquares {
	pieceType: string;
	attackerPosition: square;
	value: number;
	squares: square[];
}

export type PieceAttackMap = {
	white: AttackedSquares[];
	black: AttackedSquares[];
};

export type ParsedPieceAttackMap = {
	white: ParsedAttackedSquares[];
	black: ParsedAttackedSquares[];
};

export type MaterialCounter = {
	white: {
		materialCount: number;
		[key: string]: number;
	};
	black: {
		materialCount: number;
		[key: string]: number;
	};
};

export type BishopPair = {
	white: boolean;
	black: boolean;
};

/* ----------------------- OVERALL HEURISTICS OBJECTS ----------------------- */
export interface PawnHeuristics {
	passedPawns: PieceMap;
	isolatedPawns: PieceMap;
	backwardsPawns: PieceMap;
	pawnChains: PawnChains;
}

export interface ParsedPawnHeuristics {
	passedPawns: ParsedPieceMap;
	isolatedPawns: ParsedPieceMap;
	backwardsPawns: ParsedPieceMap;
	pawnChains: ParsedPawnChains;
}

export interface ImbalanceHeuristics {
	attackMap: PieceAttackMap;
	materialCount: MaterialCounter;
	pressureMap: PressureMap;
	bishopPair: BishopPair;
}

export interface ParsedImbalanceHeuristics {
	attackMap: ParsedPieceAttackMap;
	materialCount: MaterialCounter;
	pressureMap: ParsedPressureMap;
	bishopPair: BishopPair;
}

export interface OverallHeuristics {
	pawnHeuristics: PawnHeuristics;
	imbalanceHeuristics: ImbalanceHeuristics;
}

export interface ParsedOverallHeuristics {
	pawnHeuristics: ParsedPawnHeuristics;
	imbalanceHeuristics: ParsedImbalanceHeuristics;
}

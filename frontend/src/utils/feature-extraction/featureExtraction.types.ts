export type PiecePosition = number[];

export interface PositionFeatures {}

export interface PieceMap {
	white: PiecePosition[];
	black: PiecePosition[];
}

export interface PieceFiles {
	white: {
		[key: number]: PiecePosition[];
	};
	black: {
		[key: number]: PiecePosition[];
	};
}

export interface PawnHeuristics {
	//to be implemented later
	passedPawns: {
		white: PiecePosition[];
		black: PiecePosition[];
	};
	pawnChains: {
		white: PiecePosition[][];
		black: PiecePosition[][];
	};
}

export interface SquarePressure {
	white: number;
	black: number;
	whiteMin?: number;
	blackMin?: number;
}

export type PressureMap = SquarePressure[][];

export interface AttackedSquares {
	pieceType: string;
	value: number;
	squares: PiecePosition[];
}

export type PieceAttackMap = {
	white: AttackedSquares[];
	black: AttackedSquares[];
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

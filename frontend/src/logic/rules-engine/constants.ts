export const centralTypes = {
	NOT_CENTRAL: -1,
	SMALL_CENTER: 0,
	BIG_CENTER: 1,
	CENTRAL_FILE: 2,
} as const;

export type centralType = (typeof centralTypes)[keyof typeof centralTypes];

export const CENTRAL_FILES = ["c", "d", "e", "f"];
export const SMALL_CENTER_SQUARES = ["e4", "d4", "e5", "d5"];
export const BIG_CENTER_SQUARES = ["c3", "d3", "e3", "f3", "f4", "f5", "f6", "e6", "d6", "c4", "c5", "c6"];

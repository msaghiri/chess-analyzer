export const centralTypes = {
	NOT_CENTRAL: -1,
	SMALL_CENTER: 0,
	BIG_CENTER: 1,
	CENTRAL_FILE: 2,
} as const;

export type centralType = (typeof centralTypes)[keyof typeof centralTypes];

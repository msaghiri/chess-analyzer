export const modes = {
	PAWNS: 0,
	IMBALANCES: 1,
};
export const NUM_MODES = 2;

export const getMode = (mode: number): string => {
	switch (mode) {
		case modes.PAWNS:
			return "Pawns";
		case modes.IMBALANCES:
			return "Imbalances";
	}

	return "Invalid Mode";
};

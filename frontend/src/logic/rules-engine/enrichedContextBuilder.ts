import type { MaterialCounter } from "../feature-extraction/featureExtraction.types";
import { phases, type GamePhase } from "./constants";

export const getGamePhase = (materialCount: MaterialCounter, moveNum: number): GamePhase => {
	const blackMaterial = materialCount.black.materialCount;
	const whiteMaterial = materialCount.white.materialCount;
	const lesserMaterial = Math.min(blackMaterial, whiteMaterial);

	if (lesserMaterial < 25) {
		return phases.ENDGAME;
	}
	if (moveNum <= 15) {
		return phases.OPENING;
	}

	return phases.MIDDLEGAME;
};

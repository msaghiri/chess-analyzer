import type { MaterialCounter } from "../feature-extraction/featureExtraction.types";
import { phases, type GamePhase } from "./constants";

export const getGamePhase = (materialCount: MaterialCounter): GamePhase => {
	const blackMaterial = materialCount.black.materialCount;
	const whiteMaterial = materialCount.white.materialCount;
	const lesserMaterial = Math.min(blackMaterial, whiteMaterial);
	if (lesserMaterial < 13) return phases.ENDGAME;
	if (lesserMaterial > 30) return phases.OPENING;

	return phases.MIDDLEGAME;
};

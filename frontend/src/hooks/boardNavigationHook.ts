import useAnalysisContext from "./useAnalysisContext";
import { useState } from "react";
import type { PositionObject } from "../types/game.types";

export const useBoardNavigation = () => {
	const { gamePositions } = useAnalysisContext();
	const [currentIndex, setCurrentIndex] = useState(0);

	const nextMove = () => {
		setCurrentIndex((index) =>
			index < gamePositions.length - 1 ? index + 1 : 0
		);
	};
	const prevMove = () => {
		setCurrentIndex((index) =>
			index > 0 ? index - 1 : gamePositions.length - 1
		);
	};

	const currentPosition: PositionObject = {
		fen: gamePositions[currentIndex].fen,
		index: currentIndex,
	};

	return { currentPosition, nextMove, prevMove };
};

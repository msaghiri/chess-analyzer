import useAnalysisContext from "./useAnalysisContext";
import { useState } from "react";
import type { BoardNav, BoardState } from "../types/game.types";

export const useBoardNavigation = (): BoardNav => {
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

	const currentPosition: BoardState = {
		fen: gamePositions[currentIndex].fen,
		index: currentIndex,
	};

	return { currentPosition, nextMove, prevMove, gamePositions };
};

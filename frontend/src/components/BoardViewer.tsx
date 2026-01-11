import { Chessboard } from "react-chessboard";
import type { BoardNav } from "../types/game.types";
import { modes } from "../modes/modes";
import { parseHeuristics, runAnalysis } from "../logic/feature-extraction/featureExtractionService";

const constantChessboardOptions = {
	allowDragging: false,
	animationDurationInMs: 300,
	boardStyle: {
		borderRadius: `4px`,
	},
	darkSquareStyle: {
		backgroundColor: "#5e503f",
	},
	lightSquareStyle: {
		backgroundColor: "#a9927d",
	},
	lightSquareNotationStyle: {
		color: "#5e503f",
	},
};

const BoardViewer = ({ boardInfo }: { boardInfo: BoardNav }) => {
	const currentMode = boardInfo.currentMode;
	const fen = boardInfo.currentPosition.fen;

	const squareStyles: { [key: string]: object } = {};

	const rawHeuristics = runAnalysis(fen);
	const parsedHeuristics = parseHeuristics(rawHeuristics);
	const whiteBackwardsPawns = parsedHeuristics.pawnHeuristics.backwardsPawns.white;

	if (currentMode === modes.PAWNS) {
		for (let i = 0; i < whiteBackwardsPawns.length; i++) {
			squareStyles[whiteBackwardsPawns[i]] = {
				backgroundColor: "rgb(255, 0, 0)",
			};
		}
	}

	const chessboardOptions = {
		...constantChessboardOptions,
		position: boardInfo.currentPosition.fen,
		boardOrientation: boardInfo.boardOrientation,
		squareStyles: squareStyles,
	};

	return <Chessboard options={chessboardOptions} />;
};

export default BoardViewer;

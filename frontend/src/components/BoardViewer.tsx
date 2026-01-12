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
	//const currentMode = boardInfo.currentMode;
	//const currentOrientation = boardInfo.boardOrientation; <-- will be useful later for displaying important things

	const chessboardOptions = {
		...constantChessboardOptions,
		position: boardInfo.currentPosition.fen,
		boardOrientation: boardInfo.boardOrientation,
	};

	return <Chessboard options={chessboardOptions} />;
};

export default BoardViewer;

import { Chessboard } from "react-chessboard";
import type { BoardNav } from "../types/game.types";

const constantChessboardOptions = {
	allowDragging: false,
	animationDurationInMs: 200,
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
	const chessboardOptions = {
		...constantChessboardOptions,
		position: boardInfo.currentPosition.fen,
	};

	return <Chessboard options={chessboardOptions} />;
};

export default BoardViewer;

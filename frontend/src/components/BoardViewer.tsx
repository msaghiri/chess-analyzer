import { Chessboard } from "react-chessboard";
import { useBoardNavigation } from "../hooks/boardNavigationHook";

const constantChessboardOptions = {
	allowDragging: false,
	animationDurationInMs: 200,
	boardStyle: {
		borderRadius: `4px`,
	},
	boardWidth: "100px",
	darkSquareStyle: {
		backgroundColor: "#5e503f",
	},
	lightSquareStyle: {
		backgroundColor: "#a9927d",
	},
};

const ControlsContainer = ({
	prevMove,
	nextMove,
	evalTest,
}: {
	prevMove: () => void;
	nextMove: () => void;
	evalTest: string;
}) => {
	return (
		<div className="flex-1 flex h-full gap-5 items-center justify-center">
			<button
				className="h-12.5 w-30 bg-cyan-900 rounded-2xl"
				onClick={prevMove}
			>
				PREVIOUS
			</button>
			<button
				className="h-12.5 w-30 bg-cyan-900 rounded-2xl"
				onClick={nextMove}
			>
				NEXT
			</button>
			<h1>{evalTest}</h1>
		</div>
	);
};

const BoardViewer = () => {
	const boardInfo = useBoardNavigation();

	const chessboardOptions = {
		...constantChessboardOptions,
		position: boardInfo.currentPosition.fen,
	};

	const currentEval =
		boardInfo.gamePositions[boardInfo.currentPosition.index].positionFeatures
			.evaluation;
	const currentBestMove =
		currentEval.length > 0 ? currentEval[0].evaluation : 0;
	return (
		<div className="flex justify-center items-center gap-3 p-3 bg-gray-700 rounded-2xl">
			<div className="board-container w-170">
				<Chessboard options={chessboardOptions} />
			</div>
			<ControlsContainer
				prevMove={boardInfo.prevMove}
				nextMove={boardInfo.nextMove}
				evalTest={currentBestMove}
			/>
			<h2>{boardInfo.currentPosition.fen}</h2>
		</div>
	);
};

export default BoardViewer;

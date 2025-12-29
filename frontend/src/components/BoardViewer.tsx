import { Chessboard } from "react-chessboard";
import { usingBoardNavigation } from "../hooks/boardNavigationHook";

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

const SAMPLE_PGN = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2025.12.28"]
[Round "?"]
[White "saghiri"]
[Black "jarbis1"]
[Result "1-0"]
[TimeControl "180+2"]
[WhiteElo "1062"]
[BlackElo "1019"]
[Termination "saghiri won by checkmate"]
[ECO "B23"]
[EndTime "0:04:56 GMT+0000"]
[Link "https://www.chess.com/game/live/147261883804"]

1. e4 c5 2. Nc3 d6 3. g3 Nf6 4. Bg2 e5 5. d3 Be7 6. Nge2 Nc6 7. O-O O-O 8. h3
Bd7 9. a3 Qc8 10. f4 Bxh3 11. Bxh3 Qxh3 12. Rf2 Nd4 13. Rh2 Nxe2+ 14. Qxe2 Qxg3+
15. Qg2 Qe1+ 16. Qf1 Qxf1+ 17. Kxf1 Nd7 18. Ke2 a6 19. Be3 b5 20. Nd5 Bd8 21.
Rah1 h6 22. f5 g5 23. Rxh6 Kg7 24. Rh7+ Kg8 25. Rh8+ Kg7 26. R1h7# 1-0`;

const ControlsContainer = ({
	prevMove,
	nextMove,
}: {
	prevMove: () => void;
	nextMove: () => void;
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
		</div>
	);
};

const BoardViewer = () => {
	const boardInfo = usingBoardNavigation();
	console.log(boardInfo);

	const chessboardOptions = {
		...constantChessboardOptions,
		position: boardInfo.currentPosition.fen,
	};

	console.log(boardInfo.loadPgn(SAMPLE_PGN));

	return (
		<div className="flex justify-center items-center gap-3 p-3 bg-gray-700 rounded-2xl">
			<div className="board-container w-170">
				<Chessboard options={chessboardOptions} />
			</div>
			<ControlsContainer
				prevMove={boardInfo.prevMove}
				nextMove={boardInfo.nextMove}
			/>
		</div>
	);
};

export default BoardViewer;

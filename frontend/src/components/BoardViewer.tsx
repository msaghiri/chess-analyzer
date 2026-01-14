import { Chessboard } from "react-chessboard";
import type { BoardNav } from "../types/game.types";
import { modes } from "../modes/modes";
import type { RuleResults, Severity } from "../logic/rules-engine/types/rules.types";
import type { square } from "../logic/feature-extraction/featureExtraction.types";

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

const squareStyleMap: Record<Severity, React.CSSProperties> = {
	critical: {
		backgroundColor: "rgba(153, 0, 0, 0.47)",
	},
	significant: {
		backgroundColor: "rgba(255, 0, 0, 0.38)",
	},
	minor: {
		backgroundColor: "rgba(255, 0, 0, 0.2)",
	},
	neutral: {
		backgroundColor: "rgba(200, 160, 46, 0.73)",
	},
	positive: {
		backgroundColor: "#4b5937",
	},
};

const getCustomSquareStyles = (ruleResults: RuleResults, mode: number): Record<string, React.CSSProperties> => {
	const customSquareStyles: Record<string, React.CSSProperties> = {};
	const currentModeRuleResults = mode === modes.PAWNS ? ruleResults.pawn : ruleResults.imbalance;

	for (const ruleResult of currentModeRuleResults) {
		const severity: Severity = ruleResult.severity;
		const squares: square[] = ruleResult.parsedAffectedSquares;

		for (const currSquare of squares) {
			customSquareStyles[currSquare] = squareStyleMap[severity];
		}
	}

	return customSquareStyles;
};

const BoardViewer = ({ boardInfo }: { boardInfo: BoardNav }) => {
	const mode = boardInfo.currentMode;
	const positionIndex = boardInfo.currentPosition.index;
	const ruleResults = boardInfo.gamePositions[positionIndex].ruleResults;

	const customSquareStyles = getCustomSquareStyles(ruleResults, mode);

	const chessboardOptions = {
		...constantChessboardOptions,
		position: boardInfo.currentPosition.fen,
		boardOrientation: boardInfo.boardOrientation,
		squareStyles: customSquareStyles,
	};

	return <Chessboard options={chessboardOptions} />;
};

export default BoardViewer;

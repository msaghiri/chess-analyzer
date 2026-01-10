import type { BoardNav, EvaluationObject } from "../../types/game.types";
import { Repeat2, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./AnalysisDetails.module.css";

/* -------------------------------- STOCKFISH ------------------------------- */
const StockfishLine = ({ index, line, isFirstLine }: { index: number; line: string[]; isFirstLine: boolean }) => (
	<p className={styles.stockfishLine}>
		{index + 1}.{" "}
		{line.map((move, i) => {
			const isBestMove = isFirstLine && i === 0;
			return (
				<span key={i} className={isBestMove ? styles.bestMove : ""}>
					{move}
					{i < line.length - 1 ? " " : ""}
				</span>
			);
		})}
		...
	</p>
);

const StockfishLines = ({ evaluations }: { evaluations: EvaluationObject[] }) => (
	<div className={styles.stockfishLines}>
		{evaluations.map((evalItem, index) => (
			<StockfishLine key={index} index={index} line={evalItem.line} isFirstLine={index === 0} />
		))}
	</div>
);

const StockfishSection = ({ score, evaluations }: { score: number; evaluations: EvaluationObject[] }) => (
	<section className={styles.stockfishSection}>
		<h1 className={styles.stockfishEvaluation}>{score}</h1>
		<StockfishLines evaluations={evaluations} />
	</section>
);

/* --------------------------- NAVIGATION CONTROLS -------------------------- */
const NavigationControls = ({
	onPrev,
	onNext,
	flipBoard,
}: {
	onPrev: () => void;
	onNext: () => void;
	flipBoard: () => void;
}) => (
	<div className={styles.buttonsContainer}>
		<button className={styles.navigateButton} onClick={flipBoard}>
			<Repeat2 size={30} />
		</button>
		<button className={styles.navigateButton} onClick={onPrev}>
			<ChevronLeft size={30} />
		</button>
		<button className={styles.navigateButton} onClick={onNext}>
			<ChevronRight size={30} />
		</button>
	</div>
);

/* ----------------------------- MAIN COMPONENT ----------------------------- */
const AnalysisDetails = ({ boardInfo }: { boardInfo: BoardNav }) => {
	const idx = boardInfo.currentPosition.index;
	const activeColor = boardInfo.currentPosition.fen.split(" ")[1];
	const currentEvalData = boardInfo.gamePositions[idx].evaluation;

	const rawScore = currentEvalData[0]?.evaluation ?? 0;
	const displayScore = activeColor === "w" ? rawScore : rawScore * -1;

	return (
		<div className={styles.sidebar}>
			<StockfishSection score={displayScore} evaluations={currentEvalData} />

			<div className={styles.heuristicsContainer}></div>

			<NavigationControls onPrev={boardInfo.prevMove} onNext={boardInfo.nextMove} flipBoard={boardInfo.flipBoard} />
		</div>
	);
};

export default AnalysisDetails;

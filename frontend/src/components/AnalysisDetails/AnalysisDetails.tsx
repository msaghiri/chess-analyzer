import type { BoardNav, EvaluationObject, GamePosition } from "../../types/game.types";
import { Repeat2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import styles from "./AnalysisDetails.module.css";
import { getMode } from "./../../modes/modes";
import type { RuleResult } from "../../logic/rules-engine/types/rules.types";
import { useState } from "react";

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
		{"..."}
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

const ModeNavigation = ({
	currentMode,
	nextMode,
	prevMode,
}: {
	currentMode: string;
	nextMode: () => void;
	prevMode: () => void;
}) => {
	return (
		<div className={styles.modeNavigationContainer}>
			<button className={styles.modeButton} onClick={prevMode}>
				<ChevronLeft size={30} />
			</button>

			<h1 className={styles.modeHeader}>{currentMode}</h1>

			<button className={styles.modeButton} onClick={nextMode}>
				<ChevronRight size={30} />
			</button>
		</div>
	);
};

/* --------------------------- HEURISTICS SECTION --------------------------- */

const SingleRule = ({ rule }: { rule: RuleResult }) => {
	const [expanded, setExpanded] = useState(false);

	const ruleName = rule.ruleName;
	const ruleMessages = rule.messages;
	const ruleCategory = rule.severity;

	const toggleExpand = () => {
		setExpanded((e) => !e);
	};

	return (
		<div className={`${styles.ruleContainer} ${expanded ? styles.ruleContainerExpanded : ""}`}>
			<div className={styles.ruleContainerHeader}>
				<h1 className={styles.ruleName}>{ruleName}</h1>
				<button className={styles.expandButton} onClick={toggleExpand}>
					<ChevronDown />
				</button>
			</div>
			<div className={styles.ruleContainerBody}>
				{ruleMessages.map((m) => <p className={styles.actualRule}>{m}</p>)}
			</div>
		</div>
	);
};

const HeuristicsSection = ({ ruleResults }: { ruleResults: RuleResult[] }) => {
	const pawnRules = ruleResults; //right now we only have one rule (a pawn rule), later we will split by category and stuff

	return (
		<div className={styles.heuristicsContainer}>
			{ruleResults.map((rule) => (
				<SingleRule rule={rule} />
			))}
		</div>
	);
};

/* ----------------------------- MAIN COMPONENT ----------------------------- */
const AnalysisDetails = ({ boardInfo }: { boardInfo: BoardNav }) => {
	const idx = boardInfo.currentPosition.index;
	const activeColor = boardInfo.currentPosition.fen.split(" ")[1];
	const currentEvalData = boardInfo.gamePositions[idx].evaluation;
	const currentRuleResults = boardInfo.gamePositions[idx].ruleResults;

	const rawScore = currentEvalData[0]?.evaluation ?? 0;
	const displayScore = activeColor === "w" ? rawScore : rawScore * -1;

	const currentMode = getMode(boardInfo.currentMode);

	return (
		<div className={styles.sidebar}>
			<StockfishSection score={displayScore} evaluations={currentEvalData} />
			<ModeNavigation currentMode={currentMode} nextMode={boardInfo.nextMode} prevMode={boardInfo.prevMode} />
			<HeuristicsSection ruleResults={currentRuleResults} />

			<NavigationControls onPrev={boardInfo.prevMove} onNext={boardInfo.nextMove} flipBoard={boardInfo.flipBoard} />
		</div>
	);
};

export default AnalysisDetails;

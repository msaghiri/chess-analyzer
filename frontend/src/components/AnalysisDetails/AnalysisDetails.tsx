import type { BoardNav, EvaluationObject } from "../../types/game.types";
import { Repeat2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import styles from "./AnalysisDetails.module.css";
import { getMode, modes } from "./../../modes/modes";
import type { RuleResult, RuleResults } from "../../logic/rules-engine/types/rules.types";
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

const SingleRule = ({
	rule,
	setExpanded,
	expanded,
	index,
}: {
	rule: RuleResult;
	setExpanded: (i: number) => void;
	expanded: boolean;
	index: number;
}) => {
	const ruleName = rule.ruleName;
	const ruleMessages = rule.messages;
	const ruleCategory = rule.severity;

	const handleExpansion = () => {
		if (expanded) {
			setExpanded(-1);
		} else {
			setExpanded(index);
		}
	};

	return (
		<div
			data-category={ruleCategory}
			className={`${styles.ruleContainer} ${expanded ? styles.ruleContainerExpanded : ""}`}
		>
			<div className={styles.ruleContainerHeader}>
				<h1 className={styles.ruleName}>{ruleName}</h1>
				<button className={styles.expandButton} onClick={handleExpansion}>
					<ChevronDown />
				</button>
			</div>
			<div className={styles.ruleContainerBody}>
				{ruleMessages.map((m) => (
					<p className={styles.actualRule}>● {m}</p>
				))}
			</div>
		</div>
	);
};

const DisplayRules = ({ ruleResults }: { ruleResults: RuleResult[] }) => {
	const [expanded, setExpanded] = useState(-1);

	const handleSetExpanded = (i: number) => {
		setExpanded(i);
	};

	return (
		<div className={styles.heuristicsContainer}>
			{ruleResults.map((rule, index) => (
				<SingleRule
					rule={rule}
					key={index}
					index={index}
					setExpanded={handleSetExpanded}
					expanded={index === expanded}
				/>
			))}
		</div>
	);
};

const HeuristicsSection = ({ ruleResults, currentMode }: { ruleResults: RuleResults; currentMode: string }) => {
	const pawnRuleResults = ruleResults.pawn;
	const imbalanceRuleResults = ruleResults.imbalance;

	return (
		<>
			{currentMode === getMode(modes.PAWNS) && <DisplayRules ruleResults={pawnRuleResults} />}
			{currentMode === getMode(modes.IMBALANCES) && <DisplayRules ruleResults={imbalanceRuleResults} />}
		</>
	);
};

/* ----------------------------- MAIN COMPONENT ----------------------------- */
const AnalysisDetails = ({ boardInfo }: { boardInfo: BoardNav }) => {
	const idx = boardInfo.currentPosition.index;
	const activeColor = boardInfo.currentPosition.fen.split(" ")[1];
	const currentEvalData = boardInfo.gamePositions[idx].evaluation;
	const currentRuleResults = boardInfo.gamePositions[idx].ruleResults;

	const rawScore = currentEvalData[0]?.evaluation ?? 0;
	let displayScore = activeColor === "w" ? rawScore : rawScore * -1;
	if (displayScore === Infinity || displayScore === -Infinity) displayScore = 0; //for now

	const currentMode = getMode(boardInfo.currentMode);

	console.log(boardInfo.currentPosition.fen);

	return (
		<div className={styles.sidebar}>
			<StockfishSection score={displayScore} evaluations={currentEvalData} />
			<ModeNavigation currentMode={currentMode} nextMode={boardInfo.nextMode} prevMode={boardInfo.prevMode} />
			<HeuristicsSection ruleResults={currentRuleResults} currentMode={currentMode} />

			<NavigationControls onPrev={boardInfo.prevMove} onNext={boardInfo.nextMove} flipBoard={boardInfo.flipBoard} />
		</div>
	);
};

export default AnalysisDetails;

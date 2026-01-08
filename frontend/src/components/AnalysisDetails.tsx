import { useMemo, useState } from "react";
import type { BoardNav} from "../types/game.types";
import { parseHeuristics, runAnalysis } from "../utils/feature-extraction/featureExtractionService";
import type { square } from "../utils/feature-extraction/featureExtraction.types";


const HeuristicContainer = ({heuristic} : {heuristic: {title: string; squares: square[]}}) => {
	const [expanded, setExpanded] = useState(false);
	const squares = heuristic.squares;

	const toggleExpanded = () => {
		setExpanded((e) => !e);
	}

	const maxHeight = expanded? "max-h-100" : "max-h-12";

	return(
	<div className={`w-11/12 ${maxHeight} bg-gray-950/25 rounded-3xl transition-all duration-300 ease-in-out text-white overflow-hidden`} onClick={toggleExpanded}>
		<p>{heuristic.title}</p>
		{squares.map((square) => (
			<p>{square}</p>
		))}
	</div>);
}

export const AnalysisDetails = ({boardInfo} : {boardInfo: BoardNav}) => {
	const fen = boardInfo.currentPosition.fen;

	const heuristics = useMemo(() => {
		if (!fen) return null;

		const rawHeuristics = runAnalysis(fen);
		return parseHeuristics(rawHeuristics);
	}, [fen]);

	//const whitePassedPawns = heuristics?.pawnHeuristics.passedPawns.white;

	const sampleHeuristic = {
		title: "Backwards Pawns",
		squares: ["e4", "c5", "d6"] as square[],
	};

	return (
		<div className="w-96 flex flex-col h-full gap-4">
			<div className="flex-1 bg-gray-800 rounded-xl p-4 border border-gray-700">
				<h2 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">Heuristics Analysis</h2>
				<div className="w-full h-full flex justify-center pt-2.5">
					<HeuristicContainer heuristic={sampleHeuristic}/>
				</div>
			</div>
		</div>
	);
};

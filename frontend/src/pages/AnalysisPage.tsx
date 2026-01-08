import BoardViewer from "../components/BoardViewer";
import { AnalysisDetails } from "../components/AnalysisDetails";
import { useBoardNavigation } from "../hooks/boardNavigationHook";
import type { BoardNav } from "../types/game.types";

const AnalysisPage = () => {
	const boardInfo : BoardNav = useBoardNavigation();
	return (
		<div className="h-screen bg-gray-900 flex flex-row p-8 gap-8">
			<div className="flex-1 flex justify-center items-center">
				<BoardViewer boardInfo={boardInfo} />
			</div>
			<AnalysisDetails boardInfo={boardInfo} />
		</div>
	);
};

export default AnalysisPage;

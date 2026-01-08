import BoardViewer from "../components/BoardViewer";

const AnalysisPage = () => {
	return (
		<div className="min-h-screen bg-gray-900 flex flex-row p-8 gap-8">
			<div className="flex-1 flex justify-center items-center">
				<BoardViewer />
			</div>

			<div className="w-96 flex flex-col gap-4">
				<div className="flex-1 bg-gray-800 rounded-xl p-4 border border-gray-700">
					<h2 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">Heuristics Analysis</h2>
					<div className="text-gray-500 italic">Detailed analysis will go here...</div>
				</div>
			</div>
		</div>
	);
};

export default AnalysisPage;

import { useContext } from "react";
import { AnalysisContext } from "../contexts/AnalysisContext";

const useAnalysisContext = () => {
	const context = useContext(AnalysisContext);
	if (!context) {
		throw new Error(
			"useAnalysisContext must be used within AnalysisContextProvider"
		);
	}

	return context;
};

export default useAnalysisContext;

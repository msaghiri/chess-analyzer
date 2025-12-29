import { BrowserRouter, Route, Routes } from "react-router-dom";
import AnalysisPage from "./pages/AnalysisPage";
import InputPGNPage from "./pages/InputPGNPage";

function App() {

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<InputPGNPage/>} />
				<Route path="/analysis" element={<AnalysisPage/>} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;

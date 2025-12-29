import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import AnalysisPage from "./pages/AnalysisPage";
import InputPGNPage from "./pages/InputPGNPage";
import { AnalysisContextProvider } from "./contexts/AnalysisContextProvider";

function AnalysisRoutes() {
	return (
		<AnalysisContextProvider>
			<Outlet />
		</AnalysisContextProvider>
	);
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="" element={<AnalysisRoutes />}>
					<Route path="/analysis" element={<AnalysisPage />} />
					<Route path="/input" element={<InputPGNPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;

import type { EvaluationObject, GamePosition } from "../types/game.types";

class StockfishService {
	private engine: Worker | null = null;
	private onMessageHandler: ((message: string) => void) | null = null;

	private isAnalyzing = false;

	private maxDepth = 10;

	init(): void {
		if (this.engine) return;

		this.engine = new Worker("/stockfish-17.1-lite-single-03e3232.js");

		this.engine.onmessage = (event: MessageEvent) => {
			if (this.onMessageHandler) {
				this.onMessageHandler(event.data);
			}
		};

		this.engine.postMessage("uci");
		this.engine.postMessage("setoption name MultiPV value 3");

		this.isAnalyzing = false;
	}

	sendCommand(command: string): void {
		this.engine?.postMessage(command);
	}

	onMessage(callback?: (message: string) => void): void {
		if (callback) {
			this.onMessageHandler = callback;
		} else {
			this.onMessageHandler = null;
		}
	}

	async analyze(fen: string): Promise<string[]> {
		if (this.isAnalyzing) {
			throw new Error("Stockfish is currently analyzing a different position.");
		}

		this.isAnalyzing = true;

		return new Promise((resolve) => {
			this.engine?.postMessage(`position fen ${fen}`);
			this.engine?.postMessage(`go depth ${this.maxDepth}`);
			const responses: string[] = [];
			const handleResult = (data: string) => {
				if (data.startsWith(`info depth ${this.maxDepth}`)) {
					responses.push(data);
				}
				if (data.startsWith("bestmove")) {
					this.onMessage();
					this.isAnalyzing = false;
					resolve(responses);
				}
			};

			this.onMessage(handleResult);
		});
	}

	async analyzeGame(gamePositions: GamePosition[], reportProgressTo?: (progress: number) => void) {
		const responses: Record<number, string[]> = {};

		for (const [index, gamePosition] of gamePositions.entries()) {
			responses[index] = await this.analyze(gamePosition.fen);

			const evalObjects = responses[index].map((response) => this.parseEvaluation(response));
			gamePositions[index].evaluation = evalObjects;

			if (reportProgressTo !== undefined) reportProgressTo(index / gamePositions.length);
		}

		return responses;
	}

	//example: info depth 10 seldepth 16 multipv 2 score cp -578 nodes 3235 nps 323500 hashfull 5 time 10 pv h2h3 d1g1 h1g1 c2c1 g1h2 c1g5 g3g5 h6g5 h2g3 f8d8 a2a3 g8f8 e5e6 f8e7
	/*	parseEvaluation(stockfishResponse: string): EvaluationObject {
		const arr = stockfishResponse.split(" ");
		const depth = parseInt(arr[2]);

		const isMate = arr[8] === "mate";
		const evaluation = isMate ? Infinity : parseFloat(arr[9]) / 100.0;

		const line = [arr[19], arr[20], arr[21]].filter((move) => move !== undefined);

		return {
			depth,
			line,
			evaluation,
		};
	}
*/
	parseEvaluation(stockfishResponse: string): EvaluationObject {
		const arr = stockfishResponse.split(" ");

		const depthIndex = arr.indexOf("depth");
		const depth = depthIndex !== -1 ? parseInt(arr[depthIndex + 1]) : 0;

		const scoreIndex = arr.indexOf("score");
		const scoreType = arr[scoreIndex + 1];
		const scoreValue = parseInt(arr[scoreIndex + 2]);

		let evaluation = 0;
		let mateIn: number | null = null;

		if (scoreType === "mate") {
			mateIn = scoreValue;
			evaluation = scoreValue > 0 ? 1000 : -1000;
		} else {
			evaluation = scoreValue / 100.0;
		}

		const pvIndex = arr.indexOf("pv");
		const line = pvIndex !== -1 ? arr.slice(pvIndex + 1, pvIndex + 4) : [];

		return {
			depth,
			line,
			evaluation,
			mateIn,
		};
	}

	setMaxDepth(maxDepth: number) {
		this.maxDepth = maxDepth;
	}

	terminate(): void {
		this.engine?.terminate();
		this.engine = null;
	}
}

export const stockfish = new StockfishService();

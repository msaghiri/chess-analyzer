import type { GamePosition } from "../types/game.types";

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

	async analyzeGame(
		gamePositions: GamePosition[],
		reportProgressTo?: (progress: number) => void
	) {
		const responses: Record<number, string[]> = {};

		for (const [index, gamePosition] of gamePositions.entries()) {
			responses[index] = await this.analyze(gamePosition.fen);
			if (reportProgressTo !== undefined)
				reportProgressTo(index / gamePositions.length);
			gamePositions[index].positionFeatures.evaluation = responses[index];
		}

		//console.log(responses);

		return responses;
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

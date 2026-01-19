# Chess Analyzer

A chess analysis tool that aims to bridge the gap between engine evaluation and human understanding.

## Description

This chess analysis tool combines the raw computational power of Stockfish 17.1 with a custom rules-based evaluation engine to provide educational insights into chess positions. The user will be prompted to input a PGN of a game, which will be then analyzed one position at a time. The analysis consists of:

- Obtaining an evaluation from Stockfish 17.1 ([stockfish.js](https://github.com/nmrugg/stockfish.js) is used, running in a web worker)
- Extracting heuristics/features such as but not limited to:
  - Passed pawns
  - Backwards pawns
  - Pressure maps:
    - A pressure map is a map data structure that holds information about which squares are attacked by which pieces
  - Material count
- The heuristics are then passed to a custom expert system which then runs an analysis
  - The expert system is modular and contains "rules" which are defined by a category (imbalances, pawns) and evaluation functions, which apply deterministic logic and return a series of results that contain information such as:
    - Severity (significant weakness, minor weakness, neutral, minor advantage, or significant advantage)
    - Messages (certain predetermined textual explanations of common patterns, such as a bishop that is valuablue due to a majority of its friendly pawns being on the opposite square color)

The user is then redirected to a page with a chessboard where they can navigate the game and view the findings of the analysis for each position.

## Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for build tooling
- **react-chessboard** for interactive board rendering
- **chess.js** for chess logic and validation
- **Lucide React** for icons
- **CSS Modules** for styling

### Chess Engine

- **Stockfish 17.1** (WebAssembly via stockfish.js) - Depth 10 analysis with MultiPV=3 for top engine lines

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1.  Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2.  Install dependencies:

```bash
cd frontend
npm install
```

3.  Start the development server:

```bash
npm run dev
```

4.  Open the URL shown in your terminal

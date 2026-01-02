const isDigit = (char : string) => {
  return /^\d$/.test(char);
}

const parseFenRank = (rank : string) => {
    const rankAsArr = new Array(8);
    let squareCounter = 0;
    for(let i = 0; i < rank.length; i++){
        const currentChar = rank.charAt(i);
        if(isDigit(currentChar)){
            let counter = 0;
            while(squareCounter < 8 && counter < parseInt(currentChar)){
                rankAsArr[squareCounter] = "";
                squareCounter++;
                counter++;
            }
        }
        else{
            rankAsArr[squareCounter] = currentChar;
            squareCounter++;
        }
    }
    
    return rankAsArr;
}

export const fenToArray = (fen: string) => {
    const fenFields = fen.split(" "); 
    if(fenFields.length != 6) return [];
    
    const finalArray = new Array(8);
    
    const piecePlacement = fenFields[0];
    const fenRanksArray = piecePlacement.split("/");
    
    for(const rank in fenRanksArray){
        const arr = parseFenRank(fenRanksArray[rank]);
        finalArray[rank] = arr;
    }

    return finalArray;
}


const isPassedPawn = (rank : number, file : number, chessboard : string[]) => {
    const pawn = chessboard[rank][file];
    const isLeftMost = rank == 0 ? true : false;
    const isRightMost = rank == RANKS-1 ? true : false;
    const isWhite = pawn == 'P' ? true : false;
    const direction = isWhite ? -1 : 1;
    const oppositePawn = pawn == 'P' ? 'p' : 'P';

    

    for(let currRank = rank+direction; currRank < RANKS && currRank >= 0; currRank += direction){
        if(chessboard[currRank][file] == oppositePawn) return false;
        if(!isLeftMost && chessboard[currRank][file-1] == oppositePawn) return false;
        if(!isRightMost && chessboard[currRank][file+1] == oppositePawn) return false;
    }

    return true;
}

const isPawn = (square : string) => ((square == 'P' || square == 'p'));


const findPassedPawns = (chessboard : string[]) => {
    const passedPawns = [];
    for(let rank = 0; rank < RANKS; rank++){
        for(let file = 0; file < FILES; file++){
            if(isPawn(chessboard[rank][file]) && isPassedPawn(rank, file, chessboard)) passedPawns.push([rank, file]);
        }
    }

    return passedPawns;
}

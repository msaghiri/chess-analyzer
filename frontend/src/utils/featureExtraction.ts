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


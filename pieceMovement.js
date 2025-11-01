const directions = [
  [-1, 0], [1, 0],  // vertical
  [0, -1], [0, 1],  // horizontal
  [-1, -1], [-1, 1], [1, -1], [1, 1]  // diagonals
];

const rookDirections = [
  [-1, 0], [1, 0],  // vertical
  [0, -1], [0, 1],  // horizontal
]

const bishopDirections = [
  [-1, -1], [-1, 1], [1, -1], [1, 1]  // diagonals
]

const knightDirections = [
  [-2, -1], [-2, 1], // up
  [-1, -2], [1, -2], // left
  [2, -1], [2, 1], // down
  [-1, 2], [1, 2] // right
]
let queenPromotion = document.getElementById("queen-promotion");
let knightPromotion = document.getElementById("knight-promotion");
let rookPromotion = document.getElementById("rook-promotion");
let bishopPromotion = document.getElementById("bishop-promotion");
let importantPieceMap = {};
let enPassant = {"y":null, "x":null};
let startY = 0;
let endY = 0;

function isSquareAttacked(y, x, mainPieceColor) {
  const color = mainPieceColor;
  if ((color === "w" || color === "empty")) {
    if ((y - 1 >= 0) && (x - 1 >= 0) && boardPosition[y - 1][x - 1] === "p") {
      return true;
    }
    if ((y - 1 >= 0) && (x + 1 <= 7) && boardPosition[y - 1][x + 1] === "p") {
      return true;
    }
  }
  else if ((color === "b" || color === "empty")) {
    if ((y + 1 <= 7) && (x - 1 >= 0) && boardPosition[y + 1][x - 1] === "P") {
      return true;
    }
    if ((y + 1 <= 7) && (x + 1 <= 7) && boardPosition[y + 1][x + 1] === "P") {
      return true;
    }
  }
  for (const [dy, dx] of directions) {
    let newY = y + dy;
    let newX = x + dx;

    if (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7) {
      if ((color === "w" || color === "empty") && boardPosition[newY][newX] === "k") {
        return true;
      }
      else if ((color === "b" || color === "empty") && boardPosition[newY][newX] === "K") {
        return true;
      }
    }
  }
  for (const [dy, dx] of rookDirections) {
    let newY = y + dy;
    let newX = x + dx;

    while (true) {
      if (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7) {
        if (boardPosition[newY][newX] === " ") {
          newY += dy;
          newX += dx;
        }
        else if ((color === "w" || color === "empty") && (boardPosition[newY][newX] === "r" || boardPosition[newY][newX] === "q")) {
          return true;
        }
        else if ((color === "b" || color === "empty") && (boardPosition[newY][newX] === "R" || boardPosition[newY][newX] === "Q")) {
          return true;
        }
        else {
          break
        }
      } else {
        break
      }
    }
  }
  for (const [dy, dx] of bishopDirections) {
    let newY = y + dy;
    let newX = x + dx;

    while (true) {
      if (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7) {
        if (boardPosition[newY][newX] === " ") {
          newY += dy;
          newX += dx;
        }
        else if ((color === "w" || color === "empty") && (boardPosition[newY][newX] === "b" || boardPosition[newY][newX] === "q")) {
          return true;
        }
        else if ((color === "b" || color === "empty") && (boardPosition[newY][newX] === "B" || boardPosition[newY][newX] === "Q")) {
          return true;
        }
        else {
          break
        }
      } else {
        break
      }
    }
  }
  for (const [dy, dx] of knightDirections) {
    const newY = y + dy;
    const newX = x + dx;

    if (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7) {
      if ((color === "w" || color === "empty") && boardPosition[newY][newX] === "n") {
        return true;
      }
      else if ((color === "b" || color === "empty") && boardPosition[newY][newX] === "N") {
        return true;
      }
    }
  }
  return false;
}

function promote(piece, x, y) {
  boardPosition[y][x] = piece;
  promotionState = !promotionState;
  promotionContainer.style.display = "none";
  updatePosition(boardToFEN(boardPosition));
}

function movePiece(y, x) {
  if (gameOver) {
    return;
  }
  const pieceColor = checkPieceColor(storedPieceY, storedPieceX);
  if (selectedSquare.querySelector(".circle") || selectedSquare.querySelector(".bigCircle")) {
    if (enPassant["y"] !== null && enPassant["y"] + (pieceColor === "w" ? -1 : 1) === y && enPassant["x"] === x) {
      boardPosition[enPassant["y"]][enPassant["x"]] = " ";
    }
    startY = storedPieceY;
    endY = y;
    if (boardPosition[storedPieceY][storedPieceX].toLowerCase() === "p" && Math.abs(startY - endY) === 2) {
      enPassant["y"] = y;
      enPassant["x"] = x;
    } else {
      enPassant["y"] = null;
      enPassant["x"] = null;
    }

    for (position in importantPieceMap) {
      if (y === Math.floor(parseInt(position)/8) && x === parseInt(position) % 8) {
        importantPieceMap[position] = true;
      }
    }
    boardPosition[y][x] = boardPosition[storedPieceY][storedPieceX];
    boardPosition[storedPieceY][storedPieceX] = " ";
    pieceSelected = !pieceSelected;
    turnIndicator.textContent = whiteToMove ? "⚫(Black to move)⚫" : "⚪(White to move)⚪";
    whiteToMove = !whiteToMove;
    updatePosition(boardToFEN(boardPosition));
    checkWin()
    if (boardPosition[y][x] === (pieceColor === "w" ? "P" : "p") && (y <= 0 || y >= 7)) {
      queenPromotion.src = `Chess Pieces/${whiteToMove ? "black" : "white"}-queen.png`;
      queenPromotion.onclick = () => promote(whiteToMove ? 'q' : 'Q', x, y);
      knightPromotion.src = `Chess Pieces/${whiteToMove ? "black" : "white"}-knight.png`;
      knightPromotion.onclick = () => promote(whiteToMove ? 'n' : 'N', x, y);
      rookPromotion.src = `Chess Pieces/${whiteToMove ? "black" : "white"}-rook.png`;
      rookPromotion.onclick = () => promote(whiteToMove ? 'r' : 'R', x, y);
      bishopPromotion.src = `Chess Pieces/${whiteToMove ? "black" : "white"}-bishop.png`;
      bishopPromotion.onclick = () => promote(whiteToMove ? 'b' : 'B', x, y);
      promotionState = true;
      promotionContainer.style.display = "block";
    }
  }
  else if (selectedSquare.querySelector(".castleCircle")) {
    enPassant["y"] = null;
    enPassant["x"] = null;
    for (let row = 0; row < boardSize; row++) {
      let kingPositionX = boardPosition[row].indexOf(pieceColor === "w" ? "K" : "k");
      if (kingPositionX >= 0) {
        boardPosition[y][kingPositionX] = " "
        boardPosition[y][x] = " "
        if (kingPositionX - x < 0) {
          boardPosition[y][kingPositionX + 2] = pieceColor === "w" ? "K" : "k";
          boardPosition[y][kingPositionX + 1] = pieceColor === "w" ? "R" : "r";
        }
        else {
          boardPosition[y][kingPositionX - 2] = pieceColor === "w" ? "K" : "k";
          boardPosition[y][kingPositionX - 1] = pieceColor === "w" ? "R" : "r";
        }
        updatePosition(boardToFEN(boardPosition))
        break;
      }
    }
    pieceSelected = !pieceSelected;
    turnIndicator.textContent = whiteToMove ? "⚫(Black to move)⚫" : "⚪(White to move)⚪";
    whiteToMove = !whiteToMove;
    updatePosition(boardToFEN(boardPosition));
  } else {
    pieceSelected = !pieceSelected;
    updatePosition(boardToFEN(boardPosition))
  }
}

function kingMovement(y, x, color) {
  for (const [dy, dx] of directions) {
    const newY = y + dy;
    const newX = x + dx;
    if (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7 && !isSquareAttacked(newY, newX, color)) {
      if (boardPosition[newY][newX] === " ") {
        createCircle("circle", (newY * 8 + newX))
      } 
      else if (color !== checkPieceColor(newY, newX)) {
        createCircle("bigCircle", (newY * 8 + newX))
      }
    }
  }

  const right = 1;
  const left = -1;
  let tempX = x;

  function colorizePiece(piece) {
    return color === "w" ? piece.toUpperCase() : piece.toLowerCase();
  }

  function findRookHorizontally(directionX) {
    while (directionX + tempX >= 0 && directionX + tempX <= 7) {
      if (boardPosition[y][tempX + directionX] === " " && !isSquareAttacked(y, tempX + directionX, color)) {
        tempX += directionX;
      }
      else if (boardPosition[y][tempX + directionX] === colorizePiece("r") && !isSquareAttacked(y, tempX + directionX, color)) {
        if (!importantPieceMap[y * 8 + tempX + directionX] && !importantPieceMap[y * 8 + x] && y * 8 + tempX + directionX in importantPieceMap && y * 8 + x in importantPieceMap) {
          createCircle("castleCircle", y * 8 + tempX + directionX)
        }
        break
      }
      else {
        break
      }
    }
    tempX = x;
  }

  findRookHorizontally(right)
  findRookHorizontally(left)
}

function queenMovement(y, x, color) {
  slideMovement(y, x, color, directions)
}

function rookMovement(y, x, color) {
  slideMovement(y, x, color, rookDirections)
}

function bishopMovement(y, x, color) {
  slideMovement(y, x, color, bishopDirections)
}

function slideMovement(y, x, color, piece) {
  for (const [dy, dx] of piece) {
    let newY = y + dy;
    let newX = x + dx;

    while (true) {
      if (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7) {
        if (boardPosition[newY][newX] === " ") {
          createCircle("circle", newY * 8 + newX)
          newY += dy;
          newX += dx;
        } else {
          if (color !== checkPieceColor(newY, newX)) {
            createCircle("bigCircle", newY * 8 + newX)
          }
          break
        }
      } else {
        break
      }
    }
  }
}

function knightMovement(y, x, color) {
  for (const [dy, dx] of knightDirections) {
    const newY = y + dy;
    const newX = x + dx;
    if (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7) {
      if (boardPosition[newY][newX] === " ") {
        createCircle("circle", (newY * 8 + newX))
      } 
      else if (checkPieceColor(newY, newX) !== color) {
        createCircle("bigCircle", (newY * 8 + newX))
      }
    }
  }
}

function pawnMovement(y, x, color) {
  if (color === "w") {
    if (y - 1 >= 0 && boardPosition[y - 1][x] === " ") {
      createCircle("circle", (y - 1) * 8 + x)
      if (y - 2 >= 0 && boardPosition[y - 2][x] === " ") {
        for (let position in importantPieceMap) {
          if (y === Math.floor(parseInt(position)/8) && x === parseInt(position) % 8) {
            if (!importantPieceMap[position]) {
              createCircle("circle", (y - 2) * 8 + x)
            }
          }
        }
      }
    }
    for ([dy, dx] of [[-1, -1], [-1, 1]]) {
      const newY = y + dy;
      const newX = x + dx;
      if (newY >= 0 && newX >= 0 && newX <= 7) {
        if (boardPosition[y][newX].toLowerCase() === "p" && y === enPassant["y"] && newX === enPassant["x"] && checkPieceColor(y, newX) === "b") {
          createCircle("circle", (y - 1) * 8 + newX)
        }
        else if (boardPosition[newY][newX] !== " " && checkPieceColor(newY, newX) === "b") {
          createCircle("bigCircle", newY * 8 + newX)
        }
      }
    }
  } else {
    if (y + 1 <= 7 && boardPosition[y + 1][x] === " ") {
      createCircle("circle", (y + 1) * 8 + x)
      if (y + 2 <= 7 && boardPosition[y + 2][x] === " ") {
        for (let position in importantPieceMap) {
          if (y === Math.floor(parseInt(position)/8) && x === parseInt(position) % 8) {
            if (!importantPieceMap[position]) {
              createCircle("circle", (y + 2) * 8 + x)
            }
          }
        }
      }
    }
    for ([dy, dx] of [[1, -1], [1, 1]]) {
      const newY = y + dy;
      const newX = x + dx;
      if (newY <= 7 && newX >= 0 && newX <= 7) {
        if (boardPosition[y][newX].toLowerCase() === "p" && y === enPassant["y"] && newX === enPassant["x"] && checkPieceColor(y, newX) === "w") {
          createCircle("circle", (y + 1) * 8 + newX)
        }
        if (boardPosition[newY][newX] !== " " && checkPieceColor(newY, newX) === "w") {
          createCircle("bigCircle", newY * 8 + newX)
        }
      }
    }
  }
}
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
  let attackInfo = { "result": false, "attackers": [] };

  if (color === "w" || color === undefined) {
    if ((y - 1 >= 0) && (x - 1 >= 0) && boardPosition[y - 1][x - 1] === "p") {
      attackInfo.result = true;
      attackInfo.attackers.push({ "y": y - 1, "x": x - 1 });
    }
    if ((y - 1 >= 0) && (x + 1 <= 7) && boardPosition[y - 1][x + 1] === "p") {
      attackInfo.result = true;
      attackInfo.attackers.push({ "y": y - 1, "x": x + 1 });
    }
  }
  if (color === "b" || color === undefined) {
    if ((y + 1 <= 7) && (x - 1 >= 0) && boardPosition[y + 1][x - 1] === "P") {
      attackInfo.result = true;
      attackInfo.attackers.push({ "y": y + 1, "x": x - 1 });
    }
    if ((y + 1 <= 7) && (x + 1 <= 7) && boardPosition[y + 1][x + 1] === "P") {
      attackInfo.result = true;
      attackInfo.attackers.push({ "y": y + 1, "x": x + 1 });
    }
  }

  for (const [dy, dx] of directions) {
    const newY = y + dy;
    const newX = x + dx;
    if (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7) {
      if ((color === "w" || color === undefined) && boardPosition[newY][newX] === "k") {
        attackInfo.result = true;
        attackInfo.attackers.push({ "y": newY, "x": newX });
      }
      if ((color === "b" || color === undefined) && boardPosition[newY][newX] === "K") {
        attackInfo.result = true;
        attackInfo.attackers.push({ "y": newY, "x": newX });
      }
    }
  }

  function checkSlidingPiece(pieceDirections, mainPieceType) {
    for (const [dy, dx] of pieceDirections) {
      let newY = y + dy;
      let newX = x + dx;
      while (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7) {
        const piece = boardPosition[newY][newX];
        const enemyRB = color === "w" ? mainPieceType.toLowerCase() : mainPieceType.toUpperCase();
        const enemyQ = color === "w" ? "q" : "Q"; 
        if (piece !== " ") {
          if (color !== undefined) {
            if (piece === enemyRB || piece === enemyQ) {
              attackInfo.result = true;
              attackInfo.attackers.push({ "y": newY, "x": newX });
            }
          } else {
            if (piece.toLowerCase() === mainPieceType.toLowerCase() || piece.toLowerCase() === "q") {
              attackInfo.result = true;
              attackInfo.attackers.push({ "y": newY, "x": newX });
            }
          }
          break;
        }
        newY += dy;
        newX += dx;
      }
    }
  }

  for (const [dy, dx] of knightDirections) {
    const newY = y + dy;
    const newX = x + dx;
    if (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7) {
      if ((color === "w" || color === undefined) && boardPosition[newY][newX] === "n") {
        attackInfo.result = true;
        attackInfo.attackers.push({ "y": newY, "x": newX });
      }
      if ((color === "b" || color === undefined) && boardPosition[newY][newX] === "N") {
        attackInfo.result = true;
        attackInfo.attackers.push({ "y": newY, "x": newX });
      }
    }
  }
  checkSlidingPiece(rookDirections, "r")
  checkSlidingPiece(bishopDirections, "b")

  return attackInfo;
}

function promote(piece, x, y) {
  boardPosition[y][x] = piece;
  promotionState = !promotionState;
  promotionContainer.style.display = "none";
  updatePosition();
}

function movePiece(y, x) {
  if (gameOver) {
    return;
  }
  const pieceColor = checkPieceColor(storedPieceY, storedPieceX);
  if (selectedSquare.querySelector(".circle") || selectedSquare.querySelector(".bigCircle")) {
    if (enPassant["y"] !== null && enPassant["y"] === y && enPassant["x"] === x) {
      boardPosition[enPassant["y"] + (checkPieceColor(storedPieceY, storedPieceX) === "w" ? 1 : -1)][enPassant["x"]] = " ";
    }
    startY = storedPieceY;
    endY = y;
    if (boardPosition[storedPieceY][storedPieceX].toLowerCase() === "p" && Math.abs(startY - endY) === 2) {
      enPassant["y"] = (startY + endY) / 2;
      enPassant["x"] = x;
    } else {
      enPassant["y"] = null;
      enPassant["x"] = null;
    }

    for (const position in importantPieceMap) {
      if (y === Math.floor(parseInt(position)/8) && x === parseInt(position) % 8) {
        importantPieceMap[position] = true;
      }
    }
    boardPosition[y][x] = boardPosition[storedPieceY][storedPieceX];
    boardPosition[storedPieceY][storedPieceX] = " ";
    pieceSelected = !pieceSelected;
    turnIndicator.textContent = whiteToMove ? "⚫(Black to move)⚫" : "⚪(White to move)⚪";
    whiteToMove = !whiteToMove;
    updatePosition();
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
    let kingPositionX = boardPosition[y].indexOf(pieceColor === "w" ? "K" : "k");
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
      updatePosition()
    }
    pieceSelected = !pieceSelected;
    turnIndicator.textContent = whiteToMove ? "⚫(Black to move)⚫" : "⚪(White to move)⚪";
    whiteToMove = !whiteToMove;
    updatePosition();
  } else {
    pieceSelected = !pieceSelected;
    updatePosition()
  }
}

function kingMovement(y, x, color) {
  let hasLegalMoves = false;
  boardPosition[y][x] = " "; // Used to check squares behind the king as well
  for (const [dy, dx] of directions) {
    const newY = y + dy;
    const newX = x + dx;
    if (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7 && !isSquareAttacked(newY, newX, color).result) {
      if (boardPosition[newY][newX] === " ") {
        hasLegalMoves = true;
        createCircle("circle", (newY * 8 + newX))
      } 
      else if (color !== checkPieceColor(newY, newX) && !isSquareAttacked(newY, newX, color).result) {
        hasLegalMoves = true;
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
      if (boardPosition[y][tempX + directionX] === " " && !isSquareAttacked(y, tempX + directionX, color).result) {
        tempX += directionX;
      }
      else if (boardPosition[y][tempX + directionX] === colorizePiece("r") && !isSquareAttacked(y, tempX + directionX, color).result && !isSquareAttacked(y, x, color).result) {
        if (!importantPieceMap[y * 8 + tempX + directionX] && !importantPieceMap[y * 8 + x] && y * 8 + tempX + directionX in importantPieceMap && y * 8 + x in importantPieceMap) {
          hasLegalMoves = true;
          createCircle("castleCircle", y * 8 + tempX + directionX)
        }
        break
      }
      else {
        break
      }
    }
    tempX = x;
    boardPosition[y][x] = (color === "w" ? "K" : "k");
  }

  findRookHorizontally(right)
  findRookHorizontally(left)
  return hasLegalMoves;
}

function queenMovement(y, x, color) {
  slideMovement(y, x, color, directions, (color === "w" ? "Q" : "q"))
}

function rookMovement(y, x, color) {
  slideMovement(y, x, color, rookDirections, (color === "w" ? "R" : "r"))
}

function bishopMovement(y, x, color) {
  slideMovement(y, x, color, bishopDirections, (color === "w" ? "B" : "b"))
}

function slideMovement(y, x, color, pieceMovement, pieceType) {
  const original = boardPosition[y][x];
  let hasLegalMoves = false;
  boardPosition[y][x] = " ";
  for (const [dy, dx] of pieceMovement) {
    let newY = y + dy;
    let newX = x + dx;
    while (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7) {
      let createdTestPiece = false;
      if (boardPosition[newY][newX] === " ") {
        createdTestPiece = true;
        boardPosition[newY][newX] = pieceType;
      }
      const checkState = kingInCheck();
      if (!checkState.result || ("both" !== checkState.color && color !== checkState.color)) {
        if (createdTestPiece) {
          hasLegalMoves = true;
          createCircle("circle", newY * 8 + newX);
        } else {
          if (checkPieceColor(newY, newX) !== color) {
            hasLegalMoves = true;
            createCircle("bigCircle", newY * 8 + newX);
          }
        }
      }
      if (createdTestPiece) {
        boardPosition[newY][newX] = " ";
        newY += dy;
        newX += dx;
        continue;
      } else {
        break;
      }
    }
  }

  const checkState = kingInCheck();
  if (checkState.result && checkState.color !== "both" && checkState.attackers.length === 1) {
    boardPosition[y][x] = pieceType;
    const counterAttack = isSquareAttacked(checkState.attackers[0].y, checkState.attackers[0].x, color === "w" ? "b" : "w").attackers;
    for (const position of counterAttack) {
      if (position.y === y && position.x === x) {
        hasLegalMoves = true;
        createCircle("bigCircle", checkState.attackers[0].y * 8 + checkState.attackers[0].x)
        break;
      }
    }
  }
  boardPosition[y][x] = original;
  return hasLegalMoves;
}


function knightMovement(y, x, color) {
  let hasLegalMoves = false;
  boardPosition[y][x] = " ";

  for (const [dy, dx] of knightDirections) {
    const newY = y + dy;
    const newX = x + dx;

    if (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7) {
      let createdTestPiece = false;
      if (boardPosition[newY][newX] === " ") {
        createdTestPiece = true;
        boardPosition[newY][newX] = color === "w" ? "N" : "n";
      }
      const checkState = kingInCheck();
      if (!checkState.result || ("both" !== checkState.color && color !== checkState.color)) {
        if (createdTestPiece) {
          hasLegalMoves = true;
          createCircle("circle", newY * 8 + newX);
        } else {
          if (checkPieceColor(newY, newX) !== color) {
            hasLegalMoves = true;
            createCircle("bigCircle", newY * 8 + newX);
          }
        }
      }
      if (createdTestPiece) {
        boardPosition[newY][newX] = " ";
      }
    }
  }
  const checkState = kingInCheck();
  if (checkState.result && checkState.color !== "both" && checkState.attackers.length === 1) {
    boardPosition[y][x] = color === "w" ? "N" : "n";
    const counterAttack = isSquareAttacked(checkState.attackers[0].y, checkState.attackers[0].x, color === "w" ? "b" : "w").attackers;
    
    for (const position of counterAttack) {
      if (position.y === y && position.x === x) {
        hasLegalMoves = true;
        createCircle("bigCircle", checkState.attackers[0].y * 8 + checkState.attackers[0].x)
        break
      }
    }
  }
  boardPosition[y][x] = color === "w" ? "N" : "n";
  return hasLegalMoves;
}

function pawnMovement(y, x, color) {
  let hasLegalMoves = false;
  boardPosition[y][x] = " ";
  let pieceMovementColor = color === "w" ? -1 : 1;

  if (y + pieceMovementColor >= 0 && y + pieceMovementColor <= 7 && boardPosition[y + pieceMovementColor][x] === " ") {
    boardPosition[y + pieceMovementColor][x] = color === "w" ? "P" : "p";
    const checkState = kingInCheck();
    if (!checkState.result || ("both" !== checkState.color && color !== checkState.color)) {
      hasLegalMoves = true;
      createCircle("circle", (y + pieceMovementColor) * 8 + x)
    }
    boardPosition[y + pieceMovementColor][x] = " ";
    if (y + (2 * pieceMovementColor) >= 0 && y + (2 * pieceMovementColor) <= 7 && boardPosition[y + (2 * pieceMovementColor)][x] === " ") {
      boardPosition[y + (2 * pieceMovementColor)][x] = color === "w" ? "P" : "p";
      const checkState = kingInCheck();
      if (!checkState.result || ("both" !== checkState.color && color !== checkState.color)) {
        for (const position in importantPieceMap) {
          if (y === Math.floor(parseInt(position)/8) && x === parseInt(position) % 8) {
            if (!importantPieceMap[position]) {
              hasLegalMoves = true;
              createCircle("circle", ((2 * pieceMovementColor + y) * 8 + x))
            }
          }
        }
      }
      boardPosition[y + (2 * pieceMovementColor)][x] = " ";
    }
    boardPosition[y + pieceMovementColor][x] = " ";
  }
  for (const [dy, dx] of [[pieceMovementColor, -1], [pieceMovementColor, 1]]) {
    const newY = y + dy;
    const newX = x + dx;
    if (newY >= 0 && newY <= 7 && newX >= 0 && newX <= 7) {
      let createdTestPiece = false;
      if (boardPosition[newY][newX] === " ") {
        createdTestPiece = true;
        boardPosition[newY][newX] = color === "w" ? "P" : "p";
      }
      const checkState = kingInCheck();
      if (!checkState.result || checkState.color !== color) {
        if (newY === enPassant["y"] && newX === enPassant["x"] && checkPieceColor(y, newX) !== undefined && checkPieceColor(y, newX) !== color) {
          hasLegalMoves = true;
          createCircle("circle", (y + pieceMovementColor) * 8 + newX)
        }
        else if (checkPieceColor(newY, newX) !== undefined && checkPieceColor(newY, newX) !== color) {
          hasLegalMoves = true;
          createCircle("bigCircle", newY * 8 + newX)
        }
      }
      if (createdTestPiece) {
        boardPosition[newY][newX] = " ";
      }
    }
  }
  const checkState = kingInCheck();
  if (checkState.result && checkState.color !== "both" && checkState.attackers.length === 1) {
    boardPosition[y][x] = color === "w" ? "P" : "p";
    const counterAttack = isSquareAttacked(checkState.attackers[0].y, checkState.attackers[0].x, color === "w" ? "b" : "w").attackers;
    
    for (const position of counterAttack) {
      if (position.y === y && position.x === x) {
        hasLegalMoves = true;
        createCircle("bigCircle", checkState.attackers[0].y * 8 + checkState.attackers[0].x)
        break
      }
    }
  }
  boardPosition[y][x] = color === "w" ? "P" : "p";
  return hasLegalMoves;
}

function kingInCheck() {
  let whiteInCheck = false;
  let blackInCheck = false;
  let whiteX = -1;
  let whiteY = -1;
  let blackX = -1;
  let blackY = -1;

  for (let y = 0; y < boardPosition.length; y++) {
    const whiteIndex = boardPosition[y].indexOf("K");
    const blackIndex = boardPosition[y].indexOf("k");
    if (whiteIndex >= 0) {
      whiteX = boardPosition[y].indexOf("K");
      whiteY = y;
    }
    if (blackIndex >= 0) {
      blackX = boardPosition[y].indexOf("k");
      blackY = y;
    }
  }
  const whiteKingUnderAttack = isSquareAttacked(whiteY, whiteX, "w");
  const blackKingUnderAttack = isSquareAttacked(blackY, blackX, "b");

  if (whiteX >= 0 && whiteY >= 0 && whiteKingUnderAttack.result) {
    whiteInCheck = true;
  }
  if (blackX >= 0 && blackY >= 0 && blackKingUnderAttack.result) {
    blackInCheck = true;
  }
  return {
    "result": whiteInCheck || blackInCheck ? true : false,
    "color": whiteInCheck && blackInCheck ? "both" : whiteInCheck ? "w" : blackInCheck ? "b" : undefined,
    "attackers": whiteInCheck && blackInCheck ? undefined : whiteInCheck ? whiteKingUnderAttack.attackers : blackInCheck ? blackKingUnderAttack.attackers : undefined
  };
}

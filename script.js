const boardSize = 8;
const board = document.getElementById("board-container");
const turnIndicator = document.getElementById("turn-indicator");
let promotionContainer = document.getElementById("promotion-container")
let promotionState = false;
let isInitialized = false;
let gameOver = false;
let selectedSquare = null;
let storedPieceY = 0;
let storedPieceX = 0;
let whiteToMove = true;
let pieceSelected = false;
let lightSquareState = true;
let squareName = 0;
let boardPosition =
[
  ["r","n","b","q","k","b","n","r"],
  ["p","p","p","p","p","p","p","p"],
  [" "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "],
  ["P","P","P","P","P","P","P","P"],
  ["R","N","B","Q","K","B","N","R"]
]

const whitePieceMovementMap = {
  // White Pieces
  K: (y, x) => kingMovement(y, x, "w"),
  Q: (y, x) => queenMovement(y, x, "w"),
  R: (y, x) => rookMovement(y, x, "w"),
  B: (y, x) => bishopMovement(y, x, "w"),
  N: (y, x) => knightMovement(y, x, "w"),
  P: (y, x) => pawnMovement(y, x, "w"),
}
const blackPieceMovementMap = {
  // Black Pieces
  k: (y, x) => kingMovement(y, x, "b"),
  q: (y, x) => queenMovement(y, x, "b"),
  r: (y, x) => rookMovement(y, x, "b"),
  b: (y, x) => bishopMovement(y, x, "b"),
  n: (y, x) => knightMovement(y, x, "b"),
  p: (y, x) => pawnMovement(y, x, "b"),
}

// === Creates The Board ===
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    const newSquare = document.createElement("div");
    newSquare.id = `square${squareName}`;
    squareName += 1
    newSquare.classList.add("square");
    if (!lightSquareState) {
      newSquare.classList.add("dark-square")
    }
    lightSquareState = !lightSquareState
    newSquare.addEventListener('click', (event) => selectPiece(newSquare))
    board.appendChild(newSquare);
  }
  lightSquareState = !lightSquareState
}

function checkWin() {
  let whiteKingAlive = boardPosition.some((array) => array.includes("K"));
  let blackKingAlive = boardPosition.some((array) => array.includes("k"));
  if (!whiteKingAlive) {
    gameOver = !gameOver;
    turnIndicator.textContent = "⚫(BLACK WINS)⚫"
  }
  else if (!blackKingAlive) {
    gameOver = !gameOver;
    turnIndicator.textContent = "⚪(WHITE WINS)⚪"
  }
}

// === Highlights Possible Piece Movements and Captures ===
function selectPiece(squareElement) {
  if (gameOver) {
    return;
  }
  if (promotionState) {
    return
  }
  selectedSquare = squareElement;
  const squareID = squareElement.id.slice(6);
  const y = Math.floor(squareID/8); // boardPositionY
  const x = (squareID % 8); // boardPositionX

  function storeSelectedPiece() {
    storedPieceY = y;
    storedPieceX = x;
  }


  if (!pieceSelected) {
    const currentPieceMovementMap = whiteToMove ? whitePieceMovementMap : blackPieceMovementMap;
    for (const piece in currentPieceMovementMap) {
      if (boardPosition[y][x] === piece) {
        currentPieceMovementMap[piece](y, x, whiteToMove ? "w" : "b");
      }
    }
    storeSelectedPiece()
    pieceSelected = !pieceSelected;
  } else {
    movePiece(y, x)
  }
}
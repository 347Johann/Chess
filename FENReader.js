const customFen = document.getElementById("custom-fen-input");

const pieceMap = {
  // White Pieces
  K: "Chess Pieces/white-king.png",
  Q: "Chess Pieces/white-queen.png",
  R: "Chess Pieces/white-rook.png",
  B: "Chess Pieces/white-bishop.png",
  N: "Chess Pieces/white-knight.png",
  P: "Chess Pieces/white-pawn.png",

  // Black Pieces
  k: "Chess Pieces/black-king.png",
  q: "Chess Pieces/black-queen.png",
  r: "Chess Pieces/black-rook.png",
  b: "Chess Pieces/black-bishop.png",
  n: "Chess Pieces/black-knight.png",
  p: "Chess Pieces/black-pawn.png"
};

function updatePosition() {
  document.querySelectorAll(".square").forEach(element => {
    element.innerHTML = "";
  });

  for (let rank = 0; rank < boardPosition.length; rank++) {
    for (let file = 0; file < boardPosition.length; file++) {
      if (boardPosition[rank][file] !== " ") {
        document.getElementById(`square${rank * 8 + file}`)
          .append(pc(pieceMap[boardPosition[rank][file]]));
      }

      if (
        (boardPosition[rank][file].toLowerCase() === "p" ||
         boardPosition[rank][file].toLowerCase() === "k" ||
         boardPosition[rank][file].toLowerCase() === "r") &&
        !isInitialized
      ) {
        importantPieceMap[rank * 8 + file] = false;
      }
    }
  }

  isInitialized = true;
}

// === Sets Position from FEN ===
function updatePositionFromFEN(customFen) {
  document.querySelectorAll(".square").forEach(element => {
    element.innerHTML = "";
  });

  const fen = customFen.split("/");

  for (let rank = 0; rank < fen.length; rank++) {
    let currFile = 0;

    for (let square = 0; square < fen[rank].length; square++) {
      let currFENPiece = fen[rank][square];
      let currPos = currFile + rank * boardSize;
      let currSquare = document.getElementById(`square${currPos}`);

      for (let piece in pieceMap) {
        if (currFENPiece === piece) {
          currSquare.append(pc(pieceMap[piece]));
          currFile++;
          break;
        } else if (!isNaN(currFENPiece)) {
          currFile += parseInt(currFENPiece);
          break;
        }
      }
    }
  }
}

// === Converts boardPosition to FEN ===
function boardToFEN(pos) {
  let fen = "";

  for (let rank = 0; rank < pos.length; rank++) {
    let emptyStreak = 0;

    for (let file = 0; file < pos.length; file++) {
      if (pos[rank][file] === " ") {
        emptyStreak++;

        if (file + 1 < pos.length) {
          if (pos[rank][file + 1] !== " ") {
            fen += emptyStreak;
            emptyStreak = 0;
          }
        } else {
          fen += emptyStreak;
        }
      } else {
        emptyStreak = 0;
        fen += pos[rank][file];
      }
    }

    if (rank < 7) fen += "/";
  }

  return fen;
}

function customFenInput(customFen) {
  const fen = customFen.split("/");
  isInitialized = false;

  // Reset boardPosition to empty
  for (let rank = 0; rank < boardPosition.length; rank++) {
    for (let file = 0; file < boardPosition[rank].length; file++) {
      boardPosition[rank][file] = " ";
    }
  }

  for (let rank = 0; rank < fen.length; rank++) {
    let currFile = 0;

    for (let square = 0; square < fen[rank].length; square++) {
      let currFENPiece = fen[rank][square];

      if (isNaN(currFENPiece)) {
        boardPosition[rank][currFile] = currFENPiece;
        currFile++;
      } else {
        currFile += parseInt(currFENPiece);
      }
    }
  }

  updatePositionFromFEN(boardToFEN(boardPosition));
}

updatePosition();

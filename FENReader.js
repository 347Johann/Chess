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

// === Sets Position from FEN
function updatePosition(customFen) {
  document.querySelectorAll(".square").forEach(element => {
    element.innerHTML = "";
  });

  let fen = customFen.split("/");

  for (let rank = 0; rank < fen.length; rank++) {
    let currFile = 0; // 0-7 instead of 1-8 for indexing

    for (let square = 0; square < fen[rank].length; square++) {
      let currFENPiece = fen[rank][square];
      let currPos = currFile + rank * boardSize;
      let currSquare = document.getElementById(`square${currPos}`);

      for (let piece in pieceMap) {
        if (currFENPiece === piece) {
          if ((piece.toLowerCase() === "p" || piece.toLowerCase() === "k" || piece.toLowerCase() === "r") && !isInitialized) {
            importantPieceMap[currPos] = false;
          }
          currSquare.append(pc(pieceMap[piece]))
          currFile++
          break
        }
        else if (!isNaN(currFENPiece)) {
          currFile += parseInt(currFENPiece)
          break
        }
      }
    }
  }
  isInitialized = true;
}

// === Converts boardPosition to FEN ===
function boardToFEN(pos) {
  let fen = ""
  for (let rank = 0; rank < pos.length; rank++) {
    let emptyStreak = 0
    for (let file = 0; file < pos.length; file++) {
      if (pos[rank][file] === " ") {
        emptyStreak++;
        if (file + 1 < pos.length) {
          if (pos[rank][file + 1] != " ") {
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
    if (rank < 7) {
      fen += "/"
    }
  }
  return fen
}

updatePosition(boardToFEN(boardPosition));

function pc(pieceName) {
  let piece = document.createElement("img");
  piece.classList.add("piece");
  piece.src = pieceName;
  piece.draggable = false;
  return piece;
}

// Either circle, bigCircle, or castleCircle type
function createCircle(circleType, target) {
  let circle = document.createElement("div");
  circle.classList.add(circleType);
  document.getElementById(`square${target}`).appendChild(circle);
}

function checkPieceColor(y, x) {
  if (boardPosition[y][x] === " ") {
    return undefined;
  }
  else if (boardPosition[y][x] === boardPosition[y][x].toLowerCase()) {
    return "b";
  }
  else {
    return "w";
  }
}

const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

const boardElement = document.getElementById("board");

async function showBoard(turnCount) {
  const response = await fetch(`/api/games/latest/turns/${turnCount}`, {
    method: "GET",
  });
  const responseBody = await response.json();
  const board = responseBody.board;
  const nextDisc = responseBody.nextDisc;

  while (boardElement.firstChild) {
    boardElement.removeChild(boardElement.firstChild);
  }
  board.forEach((line, y) => {
    line.forEach((square, x) => {
      const squareElement = document.createElement("div");
      squareElement.className = "square";

      if (square !== EMPTY) {
        const stoneElement = document.createElement("div");
        const color = square === DARK ? "dark" : "light";
        stoneElement.className = `stone ${color}`;

        squareElement.appendChild(stoneElement);
      } else {
        squareElement.addEventListener("click", async () => {
          const nextTurn = turnCount + 1;
          await registerTurn(nextTurn, nextDisc, x, y);
          await showBoard(nextTurn);
        });
      }

      boardElement.appendChild(squareElement);
    });
  });
}

async function registerGame() {
  await fetch("/api/games", {
    method: "POST",
  });
}

async function registerTurn(nextTurn, disc, x, y) {
  const reqestBody = {
    turnCount: nextTurn,
    move: {
      disc: disc,
      x: x,
      y: y,
    },
  };
  await fetch("/api/games/latest/turns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqestBody),
  });
}

async function main() {
  await registerGame();
  await showBoard(0);
}

main();

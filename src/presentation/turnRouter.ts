import express from "express";
import { connectMySQL } from "../dataaccess/connection";
import { GameGateway } from "../dataaccess/gameGateway";
import { SquareGateway } from "../dataaccess/squareGateway";
import { TurnGateway } from "../dataaccess/turnGateway";
import { DARK, LIGHT } from "../application/constants";
import { MoveGateway } from "../dataaccess/moveGateway";

export const turnRouter = express.Router();

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

turnRouter.get("/api/games/latest/turns/:turnCount", async (req, res) => {
  const turnCount = parseInt(req.params.turnCount);
  const conn = await connectMySQL();
  try {
    const gameRecord = await gameGateway.findLatest(conn);
    if (!gameRecord) {
      throw new Error("Game not found");
    }

    const turnRecord = await turnGateway.findForGameIdAndTurnCount(
      conn,
      gameRecord.id,
      turnCount
    );
    if (!turnRecord) {
      throw new Error("Turn not found");
    }

    const squareRecords = await squareGateway.findForTurnId(
      conn,
      turnRecord.id
    );

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc;
    });
    const responseBody = {
      turnCount: turnCount,
      board: board,
      nextDisc: turnRecord.nextDisc,
      winnerDisc: null,
    };
    res.json(responseBody);
  } finally {
    await conn.end();
  }
});

turnRouter.post("/api/games/latest/turns", async (req, res) => {
  const turnCount = parseInt(req.body.turnCount);
  const disc = parseInt(req.body.move.disc);
  const x = parseInt(req.body.move.x);
  const y = parseInt(req.body.move.y);

  //dbから前のターンの情報を取得
  const conn = await connectMySQL();
  try {
    const gameRecord = await gameGateway.findLatest(conn);
    if (!gameRecord) {
      throw new Error("Game not found");
    }

    const previousturnCount = turnCount - 1;
    let previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(
      conn,
      gameRecord.id,
      previousturnCount
    );
    if (!previousTurnRecord) {
      throw new Error("Turn not found");
    }

    const squareRecords = await squareGateway.findForTurnId(
      conn,
      previousTurnRecord.id
    );

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc;
    });

    //石が置けるかどうか

    //石をおく
    board[y][x] = disc;
    // dbに保存する
    const now = new Date();

    const nextDisc = disc === DARK ? LIGHT : DARK;
    const turnRecord = await turnGateway.insert(
      conn,
      gameRecord.id,
      turnCount,
      nextDisc,
      now
    );

    await squareGateway.insertAll(conn, turnRecord.id, board);
    await moveGateway.insert(conn, turnRecord.id, disc, x, y);
    await conn.commit();
  } finally {
    await conn.end();
  }
  res.status(201).end();
});

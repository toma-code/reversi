import { connectMySQL } from "../dataaccess/connection";
import { GameGateway } from "../dataaccess/gameGateway";
import { SquareGateway } from "../dataaccess/squareGateway";
import { TurnGateway } from "../dataaccess/turnGateway";
import { DARK, LIGHT } from "../application/constants";
import { MoveGateway } from "../dataaccess/moveGateway";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const squareGateway = new SquareGateway();
const moveGateway = new MoveGateway();
export class TurnService {
  async findLatestGameTurnByCount(turnCount: number) {
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
      return {
        turnCount: turnCount,
        board: board,
        nextDisc: turnRecord.nextDisc,
        winnerDisc: null,
      };
    } finally {
      await conn.end();
    }
  }
  async registerTurn(turnCount: number, disc: number, x: number, y: number) {
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
  }
}

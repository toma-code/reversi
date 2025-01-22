import mysql from "mysql2/promise";
import { TurnRecord } from "./turnRecord";

export class TurnGateway {
  async find(conn: mysql.Connection, gameId: number, turnCount: number) {
    const turnSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "select id, game_id, turn_count, next_disc, end_at from turns where game_id = ? and turn_count = ?",
      [gameId, turnCount]
    );
    const turn = turnSelectResult[0][0];
    return new TurnRecord(
      turn["id"],
      turn["game_id"],
      turn["turn_count"],
      turn["next_disc"],
      turn["end_at"]
    );
  }

  async insert(
    conn: mysql.Connection,
    gameId: number,
    turnCount: number,
    nextDisc: number,
    endAt: Date
  ) {
    const turnInsertResult = await conn.execute<mysql.ResultSetHeader>(
      "insert into turns (game_id, turn_count, next_disc, end_at) values (?, ?, ?, ?)",
      [gameId, turnCount, nextDisc, endAt]
    );
    const turnId = turnInsertResult[0].insertId;
    return new TurnRecord(turnId, gameId, turnCount, nextDisc, endAt);
  }
}

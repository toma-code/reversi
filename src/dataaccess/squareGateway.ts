import mysql from "mysql2/promise";
import { squareRecord } from "./squareRecord";

export class SquareGateway {
  async insertAll(conn: mysql.Connection, turnId: number, board: number[][]) {
    const squareCount = board
      .map((line) => line.length)
      .reduce((v1, v2) => v1 + v2, 0);

    const squaresInsertSql =
      "insert into squares (turn_id, x, y, disc) values" +
      Array.from(Array(squareCount))
        .map(() => "(?, ?, ?, ?)")
        .join(", ");

    const squaresInsertValues: any[] = [];
    board.forEach((line, y) => {
      line.forEach((disc, x) => {
        squaresInsertValues.push(turnId);
        squaresInsertValues.push(x);
        squaresInsertValues.push(y);
        squaresInsertValues.push(disc);
      });
    });
    await conn.execute(squaresInsertSql, squaresInsertValues);
  }

  async findForTurnId(
    conn: mysql.Connection,
    turnId: number
  ): Promise<squareRecord[]> {
    const squaresSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "select id, turn_id, x, y, disc from squares where turn_id = ?",
      [turnId]
    );
    const records = squaresSelectResult[0];
    return records.map((record) => {
      return new squareRecord(
        record["id"],
        record["turn_id"],
        record["x"],
        record["y"],
        record["disc"]
      );
    });
  }
}

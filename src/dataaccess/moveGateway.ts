import mysql from "mysql2/promise";

export class MoveGateway {
  async insert(
    conn: mysql.Connection,
    turnId: number,
    desc: number,
    x: number,
    y: number
  ) {
    await conn.execute(
      "insert into moves (turn_id, description, x, y) values (?, ?, ?, ?)",
      [turnId, desc, x, y]
    );
  }
}

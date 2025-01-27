export class MoveRecord {
  constructor(
    private _id: number,
    private _turnId: number,
    private _desc: number,
    private _x: number,
    private _y: number
  ) {}

  getId(): number {
    return this._id;
  }
}

export class GameRecord {
  constructor(private _id: number, private _startedAt: Date) {}
  get id(): number {
    return this._id;
  }
}

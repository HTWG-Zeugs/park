export class OccupancyStatus {
    totalSpaces: number;
    occupiedSpaces: number;

    constructor(totalSpaces: number, occupiedSpaces: number) {
        this.totalSpaces = totalSpaces;
        this.occupiedSpaces = occupiedSpaces;
    }
}
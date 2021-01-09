class Neighbors {
}
class LabyCell extends HTMLElement {
    constructor() {
        super();
        this.row = 0;
        this.col = 0;
        this.neighbors = {};
    }
    setSize(cellWidth) {
        this.style.position = 'absolute';
        this.style.width = cellWidth.toString() + 'px';
        this.style.height = cellWidth.toString() + 'px';
        this.style.top = (this.row * cellWidth).toString() + 'px';
        this.style.left = (this.col * cellWidth).toString() + 'px';
        this.drawWalls();
    }
    initCell(col, row) {
        this.wasVisited = false;
        this.col = col;
        this.row = row;
    }
    initWalls(eastWall, southWall) {
        this.eastWall = eastWall;
        this.southWall = southWall;
        this.neighbors = {
            north: [this.col, this.row - 1],
            east: [this.col + 1, this.row],
            south: [this.col, this.row + 1],
            west: [this.col - 1, this.row]
        };
        if (this.row === 0) {
            delete this.neighbors.north;
        }
        else if (this.southWall) {
            delete this.neighbors.south;
        }
        if (this.col === 0) {
            delete this.neighbors.west;
        }
        else if (this.eastWall) {
            delete this.neighbors.east;
        }
    }
    drawWalls() {
        this.style.borderRight = this.eastWall ? '1px solid #000' : '';
        this.style.borderBottom = this.southWall ? '1px solid #000' : '';
        this.style.borderTop = this.row ? '' : '1px solid #000';
        this.style.borderLeft = this.col ? '' : '1px solid #000';
    }
}
customElements.define('laby-cell', LabyCell);
class Labyrinthe {
    constructor(gameContainer, col = 35, row = 20) {
        this.labyrinth = [];
        this.gameField = gameContainer;
        this.cols = col;
        this.rows = row;
        this.gameField.innerHTML = '';
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let cellToAdd = document.createElement('laby-cell');
                cellToAdd.initCell(x, y);
                cellToAdd.initWalls(x === (this.cols - 1), y === (this.rows - 1));
                this.labyrinth[x + y * this.cols] = cellToAdd;
                this.gameField.appendChild(this.labyrinth[x + y * this.cols]);
            }
        }
        this.resizeGamefield();
        window.onresize = this.resizeGamefield;
    }
    start() {
        this.search();
    }
    resizeGamefield() {
        let cellWidth;
        if (this.gameField.clientHeight < (this.gameField.clientWidth * this.rows / this.cols)) {
            cellWidth = this.gameField.clientHeight / this.rows;
        }
        else {
            cellWidth = this.gameField.clientWidth / this.cols;
        }
        for (let cell = 0; cell < this.rows * this.cols; cell++) {
            this.labyrinth[cell].setSize(cellWidth);
        }
    }
    search(currentCell = 0) {
        this.labyrinth[currentCell].wasVisited = true;
        while (Object.keys(this.labyrinth[currentCell].neighbors).length) {
            let cardinal = Object.keys(this.labyrinth[currentCell].neighbors)[Math.floor(Math.random() * Object.keys(this.labyrinth[currentCell].neighbors).length)];
            let nextCellCoord = this.labyrinth[currentCell].neighbors[cardinal];
            let nextCell = nextCellCoord[0] + nextCellCoord[1] * this.cols;
            delete this.labyrinth[currentCell].neighbors[cardinal];
            if (this.labyrinth[nextCell].wasVisited) {
                if (cardinal === 'north') {
                    this.labyrinth[nextCell].southWall = true;
                    this.labyrinth[nextCell].drawWalls();
                }
                else if (cardinal === 'east') {
                    this.labyrinth[currentCell].eastWall = true;
                    this.labyrinth[currentCell].drawWalls();
                }
                else if (cardinal === 'south') {
                    this.labyrinth[currentCell].southWall = true;
                    this.labyrinth[currentCell].drawWalls();
                }
                else if (cardinal === 'west') {
                    this.labyrinth[nextCell].eastWall = true;
                    this.labyrinth[nextCell].drawWalls();
                }
            }
            else {
                if (cardinal === 'north') {
                    if (this.labyrinth[nextCell].neighbors.hasOwnProperty('south')) {
                        delete this.labyrinth[nextCell].neighbors['south'];
                    }
                }
                else if (cardinal === 'east') {
                    if (this.labyrinth[nextCell].neighbors.hasOwnProperty('west')) {
                        delete this.labyrinth[nextCell].neighbors['west'];
                    }
                }
                else if (cardinal === 'south') {
                    if (this.labyrinth[nextCell].neighbors.hasOwnProperty('north')) {
                        delete this.labyrinth[nextCell].neighbors['north'];
                    }
                }
                else if (cardinal === 'west') {
                    if (this.labyrinth[nextCell].neighbors.hasOwnProperty('east')) {
                        delete this.labyrinth[nextCell].neighbors['east'];
                    }
                }
                this.labyrinth[nextCell].drawWalls();
                this.search(nextCell);
            }
        }
    }
}
export { Labyrinthe };
//# sourceMappingURL=Labyrinthe.js.map
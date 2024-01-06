const GRID_SIZE = 4
const CELL_SIZE = 18
const CELL_GAP = 2


// we've taken our css variables from css and put them into javascript
export default class Grid {
    #cells
    constructor(gridElement) {
        gridElement.style.setProperty("--grid-size", GRID_SIZE)
        gridElement.style.setProperty("--cell-size", `${CELL_SIZE}vmin`)
        gridElement.style.setProperty("--cell-gap", `${CELL_GAP}vmin`)
        this.#cells = createCellElements(gridElement).map((cellElement, index) => {
            return new Cell(cellElement, index % GRID_SIZE, Math.floor(index / GRID_SIZE))
        })
        //console.log(this.#cells)
    }

    get cells() {
        return this.#cells
    }

    get cellsByColumn() {
        // cellGrid is the accumulator
        return this.#cells.reduce((cellGrid, cell) => {
            // create an array of an array :
            // if an array for a specific x coordinate already exists, it is used; otherwise, a new empty array []
            cellGrid[cell.x] = cellGrid[cell.x] || [] // 
            cellGrid[cell.x][cell.y] = cell
            return cellGrid
        }, []) // the end [] is the initial value for the accumulator
    }

    get cellsByRow() {
        return this.#cells.reduce((cellGrid, cell) => {
            // create an array of an array :
            // if an array for a specific y coordinate already exists, it is used; otherwise, a new empty array []
            cellGrid[cell.y] = cellGrid[cell.y] || [] // 
            cellGrid[cell.y][cell.x] = cell
            return cellGrid
        }, []) // the end [] is the initial value for the accumulator
    }

    get #emptyCells() {
        return this.#cells.filter(cell => cell.tile == null)
    }

    randomEmptyCell() {
        const randomIndex = Math.floor(Math.random() * this.#emptyCells.length)
        return this.#emptyCells[randomIndex]
    }
}

class Cell {
    #cellElement
    #x
    #y
    #tile
    #mergeTile

    constructor(cellElement, x, y) {
        this.#cellElement = cellElement
        this.#x = x
        this.#y = y
    }

    get x() {
        return this.#x
    }

    get y() {
        return this.#y
    }

    get tile() {
        return this.#tile
    }

    get mergeTile() {
        return this.#mergeTile
    }

    set tile(value) {
        // the value parameter is actually an instance of the Tile class
        this.#tile = value
        if (value == null) return
        // invoke setter mathod set x() to update initial x and y of this tile
        this.#tile.x = this.#x
        this.#tile.y = this.#y
    }

    set mergeTile(value) {
        this.#mergeTile = value
        if (value == null) return
        // doing this is for our animations to work: the tile moves and it's going to look like they merge
        this.#mergeTile.x = this.#x
        this.#mergeTile.y = this.#y
    }

    canAccept(tile) {
        return (
            this.tile == null || (this.mergeTile == null && this.tile.value === tile.value)
        )
    }

    mergeTiles() {
        if (this.tile == null || this.mergeTile == null) return
        this.tile.value = this.tile.value + this.mergeTile.value
        this.mergeTile.remove()
        this.mergeTile = null
    }
}

function createCellElements(gridElement) {
    const cells = []
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement("div")
        cell.classList.add("cell")
        cells.push(cell)
        gridElement.append(cell)
    }
    return cells
}
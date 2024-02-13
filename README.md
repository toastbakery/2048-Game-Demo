This is a front-end 2048 game demo that I wrote following a tutorial on YouTube.
👉 https://www.youtube.com/watch?v=wOVEe9eawXc&t=1234s

## To run this project
Local server is required to run this project, here are a few options:
1. **Run this Project on Vscode**
- open vscode, open project, then right click on the `index.html` , click "Show Preview". Once it is run on vscode, you can enter the same url in browser to access the game.
	![[Pasted image 20240213163741.png]]
2.  **Use a Simple HTTP Server:**
- Open a terminal in the project directory.
- If you have Python installed, you can use the following command to start a simple HTTP server: `python -m http.server 3000`
- Alternatively, you can use Node.js and the `http-server` package: `npx http-server -p 3000`
- Visit `http://127.0.0.1:3000/index.html` in your browser.

Here are some notes I took at each period of the tutorial:

## 1 index.html  and style.css (🕰️ 00:00:00 - 00:13:00)
### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
   <!-- other code -->
  <link rel="stylesheet" href="styles.css">
  <script src="script.js" type="module"></script>
</head>
<body>
  <h1>2048 Game</h1>
  <div id="game-board"></div>
</body>
</html>
```
In JavaScript, the `type="module"`  allow you to organize code into separate files and have better control over the scope and dependencies. And it indicates to the browser that the script should be treated as a module rather than traditional script.
### style.css
```css
#game-board {
    display: grid;
    grid-template-columns: repeat(var(--grid-size), var(--cell-size));
    grid-template-rows: repeat(var(--grid-size), var(--cell-size));
    background-color: #CCC;
    gap: var(--cell-gap);
    border-radius: 1vmin;
    padding:  var(--cell-gap);
    position: relative; /*This is important if you want to position child elements using absolute or relative positioning.*/
}

.tile {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    width: var(--cell-size);
    height: var(--cell-size);
    background-color: aquamarine;
    border-radius: 1vmin;
    top: calc(var(--y) * (var(--cell-size) + var(--cell-gap)) + var(--cell-gap));
    left: calc(var(--x) * (var(--cell-size) + var(--cell-gap)) + var(--cell-gap));
    background-color: hsl(200, 50%, var(--background-lightness));
    color: hsl(200, 20%, var(--text-lightness));
    animation: show 200ms ease-in-out;
    /* let every tile moving instead of snapping into place */
    transition: 100ms ease-in-out;   
}

@keyframes show {
    0% {
        opacity: .5;
        transform: scale(0);
    }
}
```
- `position: relative;` it establishes a new positioning context for its child elements.
- `transition: 100ms ease-in-out;` let every tile moving instead of snapping into place.

## 2 Early stage of Grid.js (🕰️ 00:13:00 - 00:20:00)
![Early stage of Grid.js](https://p.ipic.vip/rpxglw.png)

## 3 The first 2 random tiles on game-board(🕰️ 00:20:00 - 00:30:00)
![The first 2 random tiles](https://p.ipic.vip/ck79qn.png)

## 4 `grid.cellsByColumn`(🕰️ 00:30:00 - 00:35:00)
```js
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
```
![print cellsByColumn](https://p.ipic.vip/j1txsc.png)

## 5 `moveUp()`(🕰️ 00:35:00 - 00:45:00)
```js
function moveUp() {
    return slideTiles(grid.cellsByColumn)
}

function slideTiles(cells) {
    // returns a promise that resolves when all the promises inside the array passed to Promise.all have resolved. 
    return Promise.all(
        // each group return an array of promise, then the arrays are flattened into a single array.
        cells.flatMap(group => {
            const promises = []
            for (let i = 1; i < group.length; i++) {
                const cell = group[i]
                if (cell.tile == null) continue
                let lastValidCell
                for (let j = i - 1; j >= 0; j--) {
                    const moveToCell = group[j]
                    if (!moveToCell.canAccept(cell.tile)) break
                    lastValidCell = moveToCell
                }

                if (lastValidCell != null) {
                    promises.push(cell.tile.waitForTransition())
                    if (lastValidCell.tile != null) {
                        lastValidCell.mergeTile = cell.tile
                    } else {
                        lastValidCell.tile = cell.tile
                    }
                    cell.tile = null
                }
            }
            return promises
        })
    )
}
```

- `Promise.all(...)`
👉 [[2048 game demo#7 Coordinate tile transition animations(🕰️ 00 50 00 - 00 53 00 )]]

##  6 `mergeTile()`(🕰️ 00:45:00 - 00:50:00)
```js
get mergeTile() {
        return this.#mergeTile
        }
        
set mergeTile(value) {
        this.#mergeTile = value
        if (value == null) return
        // doing this is for our animations to work: the tile moves and it's going to look like they merge
        this.#mergeTile.x = this.#x
        this.#mergeTile.y = this.#y
    }
    
mergeTiles() {
        if (this.tile == null || this.mergeTile == null) return
        this.tile.value = this.tile.value + this.mergeTile.value
        this.mergeTile.remove()
        this.mergeTile = null
    }    
```

## 7 Coordinate tile transition animations(🕰️ 00:50:00 - 00:53:00 )
**`Promise.all(...)`:**
- The function returns a promise that resolves when all the promises inside the array passed to `Promise.all` have resolved. This is used to coordinate the completion of tile transition animations.


## 8 `canMove()`(🕰️ 00:53:00 - 00:57:00 )
```js
function canMoveUp() {
    return canMove(grid.cellsByColumn)
}

function canMove(cells) {
    return cells.some(group => {
        // if there is at least one cell in this array return true, the entire thing is going to return true
        return group.some((cell, index) => {
            if (index === 0) return false
            if (cell.tile == null) return false
            const moveToCell = group[index - 1]
            return moveToCell.canAccept(cell.tile)
        })
    })
}
```


## 9 lose alert (🕰️ 00:57:00 - 00:59:00 )

```js
// can't move at any direction( which also indicates only empty cell left)
    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        //wait for the animation of the last tile to appear and then we got a alert
        newTile.waitForTransition(true).then(() => {
            alert("You lose!")
        })
        return
    }
```

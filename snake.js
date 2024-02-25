const movingIntervals = {right: null, left: null, up: null, down: null}
const keyDirections = { 37: 'left', 38: 'up', 39: 'right', 40: 'down'}
const countDIV = document.getElementById("count")
const END_GAME_SCREEN = document.getElementById("game-over-screen")
const snake = []
const snakeCoords = new Map()
const foodCoords = {x:0, y:0}
const allFieldCoords = []
let direction = 'right'
let currentFood
let count = 0
let collision = false
let foodColor
document.addEventListener('keydown', moveSnake)
const cont = document.getElementById("container")

function moveSnake(event) {
    if (keyDirections[event.keyCode] === 'right') moveSnakeRight()
    if (keyDirections[event.keyCode] === 'left') moveSnakeLeft()
    if (keyDirections[event.keyCode] === 'up') moveSnakeUp()
    if (keyDirections[event.keyCode] === 'down') moveSnakeDown()
}

function moveSnakeRight() {
    if (movingIntervals.right === null && direction !== 'left') {
        clearIntervals()
        move('right')
    }
}

function moveSnakeDown() {
    if (movingIntervals.down === null && direction !== 'up') {
        clearIntervals()
        move('down')
    }
}

function moveSnakeLeft() {
    if (movingIntervals.left === null && direction !== 'right') {
        clearIntervals()
        move('left')
    }
}

function moveSnakeUp() {
    if (movingIntervals.up === null && direction !== 'down') {
        clearIntervals()
        move('up')
    }
}

function clearIntervals() {
    Object.keys(movingIntervals).forEach(movingInterval => {
        clearInterval(movingIntervals[movingInterval])
        movingIntervals[movingInterval] = null
    })
}

function move(direc) {
    movingIntervals[direc] = setInterval(() => {
        direction = direc
        const currentHeadCoords = snakeCoords.get(snake[snake.length-1])
        const newHeadCoords = collisionCheck(currentHeadCoords.x, currentHeadCoords.y, direc)
        const snakeAteFood = foodCollisionCheck(currentHeadCoords.x, currentHeadCoords.y)
        if (newHeadCoords) {
            if (direc === 'right') createSnakePart(newHeadCoords.x + baseSnakeSize, newHeadCoords.y)
            else if (direc === 'left') createSnakePart(newHeadCoords.x - baseSnakeSize, newHeadCoords.y)
            else if (direc === 'up') createSnakePart(newHeadCoords.x, newHeadCoords.y - baseSnakeSize) 
            else createSnakePart(newHeadCoords.x, newHeadCoords.y + baseSnakeSize)
            if (!snakeAteFood) {
                removeTail()
            }
        }
    }, speed)
}

function collisionCheck(x, y, direction) {
    let coords = {x, y}
    if (selfCollisionCheck(x, y)) {
        coords = endGame()
    } else if (
        (x === 0 && direction === 'left')                           ||
        (x === baseSize - baseSnakeSize && direction === 'right')   ||
        (y === 0 && direction === 'up')                             ||
        (y === baseSize - baseSnakeSize && direction === 'down')    
    ) {
        if (!comingThroughWalls) {
            coords = endGame()
        } else {
            if (direction === 'left') {
                coords.x = baseSize;
                coords.y = y;
            } else if (direction === 'right') {
                coords.x = -baseSnakeSize;
                coords.y = y;
            } else if (direction === 'up') {
                coords.x = x;
                coords.y = baseSize;
            } else {
                coords.x = x;
                coords.y = -baseSnakeSize;
            }
        }
    }
    return coords
}

function endGame() {
    clearIntervals()
    createBestResult(count)
    END_GAME_SCREEN.style.display = 'flex'
    document.removeEventListener('keydown', moveSnake)
}

function removeTail() {
    snakeCoords.delete(snake[0])
    snake[0].remove()
    snake.shift() 
}

function selfCollisionCheck(x,y) {
    const coords = Array.from(snakeCoords.values())
    coords.pop()
    for (let i = 0; i < coords.length-1; i++) {
        if (coords[i].y === y && coords[i].x === x) {
            return true 
        }
    }
}

function foodCollisionCheck(x,y) {
    if (x === foodCoords.x && y === foodCoords.y) {
        count++
        countDIV.innerHTML = 'COUNT: ' + count
        currentFood.remove()
        currentFood = null
        if (enableSplashes) {
            runSplashes(y,x) // function from splashes.js
        }
        generateFood()
        return true
    } 
    return false
}

function createSnakePart(newOffsetX, newOffsetY) {
    const snakePart = generateBlock(baseSnakeSize, newOffsetY, newOffsetX, snakeColor, 0, false, true, true)
    snake.push(snakePart)
    snakeCoords.set(snakePart, {x : newOffsetX, y : newOffsetY})
    cont.append(snakePart) 
}

function generateFood() {
    const foodPositions = generateFoodPositions()
    const foodPosition = foodPositions[Math.floor(Math.random() * foodPositions.length)]
    foodCoords.x = foodPosition.x
    foodCoords.y = foodPosition.y
    const color = foodColor = colors[Math.floor(Math.random() * colors.length)]
    const food = generateBlock(baseSnakeSize, foodCoords.y, foodCoords.x, color, 0, true, false)
    cont.append(food)
    currentFood = food
    foodColor = color
}

function generateFoodPositions() {
    const snakePositionsToString = Array.from(snakeCoords.values()).map(snakePosition => {
        return JSON.stringify(snakePosition)
    })
    return allFieldCoords.filter(coordsObj => {
        return !snakePositionsToString.includes(JSON.stringify(coordsObj))
    })
}

function generateBlock(size, top, left, color, r, boxShadow, border, isSnakePart) {
    const block = document.createElement('div')
    block.style.width = size-1 + 'px'
    block.style.height = size-1 + 'px'
    block.style.background = color
    block.style.position = 'absolute'
    block.style.top = top + 'px'
    block.style.left = left + 'px'
    if (border) block.style.border = snakeBorder
    if (boxShadow) block.style.boxShadow = '0px 0px 15px 1px ' + color
    if (isSnakePart) block.classList.add('snake-part')
    block.style.borderRadius = r + '%'
    return block
}

function restartGame() {
    window.location.reload()
}






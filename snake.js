const fieldSize = 35
const baseSnakeSize = 10
const basePointX = baseSnakeSize
const basePointY = baseSnakeSize
const initialSize = 4
const baseSize = fieldSize * baseSnakeSize
const movingIntervals = {right: null, left: null, up: null, down: null}
const keyDirections = { 37: 'left', 38: 'up', 39: 'right', 40: 'down'}
const cont = document.getElementById("container")
const countDIV = document.getElementById("count")
const snake = []
const snakeCoords = new Map()
const foodCoords = {x:0, y:0}
const allFieldCoords = []
let comingThroughWalls = true
let speed = 50
let direction = 'right'
let currentFood
let count = 0
let collision = false
let selfCollision = false

const colors = ['rgb(13, 219, 37)', 'rgb(251, 33, 3)', 'rgb(5, 255, 145)', 'rgb(5, 160, 255)', 'rgb(175, 5, 255)', 'rgb(255, 5, 141)', 'rgb(255, 5, 20)']
const snakeColor = 'rgb(255, 255, 255)'
let foodColor
let currentColor

countDIV.innerHTML = 'COUNT: ' + count
countDIV.style.position = 'absolute'
countDIV.style.left = 50 + '%'
countDIV.style.width = 100 + 'px'
countDIV.style.marginLeft = -100 / 2 + 'px'
countDIV.style.top = 100 + 'px'
countDIV.style.color = 'white'

document.addEventListener('keydown', moveSnake)

cont.style.width = baseSize + 'px'
cont.style.height = baseSize + 'px'
cont.style.position = 'absolute'
cont.style.backgroundColor = 'white'
cont.style.overflow = 'hidden'
cont.style.backgroundColor = 'rgb(29, 39, 61)'
cont.style.border = '1px solid white'
cont.style.top = 50 + '%'
cont.style.left = 50 + '%'
cont.style.marginTop = -baseSize / 2 + 'px'
cont.style.marginLeft = -baseSize / 2 + 'px'

function drawSnake(initialSize) {
    for (let i = 1; i < initialSize + 1; i++) {
        createSnakePart(basePointX * i, basePointY)
    }
} 

drawSnake(initialSize)

function generateFieldCoords() {
    for (i = 0; i < baseSize; i += baseSnakeSize) {
        for (j = 0; j < baseSize; j += baseSnakeSize) {
            const coords = {}
            coords.x = i
            coords.y = j
            allFieldCoords.push(coords)
        }
    }
}

generateFieldCoords()

function moveSnake(event) {
    const eventKeyCode = event.keyCode
    if (keyDirections[eventKeyCode] === 'right') moveSnakeRight()
    if (keyDirections[eventKeyCode] === 'left') moveSnakeLeft()
    if (keyDirections[eventKeyCode] === 'up') moveSnakeUp()
    if (keyDirections[eventKeyCode] === 'down') moveSnakeDown()
}

function moveSnakeRight() {
    if (movingIntervals.right === null && direction !== 'left') {
        clearIntervals(['left','up','down'])
        move('right')
    }
}

function moveSnakeDown() {
    if (movingIntervals.down === null && direction !== 'up') {
        clearIntervals(['right','left','up'])
        move('down')
    }
}

function moveSnakeLeft() {
    if (movingIntervals.left === null && direction !== 'right') {
        clearIntervals(['right','up','down'])
        move('left')
    }
}

function moveSnakeUp() {
    if (movingIntervals.up === null && direction !== 'down') {
        clearIntervals(['right','left','down'])
        move('up')
    }
}

function clearIntervals(intervals) {
    Object.keys(movingIntervals).forEach(movingInterval => {
        intervals.forEach(interval => {
            if (interval === movingInterval) {
                clearInterval(movingIntervals[movingInterval])
                movingIntervals[movingInterval] = null
            } 
        })
    })
}

function move(direc) {
    movingIntervals[direc] = setInterval(() => {
        const oldCoords = snakeCoords.get(snake[snake.length-1])
        direction = direc
        
        const coords = collisionCheck(oldCoords.x, oldCoords.y, direc)
        foodCollisionCheck(oldCoords.x, oldCoords.y)
        if (!collision) {
            if (direc === 'right') createSnakePart(coords.x + basePointX, coords.y)
            else if (direc === 'left') createSnakePart(coords.x - basePointX, coords.y)
            else if (direc === 'up') createSnakePart(coords.x, coords.y - basePointY) 
            else createSnakePart(coords.x, coords.y + basePointY)
            removeTail()
        } 
    }, speed)
}

function collisionCheck(x, y, direction) {
    const coords = {}
    if ((x === 0 && direction === 'left') || 
        (x === (baseSize - basePointX) && direction === 'right') || 
        (y === 0 && direction === 'up') || 
        (y === (baseSize - basePointY) && direction === 'down') || 
        selfCollisionCheck(x,y)) {
        if (!comingThroughWalls) {
            collision = true
            clearIntervals([direction])
            createBestResult(count) // function from bestResult.js
            document.removeEventListener('keydown', moveSnake)
        } else {
            if (selfCollision) {
                collision = true
                clearIntervals([direction])
                createBestResult(count) // function from bestResult.js
                document.removeEventListener('keydown', moveSnake)
            } else {
                if (direction === 'left') {
                    createSnakePart(baseSize, y)
                    removeTail()
                    coords.x = baseSize
                    coords.y = y
                } else if (direction === 'right') {
                    createSnakePart(-basePointX, y)
                    removeTail()
                    coords.x = -basePointX
                    coords.y = y
                } else if (direction === 'up') {
                    createSnakePart(x, baseSize)
                    removeTail()
                    coords.x = x
                    coords.y = baseSize
                } else {
                    createSnakePart(x, -basePointY)
                    removeTail()
                    coords.x = x
                    coords.y = -basePointY
                }
            }
        }
    } else {
        coords.x = x
        coords.y = y
    } 
    return coords
}

function removeTail() {
    snakeCoords.delete(snake[0])
    snake[0].remove()
    snake.shift() 
}

function selfCollisionCheck(x,y) {
    let collision = false
    const arr = Array.from(snakeCoords.values())
    arr.pop()
    arr.forEach(coordObj => {
        if (coordObj.y === y && coordObj.x === x) collision = true 
    })
    if (collision === true) {
        selfCollision = true
        return true
    }  
    return false
}

function foodCollisionCheck(x,y) {
    if (x === foodCoords.x && y === foodCoords.y) {
        count++
        countDIV.innerHTML = 'COUNT: ' + count
        currentFood.remove()
        currentFood = null
        createSnakePart(foodCoords.x, foodCoords.y, true)
        runSplashes(y,x) // function from splashes.js
        generateFood()
    } 
}

function createSnakePart(newOffsetX, newOffsetY) {
    const snakePart = generateBlock(baseSnakeSize, baseSnakeSize, newOffsetY, newOffsetX, snakeColor, 0, false, false)
    snake.push(snakePart)
    snakeCoords.set(snakePart, {x : newOffsetX, y : newOffsetY})
    cont.append(snakePart) 
}

function generateFood() {
    const foodPositions = generateFoodPositions(Array.from(snakeCoords.values()))
    const foodPosition = foodPositions[Math.floor(Math.random() * foodPositions.length)]
    foodCoords.x = foodPosition.x
    foodCoords.y = foodPosition.y
    const color = foodColor = colors[Math.floor(Math.random() * colors.length)]
    const food = generateBlock(baseSnakeSize, baseSnakeSize, foodCoords.y, foodCoords.x, color, 0, true, false)
    cont.append(food)
    currentFood = food
    foodColor = color
}

generateFood()

function generateFoodPositions(snakePositions) {
    const snakePositionsToString = []
    snakePositions.forEach(snakePosition => {
        snakePositionsToString.push(JSON.stringify(snakePosition))
    })
    const filteredCoords = allFieldCoords.filter(coordsObj => {
        return !snakePositionsToString.includes(JSON.stringify(coordsObj))
    })
    return filteredCoords
}

function generateBlock(width, height, top, left, color, r, boxShadow, border) {
    const block = document.createElement('div')
    block.style.width = width + 'px'
    block.style.height = height + 'px'
    block.style.background = color
    block.style.position = 'absolute'
    block.style.top = top + 'px'
    block.style.left = left + 'px'
    if (border) block.style.border = '1px solid rgb(29, 39, 61)'
    if (boxShadow) block.style.boxShadow = '0px 0px 15px 1px ' + color
    block.style.borderRadius = r + '%'
    return block
}






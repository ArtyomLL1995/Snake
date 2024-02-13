const container = document.getElementById("container")
const countContainer = document.getElementById("count")
const settingIcon = document.querySelector('i')
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

const DARK_BODY = '#222738'
const DARK_CONTAINER = '#181825'
const DARK_CONTAINER_BORDER = '1px solid rgba(236, 236, 236, 0.2)'
const DARK_MAIN = 'white'
const DARK_SNAKE = 'white'
const DARK_SNAKE_BORDER = '0.5px solid white'
const DARK_GRID = '0.5px solid rgba(236, 236, 236, 0.05)'
const DARK_FOOD_COLORS = ['rgb(13, 219, 37)', 'rgb(251, 33, 3)', 'rgb(5, 255, 145)', 'rgb(5, 160, 255)', 'rgb(175, 5, 255)', 'rgb(255, 5, 141)', 'rgb(255, 5, 20)']

const LIGHT_BODY = '#f9fafb'
const LIGHT_CONTAINER = '#f3f4f6'
const LIGHT_CONTAINER_BORDER = '1px solid lightgrey'
const LIGHT_MAIN = '#181825'
const LIGHT_SNAKE = 'lightgreen'
const LIGHT_SNAKE_BORDER = '0.5px solid lightgreen'
const LIGHT_GRID = '0.05px solid rgba(211, 211, 211, 0.5)'
const LIGHT_FOOD_COLORS = ['orange', 'rgb(251, 33, 3)', 'rgb(5, 160, 255)', 'rgb(175, 5, 255)', 'rgb(255, 5, 141)', 'rgb(255, 5, 20)']

let fieldSize
let baseSnakeSize
let baseSize // baseSnakeSize is in settings.js
let speed
let comingThroughWalls
let initialSize
let enableGrid
let enableSplashes

let bestResultColor
let gridBorder
let snakeBorder
let colors = []
let snakeColor
let colorMode

let database

connectDB()
.then(db => {
    database = db
    getSettingsFromTheDatabase()
})
.catch(error => {
    console.error('error getting database: ', error)
})

function setColorMode(color) {
    const circle = document.getElementById('theme-circle')
    if (color === 'dark') {
        circle.style.transform = "translateX(0px)"
        assignColorModeCSS(DARK_BODY, DARK_CONTAINER, DARK_CONTAINER_BORDER, DARK_MAIN, DARK_SNAKE, DARK_SNAKE_BORDER, DARK_GRID, DARK_FOOD_COLORS)
    } else if (color === 'light') {
        circle.style.transform = "translateX(30px)"
        assignColorModeCSS(LIGHT_BODY, LIGHT_CONTAINER, LIGHT_CONTAINER_BORDER, LIGHT_MAIN, LIGHT_SNAKE, LIGHT_SNAKE_BORDER, LIGHT_GRID, LIGHT_FOOD_COLORS)
    }
    if (enableGrid) {
        generateGrid() 
    }
    changeSnakeColor()
}

function assignColorModeCSS(bodyBGColor, contBGColor, contBorderColor, mainColor, snakeClr, snakeBr, gridBr, foodColors) {
    document.body.style.backgroundColor = bodyBGColor
    container.style.backgroundColor = contBGColor
    container.style.border = contBorderColor
    countContainer.style.color = mainColor
    settingIcon.style.color = mainColor
    bestResultColor = mainColor
    snakeColor = snakeClr
    snakeBorder = snakeBr
    gridBorder = gridBr
    colors = foodColors
}

function generateGrid() {
    const gridItem = document.querySelectorAll('.grid-item')
    if (gridItem.length === 0) {
        for (let i = 0; i < fieldSize*fieldSize; i++) {
            const div = document.createElement('div')
            div.style.width = baseSnakeSize-1 + 'px'
            div.style.height = baseSnakeSize-1 + 'px'
            div.style.border = gridBorder
            div.classList.add('grid-item')
            container.appendChild(div)
        }
    } else {
        gridItem.forEach(item => {
            item.style.border = gridBorder
        })
    }
}

function changeSnakeColor() {
    const snakeParts = document.querySelectorAll('.snake-part')
    snakeParts.forEach(snakePart => {
        snakePart.style.backgroundColor = snakeColor
        snakePart.style.border = snakeBorder
    })
}

function toggleOpenSettins() {
    const settingsPage = document.getElementById('settings-page');
    const currentLeft = parseInt(window.getComputedStyle(settingsPage).right);
    const newLeft = currentLeft === -600 ? 0 : -600
    settingsPage.style.right = `${newLeft}px`;
}

function turnSettingIcon() {
    transform(180)
}

function turnBackSettingIcon() {
    transform(0)
}

function transform(deg) {
    const settingIcon = document.getElementById('settings-icon')
    settingIcon.style.mozTransform = 'rotate('+deg+'deg)'; 
    settingIcon.style.msTransform = 'rotate('+deg+'deg)'; 
    settingIcon.style.oTransform = 'rotate('+deg+'deg)'; 
    settingIcon.style.transform = 'rotate('+deg+'deg)'; 
}

function connectDB() {
    return new Promise((resolve, reject) => {
        const dataBaseOpenRequest = indexedDB.open("snake game", 1);

        dataBaseOpenRequest.onerror = function(err) {
            reject(err);
        }

        dataBaseOpenRequest.onsuccess = function() {
            resolve(dataBaseOpenRequest.result);
        }

        dataBaseOpenRequest.onupgradeneeded = function(e) {
            e.currentTarget.result.createObjectStore("snake settings", { keyPath: "key" });
            connectDB();
        }
    });
}

function saveSettingsToTheDatabase(reload = true) {

    const transaction = database.transaction("snake settings", "readwrite")

    const snakeSettings = transaction.objectStore("snake settings")

    const settings = {
        key : 1,
        baseSnakeSize,
        fieldSize,
        speed,
        initialSize,
        comingThroughWalls,
        splashes : enableSplashes,
        grid : enableGrid,
        colorMode
    }

    const request = snakeSettings.put(settings)

    request.onsuccess = function() {
        if (reload) {
            window.location.reload()
        }
    }
    
    request.onerror = function() {
        alert('Error saving settins')
    }
}

function getSettingsFromTheDatabase() {
    const transaction = database.transaction("snake settings", "readonly"); 
    const snakeSettings = transaction.objectStore("snake settings");
    const request = snakeSettings.get(1)
    request.onsuccess = function() {
        const {speed, fieldSize, baseSnakeSize, comingThroughWalls, initialSize, grid, splashes, colorMode} = request.result
        setInitialSettings(speed, fieldSize, baseSnakeSize, comingThroughWalls, initialSize, grid, splashes, colorMode)
        generateFieldCoords()
        drawStartSnake()
        setColorMode(colorMode)
        generateFood()
        populateSettingInputs()
    };
    request.onerror = function() {
        console.log("Error gettings settings", request.error);
    };
}

function toggleColor() {
    if (colorMode === 'dark') {
        setColorMode('light')
        colorMode = 'light'
    } else {
        setColorMode('dark')
        colorMode = 'dark'
    }
    saveSettingsToTheDatabase(false)
}

function setInitialSettings(sd = 50, fs = 25, bs = 20, cw = true, is = 3, eg = true, sp = true, cl = 'dark') {
    speed = Number(sd)
    fieldSize = Number(fs)
    baseSnakeSize = Number(bs)
    initialSize = Number(is)
    comingThroughWalls = cw
    enableGrid = eg
    enableSplashes = sp
    colorMode = cl
    baseSize = fieldSize * baseSnakeSize

    container.style.width = baseSize + 'px'
    container.style.height = baseSize + 'px'
    container.style.marginTop = -baseSize / 2 + 'px'
    container.style.marginLeft = -baseSize / 2 + 'px'
}

function toggleSetting(event) {
    const circle = event.currentTarget.querySelector('.circle')
    if (circle.dataset.name === 'walls') {
        if (comingThroughWalls) {
            circle.style.transform = "translateX(30px)"
        } else {
            circle.style.transform = "translateX(0px)"
        }
        comingThroughWalls = !comingThroughWalls
    } else if (circle.dataset.name === 'splashes') {
        if (enableSplashes) {
            circle.style.transform = "translateX(30px)"
        } else {
            circle.style.transform = "translateX(0px)"
        }
        enableSplashes = !enableSplashes
    } else if (circle.dataset.name === 'grid') {
        if (enableGrid) {
            circle.style.transform = "translateX(30px)"
        } else {
            circle.style.transform = "translateX(0px)"
        }
        enableGrid = !enableGrid
    }
}

function saveInput(event) {
    if (event.target.dataset.name === 'snake size') {
        baseSnakeSize = event.target.value
    } else if (event.target.dataset.name === 'field size') {
        fieldSize = event.target.value
    } else if (event.target.dataset.name === 'snake speed') {
        speed = event.target.value
    }
}

function populateSettingInputs() {

    document.querySelectorAll('.setting-toggle').forEach(settingToggle => {
        const circle = settingToggle.querySelector('.circle')
        if (circle.dataset.name === 'walls') {
            if (comingThroughWalls) {
                circle.style.transform = "translateX(0px)"
            } else {
                circle.style.transform = "translateX(30px)"
            }
        } else if (circle.dataset.name === 'splashes') {
            if (enableSplashes) {
                circle.style.transform = "translateX(0px)"
            } else {
                circle.style.transform = "translateX(30px)"
            }
        } else if (circle.dataset.name === 'grid') {
            if (enableGrid) {
                circle.style.transform = "translateX(0px)"
            } else {
                circle.style.transform = "translateX(30px)"
            }
        }
    })

    document.querySelectorAll('.setting-input').forEach(settingInput => {
        const input = settingInput.querySelector('input')
        if (input.dataset.name === 'snake size') {
            input.value = baseSnakeSize
        } else if (input.dataset.name === 'field size') {
            input.value = fieldSize
        } else if (input.dataset.name === 'snake speed') {
            input.value = speed
        }
    })
}


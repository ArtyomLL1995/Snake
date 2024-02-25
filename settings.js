const container = document.getElementById("container")
const countContainer = document.getElementById("count")
const bestResultContainer = document.getElementById("best-results-container")
const settingIcon = document.querySelector('i')
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
const initialSize = 3
const TOGGLE_ON_COLOR = '#70798C'
const TOGGLE_OF_COLOR = '#6BD425'

const SNAKE_SETTINGS_DB = 'snake settings'

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
let baseSize
let speed
let comingThroughWalls
let enableGrid
let enableSplashes

let bestResultColor
let gridBorder
let snakeBorder
let colors = []
let snakeColor
let colorMode

let database

connectDB(SNAKE_SETTINGS_DB)
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
    bestResultContainer.style.color = mainColor
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

function drawStartSnake() {
    for (let i = 1; i < initialSize + 1; i++) {
        createSnakePart(baseSnakeSize * i, baseSnakeSize)
    }
} 

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

function transform(deg) {
    const settingIcon = document.getElementById('settings-icon')
    settingIcon.style.mozTransform = 'rotate('+deg+'deg)'; 
    settingIcon.style.msTransform = 'rotate('+deg+'deg)'; 
    settingIcon.style.oTransform = 'rotate('+deg+'deg)'; 
    settingIcon.style.transform = 'rotate('+deg+'deg)'; 
}

function connectDB(tableName) {
    return new Promise((resolve, reject) => {
        const dataBaseOpenRequest = indexedDB.open(tableName, 1);

        dataBaseOpenRequest.onerror = function(err) {
            reject(err);
        }

        dataBaseOpenRequest.onsuccess = function() {
            resolve(dataBaseOpenRequest.result);
        }

        dataBaseOpenRequest.onupgradeneeded = function(e) {
            e.currentTarget.result.createObjectStore(tableName, { keyPath: "key" });
            connectDB(tableName);
        }
    });
}

function saveSettingsToTheDatabase(reload = true) {

    const transaction = database.transaction(SNAKE_SETTINGS_DB, "readwrite")

    const snakeSettings = transaction.objectStore(SNAKE_SETTINGS_DB)

    const settings = {
        key : 1,
        baseSnakeSize,
        fieldSize,
        speed,
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
    const transaction = database.transaction(SNAKE_SETTINGS_DB, "readonly"); 
    const snakeSettings = transaction.objectStore(SNAKE_SETTINGS_DB);
    const request = snakeSettings.get(1)
    request.onsuccess = function() {
        setInitialSettings(
            request.result?.speed, 
            request.result?.fieldSize, 
            request.result?.baseSnakeSize, 
            request.result?.comingThroughWalls, 
            request.result?.grid, 
            request.result?.splashes, 
            request.result?.colorMode
        )
        generateFieldCoords()
        drawStartSnake()
        setColorMode(colorMode)
        generateFood()
        populateSettingInputs()
    };
    request.onerror = function() {
        console.error("Error gettings settings", request.error);
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

function setInitialSettings(sd, fs, bs, cw, eg, sp, cl) {
    speed = sd !== undefined ? Number(sd) : 50
    fieldSize = fs !== undefined ? Number(fs) : 25
    baseSnakeSize = bs !== undefined ? Number(bs) : 20
    comingThroughWalls = cw !== undefined ? cw : true
    enableGrid = eg !== undefined ? eg : true
    enableSplashes = sp !== undefined ? sp : true
    colorMode = cl !== undefined ? cl : 'dark'
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
            circle.style.transform = "translateX(0px)"
            event.currentTarget.style.backgroundColor = TOGGLE_ON_COLOR
        } else {
            circle.style.transform = "translateX(30px)"
            event.currentTarget.style.backgroundColor = TOGGLE_OF_COLOR
        }
        comingThroughWalls = !comingThroughWalls
    } else if (circle.dataset.name === 'splashes') {
        if (enableSplashes) {
            circle.style.transform = "translateX(0px)"
            event.currentTarget.style.backgroundColor = TOGGLE_ON_COLOR
        } else {
            circle.style.transform = "translateX(30px)"
            event.currentTarget.style.backgroundColor = TOGGLE_OF_COLOR
        }
        enableSplashes = !enableSplashes
    } else if (circle.dataset.name === 'grid') {
        if (enableGrid) {
            circle.style.transform = "translateX(0px)"
            event.currentTarget.style.backgroundColor = TOGGLE_ON_COLOR
        } else {
            circle.style.transform = "translateX(30px)"
            event.currentTarget.style.backgroundColor = TOGGLE_OF_COLOR
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
        const circleContainer = circle.closest('.setting-toggle')
        if (circle.dataset.name === 'walls') {
            if (comingThroughWalls) {
                circle.style.transform = "translateX(30px)"
                circleContainer.style.backgroundColor = TOGGLE_OF_COLOR
            } else {
                circle.style.transform = "translateX(0px)"
                circleContainer.style.backgroundColor = TOGGLE_ON_COLOR
            }
        } else if (circle.dataset.name === 'splashes') {
            if (enableSplashes) {
                circle.style.transform = "translateX(30px)"
                circleContainer.style.backgroundColor = TOGGLE_OF_COLOR
            } else {
                circle.style.transform = "translateX(0px)"
                circleContainer.style.backgroundColor = TOGGLE_ON_COLOR
            }
        } else if (circle.dataset.name === 'grid') {
            if (enableGrid) {
                circle.style.transform = "translateX(30px)"
                circleContainer.style.backgroundColor = TOGGLE_OF_COLOR
            } else {
                circle.style.transform = "translateX(0px)"
                circleContainer.style.backgroundColor = TOGGLE_ON_COLOR
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


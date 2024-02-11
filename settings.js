const fieldSize = 25
const baseSnakeSize = 20
const speed = 50
const initialSize = 3
let bestResultColor
let gridBorder
let snakeBorder
let colors = []
let snakeColor
const container = document.getElementById("container")
let colorMode = 'dark'
const countContainer = document.getElementById("count")
const settingIcon = document.querySelector('i')

const comingThroughWalls = true // if 'false' snake dies when hits the wall

function setColorMode(color) {
    if (color === 'dark') {
        container.style.backgroundColor = '#181825'
        document.body.style.backgroundColor = '#222738'
        container.style.border = '1px solid rgba(236, 236, 236, 0.2)'
        countContainer.style.color = 'white'
        settingIcon.style.color = 'white'
        bestResultColor = 'white'
        snakeColor = 'white'
        snakeBorder = '0.5px solid white'
        gridBorder = '0.5px solid rgba(236, 236, 236, 0.05)'
        colors = ['rgb(13, 219, 37)', 'rgb(251, 33, 3)', 'rgb(5, 255, 145)', 'rgb(5, 160, 255)', 'rgb(175, 5, 255)', 'rgb(255, 5, 141)', 'rgb(255, 5, 20)']
    } else if (color === 'light') {
        container.style.backgroundColor = '#f3f4f6' 
        document.body.style.backgroundColor = '#f9fafb'
        container.style.border = '1px solid lightgrey'
        countContainer.style.color = '#181825'
        settingIcon.style.color = '#181825'
        bestResultColor = '#181825'
        snakeColor = 'lightgreen'
        snakeBorder = '0.5px solid lightgreen'
        gridBorder = '0.05px solid rgba(211, 211, 211, 0.5)'
        colors = ['orange', 'rgb(251, 33, 3)', 'orangered', 'rgb(5, 160, 255)', 'rgb(175, 5, 255)', 'rgb(255, 5, 141)', 'rgb(255, 5, 20)']
    }
    generateGrid()
    changeSnakeColor()
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
    const currentLeft = parseInt(window.getComputedStyle(settingsPage).left);
    const newLeft = currentLeft === -600 ? 0 : -600
    settingsPage.style.left = `${newLeft}px`;
}

function turnSettingIcon() {
    transform(180)
}

function turnBackSettingIcon() {
    transform(0)
}

function transform(deg) {
    const settingIcon = document.querySelector('i')
    settingIcon.style.mozTransform = 'rotate('+deg+'deg)'; 
    settingIcon.style.msTransform = 'rotate('+deg+'deg)'; 
    settingIcon.style.oTransform = 'rotate('+deg+'deg)'; 
    settingIcon.style.transform = 'rotate('+deg+'deg)'; 
}

const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

let database

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
            connectDB(); // You may not need to call connectDB again in this case
        }
    });
}

connectDB()
.then(db => {
    database = db
    getRecordFromTheDatabase()
    //addRecordToTheDatabase()
})
.catch(error => {
    console.error('error getting database: ', error)
})

function addRecordToTheDatabase() {

    const transaction = database.transaction("snake settings", "readwrite");

    const snakeSettings = transaction.objectStore("snake settings"); // (2)

    const settings = {
        key : 1,
        baseSnakeSize : 20,
        fieldSize : 25,
        speed : 50,
        initialSize : 3,
        colorMode : 'dark'
    }

    const request = snakeSettings.put(settings)

    request.onsuccess = function() {
        console.log("New settings added", request.result);
    };
    
    request.onerror = function() {
        console.log("Error adding settings", request.error);
    };
}

function getRecordFromTheDatabase() {
    const transaction = database.transaction("snake settings", "readonly"); 
    const snakeSettings = transaction.objectStore("snake settings"); // (2)
    const request = snakeSettings.get(1)
    request.onsuccess = function() {
        console.log("Get settings", request.result);
    };
    request.onerror = function() {
        console.log("Error gettings settings", request.error);
    };
}

function toggleColor() {
    const circle = document.querySelector('.sircle')
    if (colorMode === 'dark') {
        circle.style.transform = "translateX(30px)"
        setColorMode('light')
        colorMode = 'light'
    } else {
        circle.style.transform = "translateX(0px)"
        setColorMode('dark')
        colorMode = 'dark'
    }
}

setColorMode(colorMode)
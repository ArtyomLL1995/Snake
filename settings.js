const fieldSize = 20
const baseSnakeSize = 20
const speed = 50
const initialSize = 3

let bestResultColor
let gridBorder
let snakeBorder
let colors = []
let snakeColor
const container = document.getElementById("container")
//const countContainer = document.getElementById("count")

const comingThroughWalls = true // if 'false' snake dies when hits the wall

function colorMode(color) {
    if (color === 'dark') {
        container.style.backgroundColor = '#181825'
        document.body.style.backgroundColor = '#222738'
        container.style.border = '1px solid rgba(236, 236, 236, 0.2)'
        //countContainer.style.color = 'white'
        bestResultColor = 'white'
        snakeColor = 'white'
        snakeBorder = '0.5px solid white'
        gridBorder = '0.5px solid rgba(236, 236, 236, 0.05)'
        colors = ['rgb(13, 219, 37)', 'rgb(251, 33, 3)', 'rgb(5, 255, 145)', 'rgb(5, 160, 255)', 'rgb(175, 5, 255)', 'rgb(255, 5, 141)', 'rgb(255, 5, 20)']
    } else if (color === 'light') {
        container.style.backgroundColor = '#f3f4f6' 
        document.body.style.backgroundColor = '#f9fafb'
        container.style.border = '1px solid lightgrey'
        //countContainer.style.color = 'black'
        bestResultColor = 'black'
        snakeColor = 'lightgreen'
        snakeBorder = '0.5px solid lightgreen'
        gridBorder = '0.5px solid rgba(211, 211, 211, 0.5)'
        colors = ['orange', 'rgb(251, 33, 3)', 'orangered', 'rgb(5, 160, 255)', 'rgb(175, 5, 255)', 'rgb(255, 5, 141)', 'rgb(255, 5, 20)']
    }
}
colorMode('dark')

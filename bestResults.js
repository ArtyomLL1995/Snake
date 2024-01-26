const bestResultContainer = document.getElementById('bestResults')
bestResultContainer.style.width = 150 + 'px'
bestResultContainer.style.position = 'absolute'
bestResultContainer.style.right = 15 + '%'
bestResultContainer.style.top = 25 + '%'
bestResultContainer.style.color = bestResultColor
let resultsList
const bestResults = []

function createBestResult(result) {
    const results = getBestResults()
    results.push(result)
    results.sort((a,b) => {
        return b-a
    }).splice(10)
    localStorage.setItem('bestSnakeResutls', JSON.stringify(results))
    resultsList.remove()
    resultsList = null
    displayResults()
}

function getBestResults() {
    const results = localStorage.getItem('bestSnakeResutls')
    if (results === null) {
        localStorage.setItem('bestSnakeResutls', JSON.stringify([]))
    }
    return JSON.parse(localStorage.getItem('bestSnakeResutls'))
}

function displayResults() {
    resultsList = document.createElement('div')
    bestResultContainer.append(resultsList)
    const results = getBestResults()
    results.forEach(result => {
        const resultDIV = document.createElement('div')
        resultDIV.innerHTML = result
        resultDIV.style.paddingTop = 5 + 'px'
        bestResults.push(resultDIV)
        resultsList.append(resultDIV)
    })
}

displayResults()
let resultsList
let bestResults = []
let bestResultsTable
const BEST_RESULTS = 'best results'
const BEST_RESULTS_CONTAINER = document.getElementById('best-results-container')

function createBestResult(result) {
    bestResults.push(result)
    bestResults.sort((a,b) => {
        return b-a
    }).splice(10)
    saveBestResult()
    //displayResults()
}

function connectBestResults() {
    connectDB(BEST_RESULTS)
    .then(db => {
        console.log('best results database: ', db)
        bestResultsTable = db
        getBestResultsFromTheDataBase()
    })
    .catch(error => {
        console.error('error getting best result: ', error)
    })
}

function getBestResultsFromTheDataBase() {
    const transaction = bestResultsTable.transaction(BEST_RESULTS, "readonly"); 
    const bestResultsTransation = transaction.objectStore(BEST_RESULTS)
    const request = bestResultsTransation.getAll()
    request.onsuccess = function() {
        bestResults = []
        bestResults = request.result.map(result => result.bestResult)
        displayResults()
    };
    request.onerror = function() {
        console.log("Error gettings best results", request.error);
    };
}

function saveBestResult() {

    const transaction = bestResultsTable.transaction(BEST_RESULTS, "readwrite")
    const bestResultsRecords = transaction.objectStore(BEST_RESULTS)

    for (let i = 0; i < bestResults.length; i++) {

        const bestResultObg = {
            key : i,
            bestResult : bestResults[i]
        }

        const request = bestResultsRecords.put(bestResultObg)

        request.onerror = function() {
            alert('Error saving best result')
        }
    }
}

function displayResults() {
    bestResults.forEach(bestResult => {
        const resultDiv = document.createElement('div')
        resultDiv.textContent = bestResult
        BEST_RESULTS_CONTAINER.appendChild(resultDiv)
    })
}

connectBestResults()
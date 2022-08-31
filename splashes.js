const duration = 500
const splashes = []
const splashesMap = new Map()
const splashesAmount = 15

let startAnimations = null

function runSplashes(t,l) {
    generateSplashes(t,l)
    requestAnimationFrame(function measure(time) {
        if (!startAnimations) startAnimations = time
        const progress = (time - startAnimations) / duration
        splashes.forEach(splash => {
            const translateLeft = easeLinear(time - startAnimations, 0, 1, 500) * splashesMap.get(splash).left
            const translateTop = easeInCubic(time - startAnimations, 0, 1, 500) * splashesMap.get(splash).top
            const left = l + translateLeft
            const top = t + translateTop
            splash.style.top = top + 'px'
            splash.style.left = left + 'px'
        })
        if (progress < 1) requestAnimationFrame(measure)
        else {
            splashes.forEach(splash => {
                splash.remove()
            })
            splashes.length = 0
            splashesMap.clear()
        }
    })
    startAnimations = null
}

function generateSplashes(t,l) {
    for (i = 0; i < splashesAmount; i++) {
        const splash = document.createElement('div')
        const size = generateRandom(3, 5)
        splash.style.width = size + 'px'
        splash.style.height = size + 'px'
        splash.style.top = t + 'px'
        splash.style.left = l + 'px'
        splash.style.position = 'absolute'
        splash.style.borderRadius = 50 + '%'
        splash.style.backgroundColor = foodColor
        splashes.push(splash)
        cont.append(splash)
        splashesMap.set(splash, {left: generateRandom(-70, 70), top: generateRandom(10, 150)})
    }
}

function easeLinear (t, b, c, d) {
    return c * t / d + b;
}

function easeInCubic (t, b, c, d) {
    return c * (t /= d) * t * t + b;
}

function generateRandom(min, max) {
    let difference = max - min
    let rand = Math.random()
    rand = Math.floor(rand * difference)
    rand = rand + min
    return rand
}

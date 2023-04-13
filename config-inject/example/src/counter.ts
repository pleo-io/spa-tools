import config from './config'

export function setupCounter(element: HTMLButtonElement) {
    let counter = 0
    const setCounter = (count: number) => {
        counter = count
        element.innerHTML = `count is ${counter} and env is ${config.env}, nested boi: ${config.nested.boi}`
    }
    element.addEventListener('click', () => setCounter(counter + 1))
    setCounter(0)
}

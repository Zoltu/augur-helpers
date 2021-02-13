import * as preact from 'preact'
import { App } from './components/App'

// find the HTML element we will attach to
const main = document.querySelector('main')!

// specify our render function, which will be fired anytime rootModel is mutated
function render() {
	const element = preact.createElement(App, {})
	preact.render(element, document.body, main)
}

// kick off the initial render
render()

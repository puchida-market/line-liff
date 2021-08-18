import { StrictMode } from 'react'
import { hydrate, render } from 'react-dom'
import './tailwind.css'
import App from './App'
import { HelmetProvider } from 'react-helmet-async'

const tree = (
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
)

const root = document.getElementById('root')

if (process.env.NODE_ENV === 'development') {
  render(tree, root)
} else {
  hydrate(tree, root)
}

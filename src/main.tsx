import { StrictMode, Suspense } from 'react'
import { hydrate, render } from 'react-dom'
import './tailwind.css'
import App from './App'
import LoadingIndicator from './components/LoadingIndicator'
import { HelmetProvider } from 'react-helmet-async'

const appComponent: JSX.Element = (
  <StrictMode>
    <HelmetProvider>
      <Suspense fallback={<LoadingIndicator />}>
        <App />
      </Suspense>
    </HelmetProvider>
  </StrictMode>
)

const rootElement = document.getElementById('root')
rootElement?.hasChildNodes() ? hydrate(appComponent, rootElement) : render(appComponent, rootElement as HTMLElement)

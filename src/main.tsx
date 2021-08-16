import React from 'react'
import { hydrate, render } from 'react-dom'
import './tailwind.css'
import App from './App'
import LoadingIndicator from './components/LoadingIndicator'
import { HelmetProvider } from 'react-helmet-async'

const appComponent: JSX.Element = (
  <React.StrictMode>
    <HelmetProvider>
      <React.Suspense fallback={<LoadingIndicator />}>
        <App />
      </React.Suspense>
    </HelmetProvider>
  </React.StrictMode>
)

const rootElement = document.getElementById('root')
rootElement?.hasChildNodes() ? hydrate(appComponent, rootElement) : render(appComponent, rootElement as HTMLElement)

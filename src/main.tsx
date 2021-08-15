import React from 'react'
import ReactDOM from 'react-dom'
import './tailwind.css'
import App from './App'
import LoadingIndicator from './components/LoadingIndicator'

ReactDOM.render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingIndicator />}>
      <App />
    </React.Suspense>
  </React.StrictMode>,
  document.getElementById('root')
)

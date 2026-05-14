import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { InterviewPrepProvider } from './context/InterviewPrepContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <InterviewPrepProvider>
        <App />
      </InterviewPrepProvider>
    </BrowserRouter>
  </StrictMode>,
)

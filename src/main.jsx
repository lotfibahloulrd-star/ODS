import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { orderService } from './services/orderService'

// Nettoyage agressif du LocalStorage au démarrage pour libérer le quota
orderService._cleanupLegacyStorage();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

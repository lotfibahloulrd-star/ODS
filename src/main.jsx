import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { orderService } from './services/orderService'

// --- ErrorBoundary global ---
// Empeche l ecran blanc en cas d erreur JavaScript non geree dans React.
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error('[ErrorBoundary] Erreur capturee:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return React.createElement('div', {
                style: {
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '100vh', background: '#f8fafc',
                    fontFamily: 'Inter, sans-serif', padding: '2rem'
                }
            },
                React.createElement('div', {
                    style: {
                        background: 'white', borderRadius: '1.5rem', padding: '2.5rem',
                        boxShadow: '0 4px 32px rgba(0,0,0,0.08)', maxWidth: '480px', textAlign: 'center'
                    }
                },
                    React.createElement('div', { style: { fontSize: '3rem', marginBottom: '1rem' } }, 'u26A0uFE0F'),
                    React.createElement('h2', { style: { fontWeight: '800', fontSize: '1.3rem', marginBottom: '0.5rem', color: '#1e293b' } }, 'Une erreur s est produite'),
                    React.createElement('p', { style: { color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' } },
                        String((this.state.error && this.state.error.message) || 'Erreur inconnue')
                    ),
                    React.createElement('button', {
                        onClick: () => { this.setState({ hasError: false, error: null }); window.location.reload(); },
                        style: { background: '#1e293b', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 2rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }
                    }, 'Recharger l application')
                )
            );
        }
        return this.props.children;
    }
}

// Nettoyage agressif du LocalStorage au demarrage pour liberer le quota
orderService._cleanupLegacyStorage();

ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(React.StrictMode, null,
        React.createElement(ErrorBoundary, null,
            React.createElement(App, null)
        )
    )
)

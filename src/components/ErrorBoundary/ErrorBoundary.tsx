import React from 'react';
import './ErrorBoundary.css';

/**
 * ErrorBoundary Component
 * Captures React errors and prevents full app crash
 * Provides fallback UI and error recovery options
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log l'erreur
    this.setState((prev) => ({
      error,
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    // Log pour debug
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught:', error, errorInfo);
    }

    // TODO: Envoyer à Sentry ou similaire
    // Sentry.captureException(error, { contexts: { react: errorInfo } });

    // Éviter la boucle infinie si trop d'erreurs
    if (this.state.errorCount > 5) {
      console.error('Too many errors, reloading page...');
      setTimeout(() => window.location.reload(), 3000);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-content">
            <h1 className="error-title">😢 Oups!</h1>
            <p className="error-message">
              Quelque chose s&apos;est mal passé. Nous sommes désolés!
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Détails Techniques</summary>
                <pre>{this.state.error?.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-reset">
                Réessayer
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="btn-home"
              >
                Retour à l&apos;accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

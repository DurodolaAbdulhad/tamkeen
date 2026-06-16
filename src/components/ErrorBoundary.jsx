import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '32px 20px', fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 12, padding: 24 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 18, color: '#856404' }}>Something went wrong</h2>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: '#664d03' }}>
              The app encountered an error. Try refreshing the page.
            </p>
            <details style={{ marginTop: 12, fontSize: 12, color: '#6c757d' }}>
              <summary>Error details</summary>
              <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {this.state.error?.message}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 16, background: '#1B4332', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}
            >
              Reload App
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

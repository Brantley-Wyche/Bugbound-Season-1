import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  retry() {
    if (this.state.error) this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="demo-crash">
          {/* Announced, so reproducing the crash is not a sight-only step. */}
          <div role="alert">
            <strong>The component crashed</strong>
            <pre>{String(this.state.error?.message || this.state.error)}</pre>
          </div>
          <p className="demo-crash-note">Saving the source retries on its own.</p>
          <button className="btn" onClick={() => this.retry()}>
            Retry now
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

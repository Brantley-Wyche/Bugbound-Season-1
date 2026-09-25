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
          <strong>The component crashed</strong>
          <pre>{String(this.state.error?.message || this.state.error)}</pre>
          <button className="btn" onClick={() => this.retry()}>
            Retry after editing
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

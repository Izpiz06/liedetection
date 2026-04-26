import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 bg-neo-red border-4 border-neo-text rounded-lg flex items-center justify-center shadow-neo">
            <AlertTriangle size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-black">Something went wrong</h2>
          <p className="text-sm opacity-60 max-w-md text-center">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="neo-btn-yellow"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

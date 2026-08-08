import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <div className="w-full max-w-md text-center">
            <div className="mb-6">
              <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Something went wrong
              </h1>
              <p className="mb-4 text-gray-600">
                We encountered an unexpected error. Please try refreshing the
                page.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4 rounded bg-gray-100 p-4 text-left">
                  <summary className="cursor-pointer font-medium">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-sm whitespace-pre-wrap text-red-600">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

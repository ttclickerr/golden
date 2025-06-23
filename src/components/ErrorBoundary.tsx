import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { VersionInfo } from './VersionInfo';
import { trackAnalyticsEvent } from '../lib/trackAnalyticsEvent';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('Uncaught error:', error, errorInfo);
    try {
      trackAnalyticsEvent({
        event: 'error',
        errorCode: error.name,
        errorMessage: error.message,
        stack: error.stack,
        errorInfo: errorInfo?.componentStack || ''
      });
    } catch (e) {
      console.error('Failed to track error:', e);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-gray-800/50 rounded-lg p-6 border border-red-500/30">
            <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <div className="bg-gray-900/50 p-4 rounded mb-4 overflow-auto max-h-40 text-sm text-gray-300">
              {this.state.error && this.state.error.toString()}
            </div>
            <div className="flex justify-between items-center mt-6">
              <VersionInfo />
              <Button 
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-600"
              >
                Reload App
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
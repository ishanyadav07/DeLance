import * as React from 'react';
import { GlassCard } from './ui/GlassCard';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      
      try {
        // Check if it's a Firestore JSON error
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Database error during ${parsed.operationType}. You might not have permission to perform this action.`;
          }
        }
      } catch (e) {
        // Not a JSON error, use default or error message
        if (this.state.error?.message && !this.state.error.message.includes('JSON')) {
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full p-8 text-center space-y-6 border-error/20">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="text-error w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-headline font-bold">Something went wrong</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2 w-full py-3 bg-surface-container hover:bg-surface-container-high rounded-xl text-sm font-bold transition-colors"
            >
              <RefreshCcw size={16} />
              Try Again
            </button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

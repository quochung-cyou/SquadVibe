import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6 text-center">
          <div className="bg-destructive/10 p-4 rounded-full mb-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground text-sm max-w-xs mb-6 break-words">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button 
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={16} />
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
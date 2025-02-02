import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    // Clear any potentially corrupted state
    try {
      const keysToPreserve = ['pos-employees']; // Keep essential data
      const preservedData: Record<string, string> = {};

      keysToPreserve.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) preservedData[key] = value;
      });

      localStorage.clear();

      Object.entries(preservedData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }

    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-xl font-bold text-gray-900">Terjadi Kesalahan</h1>
            <p className="mt-2 text-gray-600">
              Maaf, terjadi kesalahan yang tidak terduga. Silakan muat ulang aplikasi.
            </p>
            {this.state.error && (
              <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw size={18} />
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main
          className="flex min-h-screen flex-col items-center justify-center
                     bg-gray-50 px-6 text-center"
          role="alert"
        >
          <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center
                         rounded-full bg-red-100 text-3xl"
              aria-hidden="true"
            >
              !
            </div>

            <p className="mt-5 text-sm font-bold uppercase tracking-wider text-red-600">
              Error 500
            </p>

            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              Something went wrong
            </h1>

            <p className="mt-3 text-gray-600">
              Sorry! An unexpected error occurred. Please try again.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={this.handleRetry}
                className="rounded-lg bg-green-700 px-5 py-3 font-semibold
                           text-white hover:bg-green-800
                           focus:outline-none focus:ring-2
                           focus:ring-green-600 focus:ring-offset-2"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() => window.location.assign("/")}
                className="rounded-lg border border-gray-300 px-5 py-3
                           font-semibold text-gray-700 hover:bg-gray-100
                           focus:outline-none focus:ring-2
                           focus:ring-green-600 focus:ring-offset-2"
              >
                Back to Home
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

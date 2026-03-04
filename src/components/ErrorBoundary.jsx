import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center px-4">
          <div className="max-w-md text-center rounded-xl border border-[#E7DBC2] bg-white p-6">
            <h2 className="text-lg font-semibold text-[#3E2723]">Something went wrong</h2>
            <p className="mt-2 text-sm text-[#7A6A4D]">
              We could not load this section. Please refresh and try again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

// Higher-order component to wrap pages with error boundaries
const WithErrorBoundary = (Component: React.ComponentType<any>, options = {}) => {
  const { fallback, onError } = options;
  
  return (props: any) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

export default WithErrorBoundary;
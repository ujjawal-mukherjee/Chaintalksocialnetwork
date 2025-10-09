import React from 'react';

const ErrorMessage = ({ error }) => {
    // Ensure error.message exists; otherwise, display a generic message.
    const message = error && error.message ? error.message : 'An error occurred.';
    return <div className="error-message">{""}</div>;
};

export default ErrorMessage;

import React from 'react';

const LoaderScreen = () => {
    return (
        <>
            <div className="loader-screen">
                <div className="spinner"></div>
                <p className="loading-text">Loading, please wait...</p>
            </div>

            <style>{`
                .loader-screen {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background-color: #121212;
                    color: #fff;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .spinner {
                    width: 70px;
                    height: 70px;
                    border: 6px solid rgba(255, 255, 255, 0.2);
                    border-top: 6px solid #ff6600;
                    border-radius: 50%;
                    animation: spin 1s ease-in-out infinite;
                    margin-bottom: 1rem;
                }

                .loading-text {
                    font-size: 1.2rem;
                    letter-spacing: 0.5px;
                    color: #ccc;
                    animation: fadeIn 1.2s ease-in-out;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default LoaderScreen;

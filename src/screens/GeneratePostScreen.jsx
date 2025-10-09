import React, { useState } from 'react';
import { FaHistory, FaMagic, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import '../Components/Global.css';
import { useNavigation } from '@react-navigation/native';

const GeneratePostScreen = () => {
    const navigation = useNavigation();
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [history, setHistory] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);

        try {
            const res = await axios.post("http://localhost:8000/generate", { prompt });
            const newEntry = { prompt, response: res.data.response };
            setResponse(res.data.response);
            setHistory(prev => [...prev, newEntry]);
            setActiveIndex(history.length);
            setPrompt("");
        } catch (error) {
            console.error("Error generating post:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="generate-post-container">
            {/* Header with Back Button */}
            <div className="generate-post-header">
                <button
                    className="back-button"
                    onClick={() => navigation.goBack()}
                >
                    <FaArrowLeft className="back-icon" />
                    Back
                </button>
            </div>

            {/* Sidebar */}
            <div className="generate-post-sidebar">
                <div className="sidebar-header">
                    <FaHistory className="sidebar-icon" />
                    <h3>History</h3>
                </div>
                <div className="history-list">
                    {history.map((item, index) => (
                        <div
                            key={index}
                            className={`history-item ${index === activeIndex ? 'active' : ''}`}
                            onClick={() => {
                                setResponse(item.response);
                                setActiveIndex(index);
                            }}
                        >
                            <p className="history-text">
                                {item.prompt.length > 30 ? item.prompt.slice(0, 30) + '...' : item.prompt}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="generate-post-main">
                <h2 className="generate-post-title">Post Generator</h2>

                <div className="generate-post-input-container">
                    <textarea
                        className="generate-post-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your topic..."
                        rows={4}
                    />
                    <button
                        className={`generate-post-button ${isLoading ? 'loading' : ''}`}
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className="spinner" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FaMagic className="button-icon" />
                                Generate Post
                            </>
                        )}
                    </button>
                </div>

                {response && (
                    <div className="generate-post-response">
                        <h3 className="response-title">
                            <FaMagic className="response-icon" />
                            Generated Post
                        </h3>
                        <div className="response-content">
                            {response.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .generate-post-container {
                    display: flex;
                    height: 100vh; /* Full viewport height */
                    background-color: #121212;
                    color: #fff;
                    position: relative;
                    overflow: hidden; /* Prevent container overflow */
                }

                .generate-post-header {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    z-index: 10;
                }

                .back-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background-color: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .back-button:hover {
                    background-color: #2a2a2a;
                    border-color: #4f8cff;
                }

                .back-icon {
                    font-size: 0.9rem;
                }

                .generate-post-sidebar {
                    width: 280px;
                    background-color: #1a1a1a;
                    border-right: 1px solid #333;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    height: 100%; /* Full height of container */
                    margin-top: 60px;
                    overflow: hidden; /* Prevent sidebar overflow */
                }

                .sidebar-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .sidebar-icon {
                    color: #4f8cff;
                    font-size: 1.2rem;
                }

                .history-list {
                    flex: 1;
                    overflow-y: auto; /* Enable vertical scrolling */
                    -webkit-overflow-scrolling: touch; /* Smooth scrolling on touch devices */
                    scrollbar-width: thin; /* Firefox */
                    scrollbar-color: #4f8cff #2a2a2a; /* Firefox */
                }

                .history-list::-webkit-scrollbar {
                    width: 8px; /* Chrome/Safari */
                }

                .history-list::-webkit-scrollbar-track {
                    background: #2a2a2a; /* Track color */
                }

                .history-list::-webkit-scrollbar-thumb {
                    background: #4f8cff; /* Thumb color */
                    border-radius: 4px;
                }

                .history-item {
                    padding: 12px;
                    margin-bottom: 8px;
                    background-color: #2a2a2a;
                    border-radius: 8px;
                    border: 1px solid #333;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .history-item:hover {
                    background-color: #333;
                }

                .history-item.active {
                    background-color: #4f8cff;
                    border-color: #4f8cff;
                }

                .generate-post-main {
                    flex: 1;
                    padding: 30px;
                    max-width: 800px;
                    margin: 0 auto;
                    margin-top: 60px;
                    overflow-y: auto; /* Allow scrolling in main content if needed */
                }

                .generate-post-title {
                    font-size: 2rem;
                    color: #fff;
                    margin-bottom: 30px;
                    background: linear-gradient(90deg, #4f8cff, #6ba4ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .generate-post-input-container {
                    margin-bottom: 30px;
                }

                .generate-post-input {
                    width: 100%;
                    min-height: 120px;
                    padding: 16px;
                    background-color: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    font-size: 1rem;
                    color: #fff;
                    margin-bottom: 16px;
                    resize: vertical;
                }

                .generate-post-input:focus {
                    outline: none;
                    border-color: #4f8cff;
                }

                .generate-post-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(90deg, #4f8cff, #6ba4ff);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .generate-post-button:hover {
                    background: linear-gradient(90deg, #3b7de3, #5a93ff);
                }

                .generate-post-button.loading {
                    background: #333;
                    cursor: not-allowed;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .generate-post-response {
                    background-color: #1a1a1a;
                    border-radius: 8px;
                    padding: 24px;
                    border: 1px solid #333;
                }

                .response-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #fff;
                    margin-bottom: 16px;
                }

                .response-icon {
                    color: #4f8cff;
                }

                .response-content {
                    color: #ddd;
                    line-height: 1.6;
                }
            `}</style>
        </div>
    );
};

export default GeneratePostScreen;
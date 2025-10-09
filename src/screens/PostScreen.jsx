import React, { useState, useEffect, useContext } from "react";
import { chatAppContext } from "../Context/ChatAppContext";
import { FaRegThumbsUp, FaRegCommentDots, FaUserCircle } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const PostScreen = ({ post }) => {
    const { currentUserAddress, likePost, commentOnPost } = useContext(chatAppContext);
    const [commentText, setCommentText] = useState("");
    const [imageUrl, setImageUrl] = useState("https://placehold.co/300x200"); // Fallback image
    const [isLiked, setIsLiked] = useState(false);

    const getRawHash = (imageHash) => {
        if (!imageHash) return null;
        // Handle full URLs like https:/gateway.pinata.cloud/ipfs/<hash> or https://gateway.pinata.cloud/ipfs/<hash>
        const match = imageHash.match(/ipfs\/(Qm[1-9A-Za-z]{44})/);
        return match ? match[1] : imageHash; // Return raw hash or original if no match
    };

    // Fetch image URL from JSON or use direct image URL
    useEffect(() => {
        const fetchImageData = async () => {
            if (!post.imageHash) {
                console.log("No imageHash provided for post:", post);
                return;
            }

            const rawHash = getRawHash(post.imageHash);
            console.log("Raw imageHash:", rawHash, "Original imageHash:", post.imageHash);

            // Try fetching JSON first
            try {
                console.log("Fetching JSON from:", `https://gateway.pinata.cloud/ipfs/${rawHash}`);
                const response = await fetch(`https://gateway.pinata.cloud/ipfs/${rawHash}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Fetched JSON data:", data);
                    setImageUrl(data.image || data.imageUrl || "https://placehold.co/300x200");
                    return;
                } else {
                    console.error("Failed to fetch JSON:", response.status, response.statusText);
                }
            } catch (error) {
                console.error("Error fetching JSON:", error);
            }

            // If JSON fetch fails, try using imageHash as direct image URL
            console.log("Attempting direct image URL:", post.imageHash);
            setImageUrl(post.imageHash);
        };

        fetchImageData();
    }, [post.imageHash]);

    const handleLike = () => {
        likePost(post.owner, post.id);
    };

    const handleComment = () => {
        if (commentText.trim() === "") return;
        commentOnPost(post.owner, post.id, commentText);
        setCommentText("");
    };

    return (
        <div className="post-card modern-friend-post">
            {/* Post header with avatar, username, and timestamp */}
            <div className="post-header">
                <div className="avatar">
                    <FaUserCircle size={40} color="#4f8cff" />
                </div>
                <div className="post-header-info">
                    <strong className="post-username">{post.owner}</strong>
                    <span className="post-timestamp">{post.timestamp ? formatDistanceToNow(new Date(Number(post.timestamp) * 1000), { addSuffix: true }) : ''}</span>
                </div>
            </div>

            {/* Post content */}
            <p className="post-content modern-content">{post.content}</p>

            {/* Post image if available */}
            {post.imageHash && (
                <img
                    className="post-image-modern"
                    src={imageUrl}
                    alt="Post"
                    onError={(e) => {
                        e.target.src = "https://placehold.co/300x200";
                    }}
                />
            )}

            {/* Likes and comments count */}
            <div className="post-stats modern-stats">
                <div className="post-likes pill">
                    <FaRegThumbsUp size={16} style={{ marginRight: 4 }} />
                    <span>{post.likes.length}</span>
                </div>
                <div className="post-comments-count pill">
                    <FaRegCommentDots size={16} style={{ marginRight: 4 }} />
                    <span>{post.comments.length}</span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="post-actions modern-actions">
                <button
                    onClick={handleLike}
                    className={`like-button ${isLiked ? 'active' : ''}`}
                    aria-label="Like post"
                >
                    <FaRegThumbsUp size={16} /> Like
                </button>
                <button className="comment-button" aria-label="Comment on post">
                    <FaRegCommentDots size={16} /> Comment
                </button>
            </div>

            {/* Comment input */}
            <div className="comment-input-container modern-comment-input">
                <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    aria-label="Comment input"
                />
                <button
                    onClick={handleComment}
                    disabled={commentText.trim() === ""}
                    aria-label="Submit comment"
                >
                    Post
                </button>
            </div>

            {/* Comments section */}
            <div className="comments-section modern-comments">
                <h4>Comments</h4>
                {post.comments.map((comment, index) => (
                    <div className="comment modern-comment" key={index}>
                        <FaUserCircle size={24} color="#aaa" style={{ marginRight: 8 }} />
                        <div>
                            <strong>{comment.commenter}</strong>
                            <span className="comment-text"> {comment.commentText}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostScreen;
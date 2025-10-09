import React from "react";
import Post from "./PostScreen";

const PostListScreen = ({ posts }) => {
    return (
        <div className="post-list">
            {posts.map((post, index) => (
                <Post key={index} post={post} />
            ))}
        </div>
    );
};

export default PostListScreen;
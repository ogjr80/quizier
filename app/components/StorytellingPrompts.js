import React, { useState } from 'react';

const StorytellingPrompts = ({ card, onAnswer }) => {
  const [storyResponse, setStoryResponse] = useState('');

  return (
    <>
      <p className="text-xl mb-8 text-white">{card.content}</p>
      <textarea
        className="w-full p-4 rounded text-gray-800 mb-4"
        rows="6"
        value={storyResponse}
        onChange={(e) => setStoryResponse(e.target.value)}
        placeholder="Type your story here..."
      />
      <button
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={() => onAnswer(storyResponse)}
      >
        Submit
      </button>
    </>
  );
};

export default StorytellingPrompts;

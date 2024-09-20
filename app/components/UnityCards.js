import React from 'react';

const UnityCards = ({ card, onAnswer }) => {
  return (
    <>
      <p className="text-xl mb-8 text-white">{card.content}</p>
      <button
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={() => onAnswer('use')}
      >
        Use Card
      </button>
    </>
  );
};

export default UnityCards;

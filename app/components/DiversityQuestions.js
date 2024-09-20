import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const DiversityQuestions = ({ card, onAnswer, timeLeft, answered, difficulty }) => {
  const getQuestionTime = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 45;
      case 'hard': return 20;
      default: return 30;
    }
  };

  const progress = (timeLeft / getQuestionTime(difficulty)) * 100;

  return (
    <>
      <p className="text-xl mb-8 text-white flex-grow">{card.content}</p>
      <div className="space-y-4 mb-8">
        {card.options.map((option, index) => (
          <button
            key={index}
            className={`w-full p-4 text-left rounded transition-colors duration-200 text-lg ${
              answered
                ? option === card.answer
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => onAnswer(option)}
            disabled={answered}
          >
            {option}
            {answered && option === card.answer && <CheckCircle className="inline-block ml-2" />}
            {answered && option !== card.answer && <XCircle className="inline-block ml-2" />}
          </button>
        ))}
      </div>
      <div className="mt-auto">
        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-linear" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-2 text-right text-xl font-bold text-white">
          Time left: {timeLeft}s
        </div>
      </div>
    </>
  );
};

export default DiversityQuestions;

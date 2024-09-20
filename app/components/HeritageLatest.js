'use client'; 
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trophy, Clock, Users, MessageCircle, Lightbulb, Zap, Star, Sun, Moon, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import DiversityQuestions from './DiversityQuestions';
import StorytellingPrompts from './StorytellingPrompts';
import ChallengeCards from './ChallengeCards';
import UnityCards from './UnityCards';
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { colorPalette, getCategoryColor } from '../utils/colorPalette';

import diversityQuestionsData from '../data/diversityQuestions.json';
import storytellingPromptsData from '../data/storytellingPrompts.json';
import challengeCardsData from '../data/challengeCards.json';
import unityCardsData from '../data/unityCards.json';

const ThemeContext = createContext({ darkMode: false, colorPalette });

const categories = [
  { name: 'Diversity Questions', icon: <Users className="w-6 h-6" /> },
  { name: 'Storytelling Prompts', icon: <MessageCircle className="w-6 h-6" /> },
  { name: 'Challenge Cards', icon: <Lightbulb className="w-6 h-6" /> },
  { name: 'Unity Cards', icon: <Zap className="w-6 h-6" /> },
];

const cards = [
  ...diversityQuestionsData.map(card => ({ ...card, category: 'Diversity Questions' })),
  ...storytellingPromptsData.map(card => ({ ...card, category: 'Storytelling Prompts' })),
  ...challengeCardsData.map(card => ({ ...card, category: 'Challenge Cards' })),
  ...unityCardsData.map(card => ({ ...card, category: 'Unity Cards' })),
];

const CardDeck = ({ cards, onCardClick }) => {
  const { darkMode, colorPalette } = useContext(ThemeContext);
  return (
    <div className="relative w-64 h-96">
      {cards.map((card, index) => (
        <Card 
          key={card.id} 
          className="absolute w-full h-full shadow-lg transition-all duration-300 ease-in-out cursor-pointer hover:shadow-xl transform hover:-translate-y-2"
          style={{
            transform: `translateY(${index * 10}px) rotate(${Math.random() * 10 - 5}deg)`,
            zIndex: cards.length - index,
          }}
          onClick={() => onCardClick(card)}
        >
          <CardContent className={`p-4 h-full flex flex-col justify-between ${darkMode ? 'text-white bg-gray-800' : 'text-black bg-white'}`} style={{ backgroundColor: getCategoryColor(card.category, darkMode) }}>
            <div className="text-lg font-bold mb-2">{card.category}</div>
            <div className="text-sm">{card.content.substring(0, 50)}...</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const QuestionCard = ({ card, onAnswer, timeLeft, answered, onClose }) => {
  const { darkMode } = useContext(ThemeContext);

  const renderCardContent = () => {
    switch (card.category) {
      case 'Diversity Questions':
        return <DiversityQuestions card={card} onAnswer={onAnswer} timeLeft={timeLeft} answered={answered} />;
      case 'Storytelling Prompts':
        return <StorytellingPrompts card={card} onAnswer={onAnswer} />;
      case 'Challenge Cards':
        return <ChallengeCards card={card} onAnswer={onAnswer} />;
      case 'Unity Cards':
        return <UnityCards card={card} onAnswer={onAnswer} />;
      default:
        return null;
    }
  };

  return (
    <div className={`relative p-8 rounded-lg shadow-xl w-full h-full flex flex-col`} style={{ backgroundColor: getCategoryColor(card.category, darkMode) }}>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-3xl font-bold text-white">{card.category}</h2>
        <button onClick={onClose} className="text-white hover:text-gray-300">
          <X size={24} />
        </button>
      </div>
      {renderCardContent()}
    </div>
  );
};

const HeritageCardGame = () => {
  const { data: session, status } = useSession();
  const [darkMode, setDarkMode] = useState(false);
  const [shuffledCards, setShuffledCards] = useState(cards);
  const [score, setScore] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [gameTimeLeft, setGameTimeLeft] = useState(600);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [unityCards, setUnityCards] = useState([]);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [achievements, setAchievements] = useState([]);
  const [initialAchievements, setInitialAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const backgroundMusicRef = useRef(null);
  const cardClickSoundRef = useRef(null);
  const gameFinishSoundRef = useRef(null);
  const correctAnswerSoundRef = useRef(null);
  const incorrectAnswerSoundRef = useRef(null);

  useEffect(() => {
    shuffleCards();
    const gameTimer = setInterval(() => {
      setGameTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(gameTimer);
          setGameOver(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    backgroundMusicRef.current = new Audio('/sounds/background-music.mp3');
    cardClickSoundRef.current = new Audio('/sounds/card-click.mp3');
    gameFinishSoundRef.current = new Audio('/sounds/game-finish.mp3');
    correctAnswerSoundRef.current = new Audio('/sounds/correct-answer.mp3');
    incorrectAnswerSoundRef.current = new Audio('/sounds/incorrect-answer.mp3');

    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.play();

    return () => {
      clearInterval(gameTimer);
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    let timer;
    if (isDialogOpen && currentCard && currentCard.category === 'Diversity Questions') {
      setQuestionTimeLeft(getQuestionTime());
      setAnswered(false);
      timer = setInterval(() => {
        setQuestionTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isDialogOpen, currentCard, difficulty]);

  useEffect(() => {
    fetch('/api/highscores')
      .then(res => res.json())
      .then(data => setLeaderboard(data))
      .catch(error => {
        console.error('Error fetching highscores:', error);
        setLeaderboard([]);
      });
  }, [gameOver]);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/achievements?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          const achievementNames = data.map(achievement => achievement.name);
          setAchievements(achievementNames);
          setInitialAchievements(achievementNames);
        })
        .catch(error => {
          console.error('Error fetching achievements:', error);
        });
    }
  }, [session]);

  const getQuestionTime = () => {
    switch (difficulty) {
      case 'easy': return 45;
      case 'hard': return 20;
      default: return 30;
    }
  };

  const shuffleCards = () => {
    setShuffledCards([...cards].sort(() => Math.random() - 0.5));
  };

  const handleCardClick = (card) => {
    setCurrentCard(card);
    setIsDialogOpen(true);
    cardClickSoundRef.current.play();
  };

  const handleCardAction = (action) => {
    setAnswered(true);
    let pointsEarned = 0;
    let correct = false;
    switch (currentCard.category) {
      case 'Diversity Questions':
        correct = action === currentCard.answer;
        pointsEarned = correct ? getPointsForDifficulty() : 0;
        if (correct) {
          correctAnswerSoundRef.current.play();
        } else {
          incorrectAnswerSoundRef.current.play();
        }
        break;
      case 'Storytelling Prompts':
      case 'Challenge Cards':
        pointsEarned = getPointsForDifficulty();
        correct = true;
        correctAnswerSoundRef.current.play();
        break;
      case 'Unity Cards':
        if (action === 'use') {
          setUnityCards([...unityCards, currentCard]);
        }
        break;
    }

    if (correct) {
      setStreak(streak + 1);
      if (streak + 1 >= 3) {
        pointsEarned *= 2;
        triggerConfetti();
      }
    } else {
      setStreak(0);
    }

    setScore(score + pointsEarned);
    setTotalAnswered(totalAnswered + 1);

    checkAchievements(totalAnswered + 1, score + pointsEarned);

    if (totalAnswered + 1 === shuffledCards.length) {
      gameFinishSoundRef.current.play();
      saveGamePlay();
    }

    if (currentCard.category === 'Diversity Questions') {
      setTimeout(() => {
        setIsDialogOpen(false);
        setAnswered(false);
      }, 3000);
    } else {
      setIsDialogOpen(false);
      setAnswered(false);
    }
  };

  const getPointsForDifficulty = () => {
    switch (difficulty) {
      case 'easy': return 5;
      case 'hard': return 15;
      default: return 10;
    }
  };

  const handleTimeout = () => {
    setStreak(0);
    setIsDialogOpen(false);
    setAnswered(false);
    setTotalAnswered(totalAnswered + 1);
    incorrectAnswerSoundRef.current.play();
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const restartGame = () => {
    saveGamePlay();
    setScore(0);
    setGameTimeLeft(600);
    setGameOver(false);
    setUnityCards([]);
    setStreak(0);
    setTotalAnswered(0);
    setAchievements([]);
    shuffleCards();
  };

  const handleCloseQuestion = () => {
    setIsDialogOpen(false);
  };

  const checkAchievements = (answeredCount, newScore) => {
    const newAchievements = [...achievements];
    if (answeredCount === 10 && !achievements.includes('Quick Learner')) {
      newAchievements.push('Quick Learner');
      saveAchievement('Quick Learner');
    }
    if (newScore >= 100 && !achievements.includes('Century Scorer')) {
      newAchievements.push('Century Scorer');
      saveAchievement('Century Scorer');
    }
    if (streak === 5 && !achievements.includes('Streak Master')) {
      newAchievements.push('Streak Master');
      saveAchievement('Streak Master');
    }
    setAchievements(newAchievements);
  };

  const saveGamePlay = async () => {
    if (session?.user?.id) {
      const newAchievements = achievements.filter(achievement => !initialAchievements.includes(achievement));
      await fetch('/api/gameplay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          score,
          difficulty,
          totalAnswered,
          achievements: newAchievements,
        }),
      });
    }
  };

  const saveAchievement = async (achievementName) => {
    if (session?.user?.id) {
      try {
        const response = await fetch('/api/achievements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            achievement: achievementName,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to save achievement');
        }
        const data = await response.json();
        console.log('Achievement saved:', data);
      } catch (error) {
        console.error('Error saving achievement:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, colorPalette }}>
      <div className="min-h-screen p-8 bg-sa-flag bg-cover bg-center bg-fixed">
        <div className="container mx-auto bg-black bg-opacity-50 p-8 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-white">Unity in Diversity: iOCO Heritage Day Game</h1>
            <div className='flex items-center space-x-4'>
              {status === "authenticated" ? (
                <div className="flex items-center space-x-2">
                  <span className="text-white">{session.user.name}</span>
                  <Button onClick={() => signOut()} variant="outline">Sign Out</Button>
                </div>
              ) : (
                <Button onClick={() => signIn()} variant="outline">Sign In</Button>
              )}
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full" style={{ backgroundColor: darkMode ? colorPalette.yellow : colorPalette.black }}>
                {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-800" />}
              </button>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="p-2 rounded-md" style={{ backgroundColor: darkMode ? colorPalette.black : colorPalette.white, color: darkMode ? colorPalette.white : colorPalette.black }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center mb-8">
            <button onClick={shuffleCards} className={`px-6 py-3 rounded-full transition-colors duration-300 font-bold`} style={{ backgroundColor: darkMode ? colorPalette.yellow : colorPalette.green, color: darkMode ? colorPalette.black : colorPalette.white }}>
              Shuffle Cards
            </button>
            <div className="text-2xl font-bold flex items-center space-x-4 text-white">
              <div className="flex items-center">
                <Trophy className="mr-2" /> {score}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2" /> {Math.floor(gameTimeLeft / 60)}:{(gameTimeLeft % 60).toString().padStart(2, '0')}
              </div>
              <div className="flex items-center">
                <Star className="mr-2" /> Streak: {streak}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map(category => (
              <div key={category.name} className={`rounded-lg p-6 shadow-lg transform transition-all duration-300 hover:scale-105`} style={{ backgroundColor: getCategoryColor(category.name, darkMode) }}>
                <div className="flex items-center justify-center mb-6">
                  <div className={`w-10 h-10 flex items-center justify-center mr-2`} style={{ color: darkMode ? colorPalette.white : colorPalette.black }}>
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-semibold text-white">{category.name}</h2>
                </div>
                <CardDeck 
                  cards={shuffledCards.filter(card => card.category === category.name)} 
                  onCardClick={handleCardClick}
                />
              </div>
            ))}
          </div>
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4" style={{ color: darkMode ? colorPalette.white : colorPalette.black }}>Achievements</h3>
            <div className="flex flex-wrap gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="px-4 py-2 rounded-full" style={{ backgroundColor: colorPalette.yellow, color: colorPalette.black }}>
                  {achievement}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4" style={{ color: darkMode ? colorPalette.white : colorPalette.black }}>Leaderboard</h3>
            <div className="rounded-lg p-4" style={{ backgroundColor: darkMode ? colorPalette.blue : colorPalette.green }}>
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <div key={entry.id} className="flex justify-between items-center py-2 text-white">
                    <span>{index + 1}. {entry.user.name}</span>
                    <span>{entry.score} ({entry.difficulty})</span>
                  </div>
                ))
              ) : (
                <p className="text-white">No high scores yet.</p>
              )}
            </div>
          </div>
        </div>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent className="max-w-4xl w-full max-h-[90vh] h-full bg-transparent">
            <AlertDialogHeader className="h-full">
              <AlertDialogDescription className="h-full">
                <QuestionCard
                  card={currentCard}
                  onAnswer={handleCardAction}
                  timeLeft={questionTimeLeft}
                  answered={answered}
                  onClose={handleCloseQuestion}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={gameOver}>
          <AlertDialogContent className={darkMode ? 'bg-gray-800 text-white' : 'bg-white'}>
            <AlertDialogHeader>
              <AlertDialogTitle>Game Over!</AlertDialogTitle>
              <AlertDialogDescription>
                <p>Your final score: {score}</p>
                <p>Total questions answered: {totalAnswered}</p>
                <p>Accuracy: {totalAnswered > 0 ? Math.round((score / (totalAnswered * getPointsForDifficulty())) * 100) : 0}%</p>
                <p>Achievements: {achievements.join(', ')}</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={restartGame} className={`${darkMode ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-yellow-400 hover:bg-yellow-300'} text-white`}>
                Play Again
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ThemeContext.Provider>
  );
};


export default HeritageCardGame;
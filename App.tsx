
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Lightbulb, 
  Globe, 
  PartyPopper, 
  ChevronRight, 
  RotateCcw, 
  BrainCircuit,
  MapPin,
  Clock
} from 'lucide-react';
import { Category, Difficulty, Question, QuizState, Screen } from './types';
import { generateQuestions } from './services/geminiService';

// --- Subcomponents ---

const Header = () => (
  <header className="flex items-center justify-between p-6 bg-white shadow-sm border-b border-indigo-100">
    <div className="flex items-center gap-2">
      <div className="bg-indigo-600 p-2 rounded-xl text-white">
        <BrainCircuit size={28} />
      </div>
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
        QuizExplorer
      </h1>
    </div>
  </header>
);

const Footer = () => (
  <footer className="text-center p-6 text-gray-400 text-sm">
    &copy; {new Date().getFullYear()} QuizExplorer • AI-Powered Learning
  </footer>
);

// --- Main App Component ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('HOME');
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    streak: 0,
    isGameOver: false,
    questions: [],
    selectedCategory: Category.STEM,
    selectedDifficulty: Difficulty.MEDIUM,
    region: 'Global'
  });
  const [loadingMsg, setLoadingMsg] = useState('Generating your quiz...');
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswering, setIsAnswering] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  // --- Handlers ---

  const startSetup = () => setScreen('SETUP');

  const startQuiz = async () => {
    setScreen('LOADING');
    try {
      const questions = await generateQuestions(
        quizState.selectedCategory,
        quizState.selectedDifficulty,
        quizState.region
      );
      setQuizState(prev => ({ ...prev, questions, currentQuestionIndex: 0, score: 0, streak: 0 }));
      setScreen('QUIZ');
      setTimeLeft(15);
    } catch (error) {
      console.error(error);
      alert("Failed to load questions. Please check your connection or API key.");
      setScreen('HOME');
    }
  };

  const handleAnswer = (index: number) => {
    if (isAnswering) return;
    setIsAnswering(true);
    
    const currentQ = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = index === currentQ.correctAnswerIndex;
    
    if (isCorrect) {
      const speedBonus = Math.floor(timeLeft * 10);
      const pointsAdded = currentQ.points + speedBonus;
      setQuizState(prev => ({
        ...prev,
        score: prev.score + pointsAdded,
        streak: prev.streak + 1
      }));
      setFeedback({ isCorrect: true, explanation: currentQ.explanation });
    } else {
      setQuizState(prev => ({ ...prev, streak: 0 }));
      setFeedback({ isCorrect: false, explanation: currentQ.explanation });
    }
  };

  const nextQuestion = () => {
    setIsAnswering(false);
    setFeedback(null);
    if (quizState.currentQuestionIndex + 1 < quizState.questions.length) {
      setQuizState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
      setTimeLeft(15);
    } else {
      setScreen('RESULTS');
    }
  };

  // --- Timer Effect ---
  useEffect(() => {
    if (screen === 'QUIZ' && !isAnswering && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isAnswering) {
      handleAnswer(-1); // Timeout
    }
  }, [screen, isAnswering, timeLeft]);

  // --- Render Functions ---

  const renderHome = () => (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="relative mb-8">
        <div className="absolute -top-12 -left-12 bg-yellow-400 w-24 h-24 rounded-full opacity-20 blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-8 -right-8 bg-indigo-400 w-32 h-32 rounded-full opacity-20 blur-2xl animate-pulse"></div>
        <div className="bg-white p-8 rounded-3xl shadow-xl relative z-10 text-center transform transition hover:scale-105 duration-300">
          <PartyPopper className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-bounce-slow" />
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Adventure Awaits!</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            Test your knowledge across Culture, Festivals, and STEM. Our AI generates fresh questions every single time you play!
          </p>
          <button 
            onClick={startSetup}
            className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all active:scale-95"
          >
            Start Your Journey
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-xl mt-10">
      <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Customize Your Quest</h2>
      
      <div className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Choose Category</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: Category.CULTURE, icon: <Globe />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
              { id: Category.FESTIVALS, icon: <PartyPopper />, color: 'bg-pink-50 text-pink-600 border-pink-100' },
              { id: Category.STEM, icon: <Lightbulb />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setQuizState(prev => ({ ...prev, selectedCategory: cat.id }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  quizState.selectedCategory === cat.id 
                    ? `ring-4 ring-indigo-100 border-indigo-600 ${cat.color}` 
                    : 'border-gray-100 hover:border-indigo-200'
                }`}
              >
                {cat.icon}
                <span className="font-bold text-sm">{cat.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Select Difficulty</label>
          <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
            {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((diff) => (
              <button
                key={diff}
                onClick={() => setQuizState(prev => ({ ...prev, selectedDifficulty: diff }))}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  quizState.selectedDifficulty === diff 
                    ? 'bg-white text-indigo-600 shadow-md' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Region Input */}
        {(quizState.selectedCategory === Category.CULTURE || quizState.selectedCategory === Category.FESTIVALS) && (
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Region / Locale</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="e.g., Southeast Asia, Brazil, Global" 
                value={quizState.region}
                onChange={(e) => setQuizState(prev => ({ ...prev, region: e.target.value }))}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:border-indigo-400 focus:outline-none transition-all"
              />
            </div>
          </div>
        )}

        <button 
          onClick={startQuiz}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-lg transition-all transform active:scale-[0.98]"
        >
          Let's Go!
        </button>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-20 h-20 border-8 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
      <p className="text-xl font-bold text-gray-600 animate-pulse">{loadingMsg}</p>
    </div>
  );

  const renderQuiz = () => {
    const question = quizState.questions[quizState.currentQuestionIndex];
    if (!question) return null;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-bold border border-indigo-100">
              Q {quizState.currentQuestionIndex + 1}/{quizState.questions.length}
            </div>
            <div className="flex items-center gap-1 text-orange-500 font-bold">
              <Trophy size={20} />
              {quizState.score}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 font-bold ${timeLeft < 5 ? 'text-red-500 animate-bounce' : 'text-gray-500'}`}>
              <Clock size={20} />
              {timeLeft}s
            </div>
            {quizState.streak > 1 && (
              <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                🔥 {quizState.streak} Streak
              </div>
            )}
          </div>
        </div>

        {/* Question Area */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-6 relative overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
            <div 
              className="h-full bg-indigo-500 transition-all duration-1000" 
              style={{ width: `${(timeLeft / 15) * 100}%` }}
            />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 leading-snug mb-8">
            {question.text}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {question.options.map((option, idx) => {
              let btnClass = "w-full text-left p-6 rounded-2xl border-2 font-semibold transition-all ";
              if (!isAnswering) {
                btnClass += "border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 hover:-translate-y-1 shadow-sm";
              } else {
                if (idx === question.correctAnswerIndex) {
                  btnClass += "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md";
                } else if (feedback?.isCorrect === false && idx !== question.correctAnswerIndex) {
                  btnClass += "border-red-200 bg-red-50 text-red-700 opacity-60";
                } else {
                  btnClass += "border-gray-100 opacity-30 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={isAnswering}
                  className={btnClass}
                >
                  <span className="inline-block w-8 h-8 rounded-lg bg-gray-100 text-gray-500 text-center leading-8 mr-4 font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Area */}
        {isAnswering && (
          <div className={`p-6 rounded-2xl animate-in slide-in-from-bottom duration-300 ${feedback?.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            <div className="flex items-start gap-3">
              <div className={`mt-1 p-1 rounded-full ${feedback?.isCorrect ? 'bg-emerald-600' : 'bg-red-600'}`}>
                {feedback?.isCorrect ? <Trophy size={20} className="text-white" /> : <ChevronRight size={20} className="text-white rotate-90" />}
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{feedback?.isCorrect ? 'Brilliant!' : 'Nice try!'}</h4>
                <p className="opacity-90 leading-relaxed mb-4">{feedback?.explanation}</p>
                <button 
                  onClick={nextQuestion}
                  className="bg-white px-6 py-2 rounded-xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95 text-indigo-600"
                >
                  {quizState.currentQuestionIndex + 1 === quizState.questions.length ? 'See Results' : 'Next Question'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    const perfectScore = quizState.questions.length * (Difficulty.HARD === quizState.selectedDifficulty ? 300 : Difficulty.MEDIUM === quizState.selectedDifficulty ? 200 : 100);
    const scorePercentage = Math.round((quizState.score / (perfectScore + (quizState.questions.length * 150))) * 100); // Including potential time bonuses

    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 text-center overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
          
          <div className="mb-6 inline-flex p-6 rounded-full bg-yellow-50 text-yellow-600 animate-bounce-slow">
            <Trophy size={64} strokeWidth={2.5} />
          </div>

          <h2 className="text-4xl font-extrabold text-gray-800 mb-2">Quiz Complete!</h2>
          <p className="text-gray-500 font-medium mb-8">You explored {quizState.selectedCategory} like a pro.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-indigo-50 p-6 rounded-3xl">
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-1">Final Score</p>
              <p className="text-3xl font-extrabold text-indigo-600">{quizState.score}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-3xl">
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-1">Difficulty</p>
              <p className="text-3xl font-extrabold text-purple-600">{quizState.selectedDifficulty}</p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => {
                setQuizState(prev => ({ ...prev, currentQuestionIndex: 0, score: 0, streak: 0 }));
                setScreen('HOME');
              }}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              <RotateCcw size={20} />
              Play Again
            </button>
            <button 
              onClick={() => setScreen('SETUP')}
              className="w-full bg-white border-2 border-gray-100 hover:border-indigo-100 hover:bg-indigo-50 text-indigo-600 font-bold py-5 rounded-2xl transition-all"
            >
              Choose New Topic
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {screen === 'HOME' && renderHome()}
        {screen === 'SETUP' && renderSetup()}
        {screen === 'LOADING' && renderLoading()}
        {screen === 'QUIZ' && renderQuiz()}
        {screen === 'RESULTS' && renderResults()}
      </main>

      <Footer />
    </div>
  );
}

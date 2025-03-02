
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  const goals = [
    "Build healthier habits",
    "Increase productivity",
    "Reduce stress",
    "Improve fitness",
    "Learn new skills",
    "Better sleep patterns",
    "More mindfulness"
  ];
  
  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };
  
  const nextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const slides = [
    // Welcome slide
    <motion.div 
      key="welcome"
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-bettr-blue to-bettr-purple flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 10, 0] }}
        transition={{ 
          type: "spring", 
          damping: 15, 
          stiffness: 200,
          delay: 0.2 
        }}
      >
        <span className="text-white font-bold text-4xl">B</span>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-4">Welcome to Bettr</h1>
        <p className="text-bettr-text-secondary mb-8 max-w-xs mx-auto">
          Your personal AI coach to help you build lasting habits and reach your goals.
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <button 
          onClick={nextStep} 
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <span>Get Started</span>
          <ArrowRight size={18} />
        </button>
      </motion.div>
    </motion.div>,
    
    // Name slide
    <motion.div 
      key="name"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">What should we call you?</h2>
      
      <div className="mb-8">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full p-4 rounded-xl bg-white border border-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-bettr-blue/30 transition-all"
        />
      </div>
      
      <button 
        onClick={nextStep} 
        className="btn-primary w-full"
        disabled={!name.trim()}
      >
        Continue
      </button>
    </motion.div>,
    
    // Goals slide
    <motion.div 
      key="goals"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">What are your goals?</h2>
      <p className="text-bettr-text-secondary mb-6">
        Select all that apply. This helps us personalize your experience.
      </p>
      
      <div className="grid grid-cols-1 gap-3 mb-8">
        {goals.map((goal, index) => (
          <motion.button
            key={goal}
            className={`
              p-4 rounded-xl border text-left transition-all flex items-center justify-between
              ${selectedGoals.includes(goal) 
                ? 'bg-bettr-blue/5 border-bettr-blue text-bettr-blue' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => toggleGoal(goal)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <span>{goal}</span>
            {selectedGoals.includes(goal) && (
              <div className="w-6 h-6 rounded-full bg-bettr-blue text-white flex items-center justify-center">
                <Check size={14} />
              </div>
            )}
          </motion.button>
        ))}
      </div>
      
      <button 
        onClick={nextStep} 
        className="btn-primary w-full"
        disabled={selectedGoals.length === 0}
      >
        {selectedGoals.length > 0 ? 'Finish Setup' : 'Skip for now'}
      </button>
    </motion.div>
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {slides[step]}
        </AnimatePresence>
        
        {/* Progress indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div 
              key={i}
              className={`w-2 h-2 rounded-full ${i === step ? 'bg-bettr-blue' : 'bg-gray-200'}`}
              animate={{
                scale: i === step ? [1, 1.2, 1] : 1,
                backgroundColor: i === step ? '#0E5CFF' : (i < step ? '#0E5CFF' : '#e5e7eb')
              }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;

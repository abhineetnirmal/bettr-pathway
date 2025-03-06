
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Quote } from 'lucide-react';

const quotes = [
  { 
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", 
    author: "Aristotle",
    category: "general"
  },
  { 
    text: "Habits are the compound interest of self-improvement.", 
    author: "James Clear",
    category: "general" 
  },
  { 
    text: "The secret of getting ahead is getting started.", 
    author: "Mark Twain",
    category: "productivity" 
  },
  { 
    text: "You don't have to be great to start, but you have to start to be great.", 
    author: "Zig Ziglar",
    category: "general" 
  },
  { 
    text: "The only way to do great work is to love what you do.", 
    author: "Steve Jobs",
    category: "creativity" 
  },
  { 
    text: "Don't watch the clock; do what it does. Keep going.", 
    author: "Sam Levenson",
    category: "productivity" 
  },
  { 
    text: "The mind is everything. What you think you become.", 
    author: "Buddha",
    category: "mindfulness" 
  },
  { 
    text: "It is not the mountain we conquer, but ourselves.", 
    author: "Edmund Hillary",
    category: "fitness" 
  },
  { 
    text: "Take care of your body. It's the only place you have to live.", 
    author: "Jim Rohn",
    category: "health" 
  },
  { 
    text: "Learning is not attained by chance, it must be sought for with ardor and diligence.", 
    author: "Abigail Adams",
    category: "learning" 
  },
  { 
    text: "Sleep is the best meditation.", 
    author: "Dalai Lama",
    category: "sleep" 
  },
  { 
    text: "The difference between ordinary and extraordinary is that little extra.", 
    author: "Jimmy Johnson",
    category: "work" 
  },
  { 
    text: "Small habits, remarkable results.",
    author: "Bettr",
    category: "general"
  },
  { 
    text: "The secret of change is to focus all of your energy, not on fighting the old, but on building the new.",
    author: "Socrates",
    category: "general"
  },
  { 
    text: "Each morning we are born again. What we do today matters most.",
    author: "Buddha",
    category: "mindfulness"
  },
  { 
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    category: "productivity"
  }
];

// Scientific facts about habits
const habitFacts = [
  "Research shows it takes an average of 66 days to form a new habit.",
  "Habit stacking (connecting new habits to existing ones) increases success rate by 50%.",
  "According to research, willpower is like a muscle that can be strengthened with use.",
  "Morning habits are more likely to stick due to higher willpower levels early in the day.",
  "Visual tracking of habits increases consistency by creating a 'don't break the chain' effect.",
  "The 'habit loop' consists of cue, routine, and reward - understanding each improves habit formation.",
  "Implementation intentions ('When X happens, I will do Y') double the chances of building a habit."
];

interface MotivationalQuoteProps {
  className?: string;
  variant?: 'quote' | 'science';
}

const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({ className, variant = 'quote' }) => {
  const [quote, setQuote] = useState<typeof quotes[0] | null>(null);
  const [fact, setFact] = useState<string | null>(null);
  const [showFact, setShowFact] = useState(variant === 'science');
  
  // Get a random quote
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  };
  
  // Get a random habit fact
  const getRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * habitFacts.length);
    setFact(habitFacts[randomIndex]);
  };
  
  // Initial quote and fact on component mount
  useEffect(() => {
    getRandomQuote();
    getRandomFact();
  }, []);

  // Update showFact when variant changes
  useEffect(() => {
    setShowFact(variant === 'science');
  }, [variant]);
  
  // Refresh the quote
  const handleRefresh = () => {
    getRandomQuote();
    getRandomFact();
  };
  
  // Toggle between quote and fact
  const toggleContent = () => {
    setShowFact(!showFact);
  };

  return (
    <motion.div 
      className={`glass-card p-5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold dark:text-white">
          {showFact ? "Habit Science" : "Daily Motivation"}
        </h3>
        <div className="flex space-x-1">
          <motion.button 
            onClick={toggleContent}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-bettr-text-secondary dark:text-gray-300 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Quote size={14} />
          </motion.button>
          <motion.button 
            onClick={handleRefresh}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-bettr-text-secondary dark:text-gray-300 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <RefreshCw size={14} />
          </motion.button>
        </div>
      </div>
      
      <AnimatedContent show={showFact} content={fact} />
      <AnimatedContent show={!showFact} content={quote ? `"${quote.text}"` : ""} />
      
      {!showFact && quote && (
        <p className="text-sm text-bettr-text-secondary dark:text-gray-400 mt-2 text-right">
          — {quote.author}
        </p>
      )}
    </motion.div>
  );
};

// Animated content component for smooth transitions
const AnimatedContent = ({ show, content }: { show: boolean; content: string | null }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ 
        opacity: show ? 1 : 0,
        height: show ? 'auto' : 0
      }}
      className="overflow-hidden"
    >
      {show && content && (
        <p className="text-bettr-text-primary dark:text-white italic">{content}</p>
      )}
    </motion.div>
  );
};

export default MotivationalQuote;

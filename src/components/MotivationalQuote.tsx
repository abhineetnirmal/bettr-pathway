
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircleHeart } from 'lucide-react';

interface Quote {
  text: string;
  author: string;
}

const quotes: Quote[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "It's not about perfect. It's about effort.", author: "Jillian Michaels" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Unknown" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The habit of persistence is the habit of victory.", author: "Herbert Kaufman" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Your habits will determine your future.", author: "Jack Canfield" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
];

const MotivationalQuote: React.FC = () => {
  const [quote, setQuote] = useState<Quote>(quotes[0]);
  const [fadeIn, setFadeIn] = useState(true);
  
  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <motion.div 
      className="glass-card p-5 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start mb-4 space-x-3">
        <div className="p-2 rounded-full bg-bettr-blue/10 text-bettr-blue mt-1">
          <MessageCircleHeart size={18} />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-bettr-text-primary">Daily Motivation</h3>
          <p className="text-sm text-bettr-text-secondary">A little boost for your day</p>
        </div>
      </div>
      
      <motion.div
        key={quote.text}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mt-2"
      >
        <p className="text-lg font-medium italic text-bettr-text-primary">&ldquo;{quote.text}&rdquo;</p>
        <p className="text-sm text-right text-bettr-text-secondary mt-2">— {quote.author}</p>
      </motion.div>
    </motion.div>
  );
};

export default MotivationalQuote;

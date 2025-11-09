
import React, { useState, useCallback } from 'react';
import { getTalkingPoints, createJournalEntryFromPoints } from '../services/geminiService';
import { JournalEntry, GeneratedJournalEntry } from '../types';
// Fix: Import JournalIcon to resolve usage error.
import { WandIcon, PaperPlaneIcon, CalendarIcon, JournalIcon } from './icons';

interface AIJournalAssistantProps {
  onEntryCreated: (newEntry: Omit<JournalEntry, 'id' | 'week'>) => void;
}

const AIJournalAssistant: React.FC<AIJournalAssistantProps> = ({ onEntryCreated }) => {
  const [userInput, setUserInput] = useState('');
  const [talkingPoints, setTalkingPoints] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'prompt' | 'questions' | 'review'>('prompt');
  const [generatedEntry, setGeneratedEntry] = useState<GeneratedJournalEntry | null>(null);

  const handleGetTalkingPoints = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const points = await getTalkingPoints(userInput);
      setTalkingPoints(points);
      setAnswers(new Array(points.length).fill(''));
      setStep('questions');
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    setIsLoading(true);
    setError(null);
    const questionsAndAnswers = talkingPoints.map((q, i) => ({ question: q, answer: answers[i] }));
    try {
        const entry = await createJournalEntryFromPoints(userInput, questionsAndAnswers);
        setGeneratedEntry(entry);
        setStep('review');
    } catch(e: any) {
        setError(e.message || 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSaveEntry = () => {
      if (!generatedEntry) return;
      onEntryCreated({
          date: new Date().toISOString(),
          ...generatedEntry,
      });
      resetState();
  };

  const resetState = () => {
    setUserInput('');
    setTalkingPoints([]);
    setAnswers([]);
    setStep('prompt');
    setGeneratedEntry(null);
    setError(null);
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-8 tron-shadow-purple">
      <div className="flex items-center mb-4">
        <WandIcon className="w-6 h-6 text-purple-400 mr-3" />
        <h3 className="text-xl font-orbitron text-purple-300">AI Journal Assistant</h3>
      </div>

      {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-md mb-4">{error}</div>}

      {step === 'prompt' && (
        <>
          <p className="text-gray-400 mb-4">What's on your mind today? Tell me what you're feeling or what you'd like to reflect on.</p>
          <textarea
            className="w-full bg-gray-900/70 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-gray-200 min-h-[100px]"
            placeholder="E.g., 'I've been thinking about career changes...', 'Feeling grateful for...', 'Struggling with...'"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            onClick={handleGetTalkingPoints}
            disabled={isLoading || !userInput.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300 font-orbitron"
          >
            {isLoading ? 'Generating...' : 'Get Talking Points'}
            <PaperPlaneIcon className="w-5 h-5" />
          </button>
        </>
      )}

      {step === 'questions' && (
        <div>
            <p className="text-gray-400 mb-4">Here are some questions to guide your reflection:</p>
            {talkingPoints.map((point, index) => (
                <div key={index} className="mb-4">
                    <label className="block text-purple-300 mb-2">{point}</label>
                    <textarea
                        className="w-full bg-gray-900/70 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-gray-200"
                        value={answers[index]}
                        onChange={(e) => {
                            const newAnswers = [...answers];
                            newAnswers[index] = e.target.value;
                            setAnswers(newAnswers);
                        }}
                    />
                </div>
            ))}
            <div className="flex gap-4 mt-6">
                <button onClick={resetState} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 font-orbitron">
                    Cancel
                </button>
                <button onClick={handleCreateEntry} disabled={isLoading || answers.some(a => !a.trim())} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 disabled:text-gray-500 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 font-orbitron">
                    {isLoading ? 'Synthesizing...' : 'Create Entry'}
                </button>
            </div>
        </div>
      )}

      {step === 'review' && generatedEntry && (
        <div>
            <h4 className="font-orbitron text-lg text-purple-300 mb-2">Generated Entry</h4>
            <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
                <h5 className="font-bold text-xl text-white mb-2">{generatedEntry.title}</h5>
                <div className="flex items-center gap-4 mb-3 text-sm">
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">{generatedEntry.mood}</span>
                    <div className="flex gap-2">
                        {generatedEntry.tags.map(tag => <span key={tag} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">#{tag}</span>)}
                    </div>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{generatedEntry.content}</p>
            </div>
            <div className="flex gap-4 mt-6">
                <button onClick={() => setStep('questions')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 font-orbitron">
                    Edit Answers
                </button>
                <button onClick={handleSaveEntry} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 font-orbitron">
                    Save Entry
                </button>
            </div>
        </div>
      )}
    </div>
  );
};


const JournalEntryCard: React.FC<{ entry: JournalEntry }> = ({ entry }) => {
    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-cyan-500/20">
            <h4 className="font-orbitron text-lg text-cyan-300">{entry.title}</h4>
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Week {entry.week} &middot; {new Date(entry.date).toLocaleDateString()}</span>
            </div>
             <div className="flex items-center gap-2 mb-3 text-sm">
                {entry.mood && <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">{entry.mood}</span>}
                <div className="flex gap-2 flex-wrap">
                    {entry.tags?.map(tag => <span key={tag} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">#{tag}</span>)}
                </div>
            </div>
            <p className="text-gray-300 text-sm">{entry.content.substring(0, 200)}{entry.content.length > 200 && '...'}</p>
        </div>
    )
};

interface JournalViewProps {
  journalEntries: JournalEntry[];
  weeksLived: number;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
}

const JournalView: React.FC<JournalViewProps> = ({ journalEntries, weeksLived, addJournalEntry }) => {
    
    const handleNewEntry = useCallback((newEntry: Omit<JournalEntry, 'id' | 'week'>) => {
        addJournalEntry({
            ...newEntry,
            week: weeksLived + 1,
        });
    }, [addJournalEntry, weeksLived]);

    return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
          <JournalIcon className="w-8 h-8 text-cyan-300" />
        </div>
        <div>
          <h2 className="text-3xl font-orbitron text-cyan-300">My Journal</h2>
          <p className="text-gray-400">Reflect on your weeks and what fills them.</p>
        </div>
      </div>
      
      <AIJournalAssistant onEntryCreated={handleNewEntry} />

      {journalEntries.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-lg">
            <CalendarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4"/>
            <h3 className="text-xl font-orbitron text-gray-400">Start Your Journal</h3>
            <p className="text-gray-500">Reflect on your weeks and capture what matters most.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {journalEntries
                .slice()
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(entry => <JournalEntryCard key={entry.id} entry={entry} />)
            }
        </div>
      )}
    </div>
  );
};

export default JournalView;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, UserData, JournalEntry, Milestone, Achievement } from './types';
import GridView from './components/GridView';
import JournalView from './components/JournalView';
import CommunityView from './components/CommunityView';
import { GridIcon, JournalIcon, CommunityIcon, UserIcon, TrophyIcon, MilestoneIcon } from './components/icons';

// --- LocalStorage Hook ---
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        const stickyValue = window.localStorage.getItem(key);
        return stickyValue !== null
            ? JSON.parse(stickyValue)
            : defaultValue;
    });

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}


// --- Achievements Data ---
const initialAchievements: Achievement[] = [
    { id: 'first_steps', name: 'First Steps', description: 'Set your date of birth.', points: 10, unlocked: false, icon: <UserIcon /> },
    { id: 'milestone_maker', name: 'Milestone Maker', description: 'Create your first milestone.', points: 20, unlocked: false, icon: <MilestoneIcon /> },
    { id: 'storyteller', name: 'Storyteller', description: 'Write your first journal entry.', points: 25, unlocked: false, icon: <JournalIcon /> }
];

// --- Header Component ---
interface HeaderProps {
    activeView: View;
    setActiveView: (view: View) => void;
}
const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
    // Fix: Refactor to use a `label` prop instead of `children` to avoid typing conflicts.
    const NavItem = ({ view, icon, label }: { view: View, icon: React.ReactNode, label: React.ReactNode }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-300 ${activeView === view ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}
        >
            {icon}
            <span className="hidden md:inline">{label}</span>
        </button>
    );

    return (
        <header className="bg-black/30 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <GridIcon className="w-8 h-8 text-cyan-400" />
                    <span className="font-orbitron text-xl text-white">4,000 WEEKS</span>
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-900/70 border border-gray-700/50 rounded-lg">
                    <NavItem view={View.Grid} icon={<GridIcon className="w-5 h-5"/>} label="Grid"/>
                    <NavItem view={View.Journal} icon={<JournalIcon className="w-5 h-5"/>} label="Journal"/>
                    <NavItem view={View.Community} icon={<CommunityIcon className="w-5 h-5"/>} label="Community"/>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-300">
                        <UserIcon className="w-5 h-5"/>
                        <span className="font-semibold">Luke Gray</span>
                    </div>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300">
                        Exit
                    </button>
                </div>
            </nav>
        </header>
    );
};


// --- App Component ---
const App: React.FC = () => {
    const [activeView, setActiveView] = useState<View>(View.Grid);
    const [userData, setUserData] = useStickyState<UserData>({ dob: null, lifeExpectancy: 4000 }, '4k-weeks-userData');
    const [journalEntries, setJournalEntries] = useStickyState<JournalEntry[]>([], '4k-weeks-journal');
    const [milestones, setMilestones] = useStickyState<Milestone[]>([], '4k-weeks-milestones');
    const [achievements, setAchievements] = useStickyState<Achievement[]>(initialAchievements, '4k-weeks-achievements');

    const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
        const newEntry = { ...entry, id: new Date().toISOString() };
        setJournalEntries(prev => [...prev, newEntry]);
        
        // Unlock achievement
        setAchievements(prev => prev.map(a => a.id === 'storyteller' ? { ...a, unlocked: true } : a));
    }, [setJournalEntries, setAchievements]);
    
    const addMilestone = useCallback((milestone: Omit<Milestone, 'id'>) => {
        const newMilestone = { ...milestone, id: new Date().toISOString() };
        setMilestones(prev => [...prev, newMilestone]);

        // Unlock achievement
        setAchievements(prev => prev.map(a => a.id === 'milestone_maker' ? { ...a, unlocked: true } : a));
    }, [setMilestones, setAchievements]);

    // Achievement for setting DOB
    useEffect(() => {
        if (userData.dob) {
            setAchievements(prev => prev.map(a => a.id === 'first_steps' ? { ...a, unlocked: true } : a));
        }
    }, [userData.dob, setAchievements]);

    // Fix: Add useMemo to react imports to resolve error.
    const weeksLived = useMemo(() => {
        if (!userData.dob) return 0;
        const birthDate = new Date(userData.dob);
        const now = new Date();
        const diff = now.getTime() - birthDate.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    }, [userData.dob]);

    const renderView = () => {
        switch (activeView) {
            case View.Grid:
                return <GridView userData={userData} setUserData={setUserData} milestones={milestones} addMilestone={addMilestone} achievements={achievements} />;
            case View.Journal:
                return <JournalView journalEntries={journalEntries} weeksLived={weeksLived} addJournalEntry={addJournalEntry} />;
            case View.Community:
                return <CommunityView />;
            default:
                return <GridView userData={userData} setUserData={setUserData} milestones={milestones} addMilestone={addMilestone} achievements={achievements} />;
        }
    };

    return (
        <div className="min-h-screen">
            <Header activeView={activeView} setActiveView={setActiveView} />
            <main>
                {renderView()}
            </main>
        </div>
    );
};

export default App;
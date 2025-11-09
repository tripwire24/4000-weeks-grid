import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { UserData, Milestone, Achievement } from '../types';
import { CalendarIcon, CheckIcon, ChevronDownIcon, MilestoneIcon, ArrowPathIcon, TrophyIcon } from './icons';

// --- UTILS ---
const WEEKS_IN_YEAR = 52.1775;
const getWeeksLived = (dob: string | null): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const now = new Date();
    const diff = now.getTime() - birthDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
};

const getDaysUntilBirthday = (dob: string | null): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const now = new Date();
    const currentYear = now.getFullYear();
    const birthDay = birthDate.getDate();
    const birthMonth = birthDate.getMonth();
    
    let nextBirthday = new Date(currentYear, birthMonth, birthDay);
    if (now > nextBirthday) {
        nextBirthday.setFullYear(currentYear + 1);
    }
    const diff = nextBirthday.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// --- CHILD COMPONENTS ---

interface SettingsFormProps {
    userData: UserData;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}
const SettingsForm: React.FC<SettingsFormProps> = ({ userData, setUserData }) => {
    const [localDob, setLocalDob] = useState(userData.dob || '');
    const [localExpectancy, setLocalExpectancy] = useState(userData.lifeExpectancy);
    const [saved, setSaved] = useState(false);
    
    const handleSave = () => {
        setUserData({ dob: localDob, lifeExpectancy: localExpectancy });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        setLocalDob('');
        setLocalExpectancy(4000);
        setUserData({ dob: null, lifeExpectancy: 4000 });
    };
    
    const isChanged = userData.dob !== localDob || userData.lifeExpectancy !== localExpectancy;

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 mb-8 tron-shadow-cyan">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="w-full">
                    <label htmlFor="dob" className="block text-sm font-medium text-cyan-300 mb-1">Date of Birth *</label>
                    <div className="relative">
                        <input
                            type="date"
                            id="dob"
                            value={localDob}
                            onChange={(e) => setLocalDob(e.target.value)}
                            className="w-full bg-gray-800/70 border border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200"
                        />
                    </div>
                </div>
                <div className="w-full lg:col-span-1">
                    <label htmlFor="lifespan" className="block text-sm font-medium text-cyan-300 mb-1">Life Expectancy (weeks)</label>
                    <input
                        type="range"
                        id="lifespan"
                        min="3000"
                        max="5200"
                        step="50"
                        value={localExpectancy}
                        onChange={(e) => setLocalExpectancy(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="text-center text-cyan-200 mt-1">{localExpectancy} weeks <span className="text-gray-400 text-xs">≈ {(localExpectancy / WEEKS_IN_YEAR).toFixed(1)} years</span></div>
                </div>
                <div className="w-full flex flex-col sm:flex-row gap-4 lg:col-span-2 justify-end">
                    <button
                        onClick={handleSave}
                        disabled={!isChanged && !saved}
                        className={`w-full sm:w-auto flex-1 font-orbitron flex items-center justify-center gap-2 font-bold py-2.5 px-4 rounded-md transition-all duration-300 ${saved ? 'bg-green-600' : 'bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900/50 disabled:text-gray-500'}`}
                    >
                       <CheckIcon className="w-5 h-5"/> {saved ? 'Saved' : 'Save'}
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full sm:w-auto flex-1 font-orbitron flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 px-4 rounded-md transition-all duration-300"
                    >
                       <ArrowPathIcon className="w-5 h-5"/> Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

interface StatsCardProps {
    label: string;
    value: string | number;
    subtext: string;
    icon: React.ReactNode;
    color: 'cyan' | 'pink' | 'purple' | 'orange';
}
const StatsCard: React.FC<StatsCardProps> = ({ label, value, subtext, icon, color }) => {
    const colors = {
        cyan: 'from-cyan-500/30 to-gray-900/10 border-cyan-500/50 text-cyan-300',
        pink: 'from-pink-500/30 to-gray-900/10 border-pink-500/50 text-pink-300',
        purple: 'from-purple-500/30 to-gray-900/10 border-purple-500/50 text-purple-300',
        orange: 'from-orange-500/30 to-gray-900/10 border-orange-500/50 text-orange-300',
    };
    return (
        <div className={`bg-gradient-to-br ${colors[color]} border rounded-lg p-4`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider">{label}</p>
                    <p className="text-4xl font-bold text-white my-1">{value}</p>
                    <p className="text-xs opacity-70">{subtext}</p>
                </div>
                {icon}
            </div>
        </div>
    );
};

interface AchievementPanelProps {
    achievements: Achievement[];
}
const AchievementsPanel: React.FC<AchievementPanelProps> = ({ achievements }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalPoints = achievements.reduce((sum, a) => a.unlocked ? sum + a.points : sum, 0);

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg mb-8 tron-shadow-purple">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 text-left flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <TrophyIcon className="w-6 h-6 text-purple-300"/>
                    <h3 className="text-xl font-orbitron text-purple-300">Level 1 <span className="text-base text-gray-400 font-sans normal-case tracking-normal">({totalPoints} Points)</span></h3>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">{unlockedCount} / {achievements.length} Unlocked</span>
                    <ChevronDownIcon className={`w-6 h-6 text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-6 border-t border-purple-500/30">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {achievements.map(ach => (
                            <div key={ach.id} className={`p-3 text-center rounded-lg border ${ach.unlocked ? 'border-purple-400/50 bg-purple-900/30' : 'border-gray-700 bg-gray-800/50 opacity-50'}`}>
                                <div className={`mx-auto mb-2 ${ach.unlocked ? 'text-purple-300' : 'text-gray-500'}`}>{React.cloneElement(ach.icon as React.ReactElement, { className: 'w-8 h-8 mx-auto' })}</div>
                                <p className={`text-xs font-bold ${ach.unlocked ? 'text-white' : 'text-gray-400'}`}>{ach.name}</p>
                                <p className="text-xs text-gray-500">{ach.points} pts</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface WeekSquareProps {
    weekNumber: number;
    isPast: boolean;
    isCurrent: boolean;
    milestone?: Milestone;
}
const WeekSquare: React.FC<WeekSquareProps> = memo(({ weekNumber, isPast, isCurrent, milestone }) => {
    const baseClasses = "w-3 h-3 rounded-sm transition-all duration-300 relative";
    let colorClasses = "bg-gray-800/50 border border-gray-700/50";
    if (isCurrent) {
        colorClasses = "bg-gradient-radial from-pink-500 to-purple-600 animate-pulse border-white";
    } else if (isPast) {
        colorClasses = "bg-cyan-500/80 border border-cyan-400/50";
    }

    return (
        <div className={`${baseClasses} ${colorClasses}`} title={`Week ${weekNumber}`}>
            {milestone && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: milestone.color, boxShadow: `0 0 4px ${milestone.color}` }} title={milestone.label}></div>
                </div>
            )}
        </div>
    );
});


const WeeksGrid: React.FC<{ weeksLived: number; totalWeeks: number; milestones: Milestone[] }> = ({ weeksLived, totalWeeks, milestones }) => {
    const weeks = useMemo(() => Array.from({ length: totalWeeks }, (_, i) => i + 1), [totalWeeks]);
    const milestonesByWeek = useMemo(() => {
        const map = new Map<number, Milestone>();
        milestones.forEach(m => map.set(m.week, m));
        return map;
    }, [milestones]);

    if(totalWeeks === 0) return null;

    return (
        <div className="p-4 bg-black/50 border border-cyan-400/30 rounded-lg overflow-auto">
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(52, minmax(0, 1fr))' }}>
                {weeks.map(week => (
                    <WeekSquare
                        key={week}
                        weekNumber={week}
                        isPast={week <= weeksLived}
                        isCurrent={week === weeksLived + 1}
                        milestone={milestonesByWeek.get(week)}
                    />
                ))}
            </div>
            <div className="flex justify-end items-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-cyan-500/80"></div><span>Past Weeks</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-gradient-radial from-pink-500 to-purple-600"></div><span>Current Week</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-gray-800/50"></div><span>Future Weeks</span></div>
            </div>
        </div>
    );
};

// --- MAIN VIEW COMPONENT ---

interface GridViewProps {
    userData: UserData;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
    milestones: Milestone[];
    addMilestone: (milestone: Omit<Milestone, 'id'>) => void;
    achievements: Achievement[];
}

const GridView: React.FC<GridViewProps> = ({ userData, setUserData, milestones, addMilestone, achievements }) => {
    const [weeksLived, setWeeksLived] = useState(0);
    const [daysUntilBirthday, setDaysUntilBirthday] = useState(0);

    useEffect(() => {
        setWeeksLived(getWeeksLived(userData.dob));
        setDaysUntilBirthday(getDaysUntilBirthday(userData.dob));
        const interval = setInterval(() => {
             setWeeksLived(getWeeksLived(userData.dob));
             setDaysUntilBirthday(getDaysUntilBirthday(userData.dob));
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [userData.dob]);
    
    const stats = useMemo(() => ({
        lived: weeksLived,
        remaining: userData.dob ? userData.lifeExpectancy - weeksLived : '---',
        complete: userData.dob ? ((weeksLived / userData.lifeExpectancy) * 100).toFixed(1) : '---',
        birthday: daysUntilBirthday,
    }), [weeksLived, daysUntilBirthday, userData]);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-orbitron text-cyan-300">Your 4,000 Weeks</h1>
                <p className="text-gray-400 mt-2">Each square is one week. The past is inked. The next square is up to you.</p>
                <p className="text-sm text-gray-500 italic mt-2">"The average human lifespan is absurdly, terrifyingly, insultingly short." — Oliver Burkeman</p>
            </div>
            
            <SettingsForm userData={userData} setUserData={setUserData} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard label="Lived" value={stats.lived} subtext="Weeks behind" icon={<div />} color="cyan" />
                <StatsCard label="Remaining" value={stats.remaining} subtext="Weeks ahead" icon={<div />} color="pink" />
                <StatsCard label="Complete" value={`${stats.complete}%`} subtext="Of expected" icon={<div />} color="purple" />
                <StatsCard label="Birthday" value={stats.birthday} subtext="Days away" icon={<CalendarIcon className="w-8 h-8 text-orange-400/50"/>} color="orange" />
            </div>

            <AchievementsPanel achievements={achievements} />
            
            {/* Custom Milestones would go here, simplified for brevity */}

            <WeeksGrid weeksLived={weeksLived} totalWeeks={userData.dob ? userData.lifeExpectancy : 0} milestones={milestones} />
        </div>
    );
};

export default GridView;
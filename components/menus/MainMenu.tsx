import React, { useState, useMemo } from 'react';
import { User, Student } from '../../types';
import { calculateSummaryScore, calculateTaskScore } from '../../utils/calculations';
import { TOTAL_MEETINGS } from '../../constants';

interface MainMenuProps {
  user: User;
  students: Student[];
}

// Reusable component for stat cards/charts
const StatCard: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
    <div className={`bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-400/20 p-6 ${className}`}>
        <h3 className="text-sm text-cyan-300 uppercase tracking-widest mb-4">{title}</h3>
        {children}
    </div>
);

// Proactiveness Radar Chart Component
const ProactivenessRadar: React.FC<{ proactiveness: Student['proactiveness'] }> = ({ proactiveness }) => {
    const size = 200;
    const center = size / 2;
    const maxVal = TOTAL_MEETINGS > 0 ? TOTAL_MEETINGS : 15; // Use 15 as a fallback if TOTAL_MEETINGS is 0

    const calculatePoint = (value: number, angle: number, radiusScale: number) => {
        const radius = (value / maxVal) * (center * 0.8) * radiusScale;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${x},${y}`;
    };

    const angles = [
        -Math.PI / 2, // Bertanya (Top)
        (Math.PI * 7) / 6, // Menjawab (Bottom-left)
        -Math.PI / 6, // Menambahkan (Bottom-right)
    ];

    const dataPoints = [
        proactiveness.bertanya,
        proactiveness.menjawab,
        proactiveness.menambahkan
    ].map((val, i) => calculatePoint(val, angles[i], 1)).join(' ');

    const axisPoints = [1, 2, 3].map((_, i) => calculatePoint(maxVal, angles[i], 1));

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background grid lines */}
            <g opacity="0.3">
                {[0.25, 0.5, 0.75, 1].map(scale => (
                    <polygon
                        key={scale}
                        points={[1,2,3].map((_, i) => calculatePoint(maxVal, angles[i], scale)).join(' ')}
                        fill="none"
                        stroke="rgb(34 211 238)"
                        strokeWidth="1"
                    />
                ))}
            </g>

            {/* Axes */}
            <g opacity="0.5">
                {axisPoints.map((point, i) => <line key={i} x1={center} y1={center} x2={point.split(',')[0]} y2={point.split(',')[1]} stroke="rgb(107 114 128)" strokeWidth="1" />)}
            </g>
             {/* Axis Labels */}
            <text x={center} y={15} fill="#e5e7eb" fontSize="12" textAnchor="middle">Bertanya</text>
            <text x={40} y={size - 10} fill="#e5e7eb" fontSize="12" textAnchor="middle">Menjawab</text>
            <text x={size - 40} y={size - 10} fill="#e5e7eb" fontSize="12" textAnchor="middle">Menambahkan</text>

            {/* Data Polygon */}
            <polygon
                points={dataPoints}
                fill="rgba(0, 255, 255, 0.4)"
                stroke="rgb(34 211 238)"
                strokeWidth="2"
            />
        </svg>
    );
};

const ExamChart: React.FC<{ scores: Student['exams'] }> = ({ scores }) => {
    const examData = [
        { label: 'Mid 1', score: scores.mid1 },
        { label: 'Final 1', score: scores.final1 },
        { label: 'Mid 2', score: scores.mid2 },
        { label: 'Final 2', score: scores.final2 },
    ];

    return (
        <div className="h-32 flex justify-around items-end gap-4 pt-4 px-2">
            {examData.map((exam, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                    <div className="absolute -top-6 text-white text-sm mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{exam.score}</div>
                    <div 
                        className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-md transition-all duration-500 ease-out group-hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                        style={{ height: `${exam.score}%` }}
                    ></div>
                    <p className="text-xs text-gray-400 mt-2 whitespace-nowrap">{exam.label}</p>
                </div>
            ))}
        </div>
    );
};


// Main Menu Component
const MainMenu: React.FC<MainMenuProps> = ({ user, students }) => {
    const [selectedStudentId, setSelectedStudentId] = useState<number | undefined>(user.role === 'teacher' ? students[0]?.id : user.studentData?.id);

    const rankings = useMemo(() => {
        const sortedStudents = [...students]
            .map(s => ({ id: s.id, score: calculateSummaryScore(s) }))
            .sort((a, b) => b.score - a.score);
        
        const rankMap = new Map<number, number>();
        sortedStudents.forEach((s, index) => {
            rankMap.set(s.id, index + 1);
        });
        return rankMap;
    }, [students]);

    const studentToDisplay = students.find(s => s.id === selectedStudentId);

    if (!studentToDisplay) {
        return (
             <div>
                <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">Main Menu</h1>
                <p className="text-gray-400">No student data available.</p>
            </div>
        );
    }
    
    const summaryScore = calculateSummaryScore(studentToDisplay);
    const rank = rankings.get(studentToDisplay.id) || 0;
    const taskScore = calculateTaskScore(studentToDisplay.tasks);

    return (
        <div>
            <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">Main Menu</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Student Profile */}
                <div className="lg:col-span-1">
                    <div className="relative p-8 bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl shadow-cyan-500/20 border border-cyan-400/30 h-full">
                        <div className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl opacity-20 blur-xl -z-10 animate-pulse"></div>
                        <div className="flex flex-col items-center">
                            <img
                                src={studentToDisplay.picture}
                                alt={studentToDisplay.name}
                                className="w-32 h-32 rounded-full border-4 border-cyan-400/50 object-cover mb-4 shadow-lg shadow-cyan-500/30"
                            />
                            
                            {user.role === 'teacher' ? (
                                <div className="relative group">
                                    <select 
                                        value={selectedStudentId} 
                                        onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                                        className="w-full text-center text-2xl font-bold text-white bg-transparent border-none focus:outline-none mb-1 appearance-none cursor-pointer group-hover:text-cyan-300 transition-colors pr-6"
                                    >
                                        {students.map(s => <option key={s.id} value={s.id} className="bg-gray-800 text-white">{s.name}</option>)}
                                    </select>
                                     <svg className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-cyan-300 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </div>
                            ) : (
                                <h2 className="text-2xl font-bold text-white">{studentToDisplay.name}</h2>
                            )}

                            <p className="text-gray-400 mb-6">NIM: {studentToDisplay.nim}</p>
                            
                            <div className="flex justify-around w-full text-center">
                                <div>
                                    <p className="text-sm text-cyan-300 uppercase tracking-widest">Score</p>
                                    <p className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">{summaryScore}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-cyan-300 uppercase tracking-widest">Rank</p>
                                    <p className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">{rank}<span className="text-2xl text-gray-400">/{students.length}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Charts */}
                <div className="lg:col-span-2 space-y-8">
                    <StatCard title="Exam Result">
                       <ExamChart scores={studentToDisplay.exams} />
                    </StatCard>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <StatCard title="Proactiveness" className="flex justify-center items-center">
                            <ProactivenessRadar proactiveness={studentToDisplay.proactiveness} />
                        </StatCard>
                        <StatCard title="Task Score" className="flex justify-center items-center">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="10" fill="none" />
                                    <circle 
                                        cx="50" cy="50" r="45" 
                                        stroke="url(#taskGradient)" strokeWidth="10" fill="none"
                                        strokeDasharray={2 * Math.PI * 45}
                                        strokeDashoffset={(2 * Math.PI * 45) * (1 - taskScore / 100)}
                                        transform="rotate(-90 50 50)"
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="taskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#22d3ee" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <p className="text-4xl font-bold text-white">{taskScore}</p>
                            </div>
                        </StatCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
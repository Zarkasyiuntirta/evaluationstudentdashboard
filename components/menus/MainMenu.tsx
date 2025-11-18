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
    
    const width = 500;
    const height = 150;
    const padding = { top: 20, right: 20, bottom: 30, left: 30 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const points = examData.map((d, i) => {
        const x = padding.left + (i / (examData.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (d.score / 100) * chartHeight;
        return { x, y, score: d.score, label: d.label };
    });

    const linePath = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
    
    const floorPath = `M ${padding.left - 10},${height - padding.bottom + 5} L ${padding.left + 20},${height - padding.bottom - 15} L ${width - padding.right + 20},${height - padding.bottom - 15} L ${width - padding.right - 10},${height - padding.bottom + 5} Z`;
    
    const yAxisLabels = [0, 25, 50, 75, 100];

    return (
        <div className="relative w-full h-full flex items-center justify-center">
             <style>
                {`
                @keyframes draw-line { to { stroke-dashoffset: 0; } }
                .line-path {
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    animation: draw-line 2s ease-out forwards;
                }
                `}
            </style>
            <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#67e8f9" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </linearGradient>
                     <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                
                <path d={floorPath} fill="rgba(0, 255, 255, 0.05)" />

                <g className="text-gray-600">
                    {yAxisLabels.map(label => {
                        const y = padding.top + chartHeight - (label / 100) * chartHeight;
                        return (
                             <g key={label}>
                                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
                                <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.7">{label}</text>
                            </g>
                        );
                    })}
                </g>

                <path d={areaPath} fill="url(#areaGradient)" />
                <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" className="line-path" />

                {points.map((p, i) => (
                    <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
                        <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
                        <circle cx={p.x} cy={p.y} r={hoveredIndex === i ? 6 : 4} fill={hoveredIndex === i ? "#67e8f9" : "white"} stroke={hoveredIndex === i ? "white" : "#3b82f6"} strokeWidth="2" filter={hoveredIndex === i ? "url(#glow)" : "none"} style={{transition: 'all 0.2s ease'}}/>
                        
                        {hoveredIndex === i && (
                            <g>
                                <rect x={p.x - 15} y={p.y - 30} width="30" height="20" rx="3" fill="rgba(0,0,0,0.7)" />
                                <text x={p.x} y={p.y - 16} textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">{p.score}</text>
                            </g>
                        )}
                    </g>
                ))}

                <g className="text-gray-400">
                    {points.map((p, i) => (
                        <text key={i} x={p.x} y={height - padding.bottom + 15} textAnchor="middle" fontSize="12" fill="currentColor">{p.label}</text>
                    ))}
                </g>
            </svg>
        </div>
    );
};

const ScoreRankingChart: React.FC<{ students: Student[], selectedStudentId?: number }> = ({ students, selectedStudentId }) => {
    const sortedStudentsWithScores = useMemo(() => {
        return students
            .map(student => ({
                id: student.id,
                name: student.name,
                score: calculateSummaryScore(student),
            }))
            .sort((a, b) => b.score - a.score);
    }, [students]);

    const Bar: React.FC<{score: number, name: string, isHighlighted: boolean}> = ({ score, name, isHighlighted }) => {
        const barHeight = score * 1.5;
        const barWidth = 20;
        const skewAmount = 8;
    
        const highlightClasses = isHighlighted 
            ? 'from-cyan-400 to-blue-400 shadow-[0_0_15px_rgba(0,255,255,0.6)]' 
            : 'from-cyan-600 to-blue-600';
        const highlightSide = isHighlighted ? 'bg-cyan-500' : 'bg-cyan-800';
        const highlightTop = isHighlighted ? 'bg-blue-300' : 'bg-blue-400';
    
        return (
            <div className="relative group flex flex-col items-center flex-shrink-0" style={{ height: `${barHeight + skewAmount + 30}px`}}>
                {/* Tooltip for full name */}
                <div className={`absolute bottom-full mb-2 w-max bg-gray-900 border border-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10`}>
                    <p className="font-bold text-cyan-300">{name}</p>
                </div>
    
                <div className="relative transition-transform duration-300 group-hover:-translate-y-2" style={{ width: `${barWidth}px`, height: `${barHeight}px` }}>
                    <div 
                        className={`absolute top-0 left-full w-full h-full ${highlightSide} transition-colors`}
                        style={{
                            transform: `skewY(45deg)`,
                            transformOrigin: 'top left',
                            width: `${skewAmount}px`,
                        }}
                    ></div>
                    <div 
                        className={`absolute top-0 left-0 w-full h-full ${highlightTop} transition-colors`}
                        style={{
                            transform: `skewX(45deg)`,
                            transformOrigin: 'top left',
                            height: `${skewAmount}px`,
                            top: `-${skewAmount}px`
                        }}
                    ></div>
                    <div className={`w-full h-full bg-gradient-to-t ${highlightClasses} transition-all`}></div>
                    
                    {/* Score value centered in the bar, visible on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-white font-bold text-sm" style={{textShadow: '0 0 5px black'}}>
                            {score}
                        </span>
                    </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-2 truncate w-16 text-center group-hover:text-white transition-colors">{name.split(' ')[0]}</p>
            </div>
        );
    };

    return (
        <StatCard title="Class Score Distribution" className="mt-8">
            <div className="w-full flex items-end gap-3 px-4 h-[220px] overflow-x-auto pb-2">
                {sortedStudentsWithScores.map(student => (
                    <Bar 
                        key={student.id} 
                        score={student.score} 
                        name={student.name} 
                        isHighlighted={student.id === selectedStudentId}
                    />
                ))}
            </div>
        </StatCard>
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
                    <StatCard title="Exam Result" className="h-48 flex items-center justify-center">
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
            <ScoreRankingChart students={students} selectedStudentId={selectedStudentId} />
        </div>
    );
};

export default MainMenu;
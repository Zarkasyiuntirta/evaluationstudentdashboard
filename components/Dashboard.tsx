
import React, { useState, useMemo, FC } from 'react';
import { User, Student, MenuType } from '../types';
import MainMenu from './menus/MainMenu';
import AbsenteeismMenu from './menus/AbsenteeismMenu';
import ExamMenu from './menus/ExamMenu';
import ProactivenessMenu from './menus/ProactivenessMenu';
import TaskMenu from './menus/TaskMenu';
import { HomeIcon, ClipboardListIcon, AcademicCapIcon, SparklesIcon, DocumentTextIcon, LogoutIcon } from './Icons';

interface DashboardProps {
  user: User;
  students: Student[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, students, onUpdateStudents, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<MenuType>('main');

  const menuItems = useMemo(() => {
    const allMenus: { id: MenuType; label: string; icon: FC<{className?: string}> }[] = [
      { id: 'main', label: 'Main Menu', icon: HomeIcon },
      { id: 'absenteeism', label: 'Absenteeism', icon: ClipboardListIcon },
      { id: 'exam', label: 'Exam', icon: AcademicCapIcon },
      { id: 'proactiveness', label: 'Proactiveness', icon: SparklesIcon },
      { id: 'task', label: 'Task', icon: DocumentTextIcon },
    ];
    if (user.role === 'student') {
      return allMenus.filter(menu => menu.id === 'main');
    }
    return allMenus;
  }, [user.role]);

  const renderContent = () => {
    switch (activeMenu) {
      case 'main':
        return <MainMenu user={user} students={students} />;
      case 'absenteeism':
        return <AbsenteeismMenu students={students} onUpdateStudents={onUpdateStudents} />;
      case 'exam':
        return <ExamMenu students={students} onUpdateStudents={onUpdateStudents} />;
      case 'proactiveness':
        return <ProactivenessMenu students={students} onUpdateStudents={onUpdateStudents} />;
      case 'task':
        return <TaskMenu students={students} onUpdateStudents={onUpdateStudents} />;
      default:
        return <MainMenu user={user} students={students} />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation Bar */}
      <header className="w-full bg-black/20 backdrop-blur-lg flex-shrink-0 px-6 py-3 border-b border-cyan-400/20 z-10 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-4">
                <h1 className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.7)]">DASHBOARD</h1>
                <p className="text-xs text-gray-400">Welcome, {user.username}</p>
            </div>
            
            <nav>
                <ul className="flex items-center space-x-2">
                    {menuItems.map((item) => (
                    <li key={item.id}>
                        <button
                        onClick={() => setActiveMenu(item.id)}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                            activeMenu === item.id
                            ? 'bg-cyan-500/20 text-cyan-300 shadow-inner shadow-cyan-500/20'
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                        }`}
                        >
                        <item.icon className="w-5 h-5 mr-2"/>
                        <span>{item.label}</span>
                        </button>
                    </li>
                    ))}
                </ul>
            </nav>

            <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 rounded-lg text-gray-400 hover:bg-red-500/50 hover:text-white transition-all duration-300"
            >
                <LogoutIcon className="w-5 h-5 mr-2"/>
                <span>Logout</span>
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto" style={{ perspective: '1500px' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;

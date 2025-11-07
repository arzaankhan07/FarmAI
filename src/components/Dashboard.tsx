import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, FileText, History, LogOut, Sprout } from 'lucide-react';
import { SoilDataForm } from './SoilDataForm';
import { RecommendationDashboard } from './RecommendationDashboard';
import { PredictionHistory } from './PredictionHistory';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

type Tab = 'home' | 'recommendations' | 'history';

// Animated Section Component
function AnimatedSection({ 
  children, 
  delay = 0,
  direction = 'up'
}: { 
  children: React.ReactNode; 
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const { ref, isVisible } = useScrollAnimation();

  const directionClasses = {
    up: 'translate-y-10',
    down: '-translate-y-10',
    left: 'translate-x-10',
    right: '-translate-x-10',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 translate-x-0'
          : `opacity-0 ${directionClasses[direction]}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Dashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl delay-2000" />
      </div>

      <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-cyan-200/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sprout className="w-8 h-8 text-emerald-500 mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 bg-clip-text text-transparent">
                FarmAI
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <AnimatedSection delay={0} direction="left">
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 space-y-2 border border-cyan-200/30">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 transform ${
                    activeTab === 'home'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium shadow-lg shadow-emerald-500/50 scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 hover:scale-105'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 transform ${
                    activeTab === 'recommendations'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium shadow-lg shadow-emerald-500/50 scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 hover:scale-105'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Recommendations</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 transform ${
                    activeTab === 'history'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium shadow-lg shadow-emerald-500/50 scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 hover:scale-105'
                  }`}
                >
                  <History className="w-5 h-5" />
                  <span>History</span>
                </button>
              </div>
            </aside>
          </AnimatedSection>

          <main className="flex-1">
            <AnimatedSection delay={100} direction="right">
              {activeTab === 'home' && <SoilDataForm onSuccess={() => setActiveTab('recommendations')} />}
              {activeTab === 'recommendations' && <RecommendationDashboard />}
              {activeTab === 'history' && <PredictionHistory />}
            </AnimatedSection>
          </main>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, FileText, History, LogOut, Sprout, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="relative z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center">
                <Sprout className="w-8 h-8 text-emerald-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  FarmAI
                </span>
              </div>
              
              {/* Navigation Menu - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'home'
                      ? 'bg-emerald-600 text-white font-medium shadow-md'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'recommendations'
                      ? 'bg-emerald-600 text-white font-medium shadow-md'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Recommendations</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'history'
                      ? 'bg-emerald-600 text-white font-medium shadow-md'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <History className="w-5 h-5" />
                  <span>History</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 animate-fade-in">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === 'home'
                      ? 'bg-emerald-600 text-white font-medium shadow-md'
                      : 'text-gray-700 hover:bg-emerald-50'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('recommendations');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === 'recommendations'
                      ? 'bg-emerald-600 text-white font-medium shadow-md'
                      : 'text-gray-700 hover:bg-emerald-50'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Recommendations</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('history');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === 'history'
                      ? 'bg-emerald-600 text-white font-medium shadow-md'
                      : 'text-gray-700 hover:bg-emerald-50'
                  }`}
                >
                  <History className="w-5 h-5" />
                  <span>History</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatedSection delay={0} direction="up">
          <main>
            {activeTab === 'home' && <SoilDataForm onSuccess={() => setActiveTab('recommendations')} />}
            {activeTab === 'recommendations' && <RecommendationDashboard />}
            {activeTab === 'history' && <PredictionHistory />}
          </main>
        </AnimatedSection>
      </div>
    </div>
  );
}

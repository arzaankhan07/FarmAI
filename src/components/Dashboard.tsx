import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, FileText, History, LogOut, Sprout, Settings } from 'lucide-react';
import { SoilDataForm } from './SoilDataForm';
import { RecommendationDashboard } from './RecommendationDashboard';
import { PredictionHistory } from './PredictionHistory';

type Tab = 'home' | 'recommendations' | 'history';

export function Dashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sprout className="w-8 h-8 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-gray-800">FarmAI</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
              <button
                onClick={() => setActiveTab('home')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'home'
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'recommendations'
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Recommendations</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'history'
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <History className="w-5 h-5" />
                <span>History</span>
              </button>
            </div>
          </aside>

          <main className="flex-1">
            {activeTab === 'home' && <SoilDataForm onSuccess={() => setActiveTab('recommendations')} />}
            {activeTab === 'recommendations' && <RecommendationDashboard />}
            {activeTab === 'history' && <PredictionHistory />}
          </main>
        </div>
      </div>
    </div>
  );
}

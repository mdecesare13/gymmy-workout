import React, { useState } from 'react';
import { useWorkoutStore } from './hooks/useWorkoutStore';
import TabBar from './components/TabBar';
import TodayWorkout from './components/TodayWorkout';
import PlanBuilder from './components/PlanBuilder';
import ExerciseLibrary from './components/ExerciseLibrary';
import StatsDashboard from './components/StatsDashboard';
import ChatAssistant from './components/ChatAssistant';

export default function App() {
  const store = useWorkoutStore();
  const [activeTab, setActiveTab] = useState('today');

  // Router matching tab active state
  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return <TodayWorkout store={store} />;
      case 'builder':
        return <PlanBuilder store={store} />;
      case 'library':
        return <ExerciseLibrary />;
      case 'stats':
        return <StatsDashboard store={store} />;
      case 'assistant':
        return <ChatAssistant store={store} />;
      default:
        return <TodayWorkout store={store} />;
    }
  };

  return (
    <>
      {/* Top iOS Floating Header */}
      <header className="ios-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="/icon-192.png"
            alt="Gymmy Logo"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              objectFit: 'cover'
            }}
          />
          <span style={{ fontSize: '19px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Gymmy
          </span>
        </div>
        
        {/* Subtle split display helper in header */}
        <div style={{ fontSize: '11px', color: 'var(--shark-500)', fontWeight: 'bold' }}>
          {store.planConfig.liftDays}L • {store.planConfig.runDays}R
        </div>
      </header>

      {/* Primary Tab View Panel */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {renderTabContent()}
      </main>

      {/* Bottom Floating Navigation bar */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
}

import React from 'react';
import { Sliders, RefreshCw, Check } from 'lucide-react';

export default function PlanBuilder({ store }) {
  const { planConfig, setPlanConfig, generateWeeklyPlan, currentPlan } = store;

  const regions = [
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'bis', label: 'Biceps' },
    { id: 'tris', label: 'Triceps' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'legs', label: 'Legs' },
    { id: 'abs', label: 'Abs' },
    { id: 'forearms', label: 'Forearms' }
  ];

  const handleLiftDaysChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setPlanConfig((prev) => ({ ...prev, liftDays: val }));
  };

  const handleRunDaysChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setPlanConfig((prev) => ({ ...prev, runDays: val }));
  };

  const toggleRegion = (regionId) => {
    setPlanConfig((prev) => {
      const alreadyFocused = prev.focusRegions.includes(regionId);
      let updated;
      if (alreadyFocused) {
        // Guarantee at least 1 region is selected
        if (prev.focusRegions.length === 1) return prev;
        updated = prev.focusRegions.filter(id => id !== regionId);
      } else {
        updated = [...prev.focusRegions, regionId];
      }
      return { ...prev, focusRegions: updated };
    });
  };

  const handleGenerate = () => {
    generateWeeklyPlan();
  };

  // Safe checks
  const totalDays = planConfig.liftDays + planConfig.runDays;

  return (
    <div className="scrollable">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders color="var(--gym-red)" size={26} />
          Plan Builder
        </h1>
        <p>Customize your weekly training schedule and muscle split.</p>
      </div>

      {/* Lift Days Slider */}
      <div className="ios-card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: '600' }}>Lifting Days</span>
          <span style={{ color: 'var(--gym-red)', fontWeight: 'bold', fontSize: '16px' }}>
            {planConfig.liftDays} {planConfig.liftDays === 1 ? 'Day' : 'Days'} / wk
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="7"
          value={planConfig.liftDays}
          onChange={handleLiftDaysChange}
          style={{
            width: '100%',
            accentColor: 'var(--gym-red)',
            cursor: 'pointer',
            height: '6px',
            borderRadius: '3px'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--shark-500)', marginTop: '4px' }}>
          <span>0 (None)</span>
          <span>7 (Every day)</span>
        </div>
      </div>

      {/* Run Days Slider */}
      <div className="ios-card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: '600' }}>Running Days</span>
          <span style={{ color: 'var(--gym-gold)', fontWeight: 'bold', fontSize: '16px' }}>
            {planConfig.runDays} {planConfig.runDays === 1 ? 'Day' : 'Days'} / wk
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="7"
          value={planConfig.runDays}
          onChange={handleRunDaysChange}
          style={{
            width: '100%',
            accentColor: 'var(--gym-gold)',
            cursor: 'pointer',
            height: '6px',
            borderRadius: '3px'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--shark-500)', marginTop: '4px' }}>
          <span>0 (None)</span>
          <span>7 (Every day)</span>
        </div>
      </div>

      {/* Warning if exceeds 7 days */}
      {totalDays > 7 && (
        <div className="badge badge-red" style={{ display: 'flex', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
          ⚠️ Notice: Total days ({totalDays}) exceed 7. Lifts will be prioritized, and running will adjust to fit the weekly cycle.
        </div>
      )}

      {/* Target Regions Checklist */}
      <div className="ios-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '12px' }}>Weekly Muscle Focus</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px'
        }}>
          {regions.map((region) => {
            const isFocused = planConfig.focusRegions.includes(region.id);
            return (
              <button
                key={region.id}
                onClick={() => toggleRegion(region.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isFocused ? '1px solid rgba(255, 59, 48, 0.4)' : '1px solid var(--glass-border)',
                  backgroundColor: isFocused ? 'rgba(255, 59, 48, 0.1)' : 'var(--shark-700)',
                  color: isFocused ? '#ffffff' : 'var(--shark-300)',
                  fontWeight: isFocused ? '600' : 'normal',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                {region.label}
                {isFocused && <Check size={16} color="var(--gym-red)" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="ios-btn ios-btn-primary"
        style={{
          display: 'flex',
          gap: '8px',
          boxShadow: '0 4px 15px rgba(255, 59, 48, 0.25)',
          marginBottom: '24px'
        }}
      >
        <RefreshCw size={18} />
        Generate Weekly Plan
      </button>

      {/* Current Generated Weekly Plan Preview */}
      {currentPlan && (
        <div>
          <h3 style={{ marginBottom: '12px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '6px' }}>
            Active Weekly Schedule
          </h3>
          {currentPlan.map((day) => (
            <div
              key={day.dayName}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--shark-800)',
                borderBottom: '1px solid var(--glass-border)',
                borderRadius: '8px',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '11px', color: 'var(--shark-500)', fontWeight: 'bold' }}>
                  {day.dayName.toUpperCase()}
                </span>
                <span style={{ fontSize: '15px', fontWeight: '600' }}>
                  {day.title}
                </span>
              </div>
              <div>
                {day.type === 'lift' ? (
                  <span className="badge badge-red">Lift</span>
                ) : day.type === 'run' ? (
                  <span className="badge badge-gold">Run</span>
                ) : (
                  <span className="badge" style={{ backgroundColor: 'var(--shark-700)', color: 'var(--shark-300)' }}>
                    Rest
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

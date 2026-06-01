import React, { useState } from 'react';
import { Sliders, RefreshCw, Check } from 'lucide-react';

export default function PlanBuilder({ store }) {
  const { planConfig, setPlanConfig, generateWeeklyPlan, currentPlan } = store;
  const [selectedDayIdx, setSelectedDayIdx] = useState(null);
  const [draggedDayIdx, setDraggedDayIdx] = useState(null);

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
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '4px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '6px' }}>
            Active Weekly Schedule
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--shark-500)', marginBottom: '12px' }}>
            {selectedDayIdx !== null ? (
              <strong style={{ color: 'var(--gym-gold)' }}>⚠️ Tap another day to swap workouts, or tap same day to cancel.</strong>
            ) : (
              "💡 Drag & drop rows, or tap any two days to swap their workouts."
            )}
          </p>
          
          {currentPlan.map((day, index) => {
            const isSelected = selectedDayIdx === index;
            const isDraggedOver = draggedDayIdx === index;

            return (
              <div
                key={day.dayName}
                draggable="true"
                onDragStart={(e) => {
                  setDraggedDayIdx(index);
                  e.dataTransfer.setData('text/plain', index);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceIdx = draggedDayIdx !== null ? draggedDayIdx : parseInt(e.dataTransfer.getData('text/plain'), 10);
                  if (sourceIdx !== index && !isNaN(sourceIdx)) {
                    store.swapDays(sourceIdx, index);
                  }
                  setDraggedDayIdx(null);
                }}
                onDragEnd={() => setDraggedDayIdx(null)}
                onClick={() => {
                  if (selectedDayIdx === null) {
                    setSelectedDayIdx(index);
                  } else if (selectedDayIdx === index) {
                    setSelectedDayIdx(null);
                  } else {
                    store.swapDays(selectedDayIdx, index);
                    setSelectedDayIdx(null);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: isSelected ? 'rgba(255, 204, 0, 0.08)' : 'var(--shark-800)',
                  border: isSelected ? '1.5px solid var(--gym-gold)' : '1px solid var(--glass-border)',
                  boxShadow: isSelected ? '0 0 10px rgba(255, 204, 0, 0.15)' : 'none',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  cursor: 'grab',
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                  opacity: isDraggedOver ? 0.5 : 1
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '11px', color: isSelected ? 'var(--gym-gold)' : 'var(--shark-500)', fontWeight: 'bold' }}>
                    {day.dayName.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--shark-100)' }}>
                    {day.title}
                  </span>
                </div>
                <div style={{ pointerEvents: 'none' }}>
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
            );
          })}
        </div>
      )}
    </div>
  );
}

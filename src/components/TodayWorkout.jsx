import React, { useState, useEffect } from 'react';
import FormVisualizer from './FormVisualizer';
import { Play, Check, Trophy, RefreshCw, HelpCircle, X, ChevronRight } from 'lucide-react';

export default function TodayWorkout({ store }) {
  const { currentPlan, logWorkoutSession, swapExercise, getSwapAlternatives, getExerciseStats } = store;

  // Find today's workout based on current weekday
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayIndex = (new Date().getDay() + 6) % 7; // Map Sun=0, Mon=1 to Mon=0, Sun=6
  const todayName = weekdays[todayIndex];

  const todayWorkout = currentPlan ? currentPlan[todayIndex] : null;

  // Active workout logging state
  const [activeSession, setActiveSession] = useState(null); // holds copy of today's exercises
  const [selectedSwapEx, setSelectedSwapEx] = useState(null); // exercise we want to swap
  const [selectedGuideEx, setSelectedGuideEx] = useState(null); // exercise we want to see guide for
  const [showTrophy, setShowTrophy] = useState(false);

  // Initialize active session exercises
  const startWorkout = () => {
    if (!todayWorkout || todayWorkout.type === 'rest') return;
    
    // Create deep copy of today's exercises to local state
    const copiedExercises = todayWorkout.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({
        ...s,
        // Match history stats for default helper text placeholder
        ...getExerciseStats(ex.id) 
      }))
    }));

    setActiveSession({
      dayIndex: todayIndex,
      dayName: todayName,
      title: todayWorkout.title,
      type: todayWorkout.type,
      exercises: copiedExercises
    });
  };

  // Handle logging input change
  const handleSetChange = (exerciseId, setNum, field, value) => {
    if (!activeSession) return;
    
    const updatedExercises = activeSession.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      
      const updatedSets = ex.sets.map(s => {
        if (s.setNum !== setNum) return s;
        return { ...s, [field]: value };
      });
      
      return { ...ex, sets: updatedSets };
    });

    setActiveSession(prev => ({ ...prev, exercises: updatedExercises }));
  };

  // Toggle set completion checkmark
  const toggleSetComplete = (exerciseId, setNum) => {
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;

      const updatedSets = ex.sets.map(s => {
        if (s.setNum !== setNum) return s;
        
        // Auto-fill defaults if left blank when checking off
        const defaultReps = s.reps || ex.defaultReps || 10;
        // Search history or default to 0 for weight if blank
        const lastWeightMatch = s.pr?.weight || 0;
        const weight = s.weight !== '' ? s.weight : lastWeightMatch;
        const reps = s.reps !== '' ? s.reps : defaultReps;

        return { 
          ...s, 
          weight, 
          reps, 
          completed: !s.completed 
        };
      });

      return { ...ex, sets: updatedSets };
    });

    setActiveSession(prev => ({ ...prev, exercises: updatedExercises }));
  };

  // Trigger swap exercise logic
  const handleSwapSelect = (alternativeEx) => {
    if (!activeSession || !selectedSwapEx) return;

    // 1. Update local active session state
    const stats = getExerciseStats(alternativeEx.id);
    const newEx = {
      ...alternativeEx,
      sets: Array.from({ length: alternativeEx.defaultSets }, (_, i) => ({
        setNum: i + 1,
        weight: '',
        reps: alternativeEx.defaultReps,
        completed: false,
        last: stats.last,
        pr: stats.pr
      }))
    };

    const updatedExercises = activeSession.exercises.map(ex => {
      if (ex.id === selectedSwapEx.id) return newEx;
      return ex;
    });

    setActiveSession(prev => ({ ...prev, exercises: updatedExercises }));

    // 2. Persist swap in the global store currentPlan so it remains updated
    swapExercise(todayIndex, selectedSwapEx.id, alternativeEx);
    setSelectedSwapEx(null);
  };

  // Log session to history
  const finishWorkout = () => {
    if (!activeSession) return;
    
    // Log active sessions matching completion criteria
    logWorkoutSession(todayIndex, activeSession.exercises);
    setActiveSession(null);
    setShowTrophy(true);
  };

  if (!currentPlan) {
    return (
      <div className="scrollable" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
        <HelpCircle size={48} color="var(--gym-gold)" style={{ marginBottom: '16px', opacity: 0.8 }} />
        <h2 style={{ textAlign: 'center' }}>No Workout Plan Found</h2>
        <p style={{ textAlign: 'center', marginBottom: '24px' }}>Let's configure and generate your first weekly plan to get started.</p>
        <button
          onClick={startWorkout} // actually redirects or we let them navigate
          style={{ display: 'none' }}
        />
        {/* Placeholder helper redirecting to Builder tab */}
        <div style={{ textAlign: 'center', color: 'var(--shark-500)', fontSize: '13px' }}>
          Tap the **Builder** tab below to set your splits and generate your schedule!
        </div>
      </div>
    );
  }

  // Active Logger View
  if (activeSession) {
    return (
      <div className="scrollable" style={{ paddingBottom: 'calc(var(--safe-bottom) + 120px)' }}>
        {/* Active Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span className="badge badge-red" style={{ marginBottom: '4px' }}>Active Session</span>
            <h1 style={{ fontSize: '24px' }}>{activeSession.title}</h1>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Abandon current workout progress? Your sets will not be logged.")) {
                setActiveSession(null);
              }
            }}
            className="badge badge-red"
            style={{
              padding: '6px 12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold',
              borderRadius: '8px'
            }}
          >
            Cancel
          </button>
        </div>

        {/* Exercises Scroll Container */}
        {activeSession.exercises.map((ex) => (
          <div key={ex.id} className="ios-card" style={{ padding: '16px', marginBottom: '16px' }}>
            
            {/* Header section with buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ color: 'var(--shark-100)', fontSize: '16px', textTransform: 'none', marginBottom: '2px', fontWeight: '700' }}>
                  {ex.name}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--shark-500)', fontWeight: 'bold' }}>
                  {ex.sets.length} Target Sets • {ex.region.toUpperCase()}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSelectedGuideEx(ex)}
                  style={{
                    backgroundColor: 'var(--shark-700)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--gym-gold)'
                  }}
                  title="Form Guide"
                >
                  <HelpCircle size={16} />
                </button>
                <button
                  onClick={() => setSelectedSwapEx(ex)}
                  style={{
                    backgroundColor: 'var(--shark-700)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--gym-red)'
                  }}
                  title="Swap Exercise"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* Set Logging Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ex.sets.map((set) => {
                const stats = getExerciseStats(ex.id);
                const hasLastLog = stats.last;
                const prWeight = stats.pr?.weight;
                const prReps = stats.pr?.reps;

                return (
                  <div
                    key={set.setNum}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'var(--shark-700)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      border: set.completed ? '1px solid var(--ios-green)' : '1px solid var(--glass-border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--shark-300)' }}>
                        Set {set.setNum}
                      </span>
                      
                      {/* Logging Inputs */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            pattern="[0-9]*"
                            placeholder="lbs"
                            value={set.weight}
                            onChange={(e) => handleSetChange(ex.id, set.setNum, 'weight', e.target.value)}
                            disabled={set.completed}
                            style={{
                              width: '56px',
                              textAlign: 'center',
                              backgroundColor: 'var(--shark-800)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '6px',
                              color: 'var(--shark-100)',
                              padding: '5px 0',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          />
                          <span style={{ fontSize: '11px', color: 'var(--shark-500)' }}>lbs</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            pattern="[0-9]*"
                            placeholder="reps"
                            value={set.reps}
                            onChange={(e) => handleSetChange(ex.id, set.setNum, 'reps', e.target.value)}
                            disabled={set.completed}
                            style={{
                              width: '44px',
                              textAlign: 'center',
                              backgroundColor: 'var(--shark-800)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '6px',
                              color: 'var(--shark-100)',
                              padding: '5px 0',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          />
                          <span style={{ fontSize: '11px', color: 'var(--shark-500)' }}>reps</span>
                        </div>

                        {/* Check Button */}
                        <button
                          onClick={() => toggleSetComplete(ex.id, set.setNum)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: set.completed ? 'var(--ios-green)' : 'var(--shark-800)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease'
                          }}
                        >
                          <Check size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>

                    {/* Previous/PR Stats guidance guide line */}
                    {(hasLastLog || prWeight) && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        gap: '12px',
                        fontSize: '10px',
                        color: 'var(--shark-500)',
                        marginTop: '4px',
                        borderTop: '1px solid rgba(255,255,255,0.03)',
                        paddingTop: '4px'
                      }}>
                        {hasLastLog && (
                          <span>
                            Last: <span style={{ color: 'var(--shark-300)' }}>{stats.last.sets.split(', ')[set.setNum - 1] || stats.last.sets.split(', ')[0]}</span>
                          </span>
                        )}
                        {prWeight && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <span style={{ color: 'var(--gym-gold)' }}>🏆</span> PR: <span style={{ color: 'var(--gym-gold)', fontWeight: 'bold' }}>{prWeight} lbs x {prReps}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        ))}

        {/* Finish Button */}
        <button
          onClick={finishWorkout}
          className="ios-btn ios-btn-primary"
          style={{
            marginTop: '10px',
            boxShadow: '0 4px 15px rgba(255, 59, 48, 0.25)'
          }}
        >
          Finish Workout
        </button>

        {/* --- Swap Exercise Modal Sheet --- */}
        <div className={`ios-sheet-backdrop ${selectedSwapEx ? 'active' : ''}`} onClick={() => setSelectedSwapEx(null)}>
          <div className={`ios-sheet ${selectedSwapEx ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="ios-sheet-handle" />
            {selectedSwapEx && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', marginBottom: '0' }}>Swap: {selectedSwapEx.name}</h2>
                  <button
                    onClick={() => setSelectedSwapEx(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shark-500)' }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <p style={{ marginBottom: '16px' }}>Select an alternative movement targeting the **{selectedSwapEx.region}** muscle region:</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {getSwapAlternatives(selectedSwapEx.id, selectedSwapEx.region).map(alt => (
                    <button
                      key={alt.id}
                      onClick={() => handleSwapSelect(alt)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--glass-border)',
                        backgroundColor: 'var(--shark-700)',
                        color: 'var(--shark-100)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '15px'
                      }}
                    >
                      {alt.name}
                      <ChevronRight size={16} color="var(--shark-500)" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- Form Guide Modal Sheet --- */}
        <div className={`ios-sheet-backdrop ${selectedGuideEx ? 'active' : ''}`} onClick={() => setSelectedGuideEx(null)}>
          <div className={`ios-sheet ${selectedGuideEx ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="ios-sheet-handle" />
            {selectedGuideEx && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', marginBottom: '0' }}>Form Guide: {selectedGuideEx.name}</h2>
                  <button
                    onClick={() => setSelectedGuideEx(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shark-500)' }}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <FormVisualizer visualKey={selectedGuideEx.visualKey} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '11px', color: 'var(--shark-500)' }}>Description</h3>
                  <p style={{ fontSize: '14px', color: 'var(--shark-100)' }}>{selectedGuideEx.description}</p>
                </div>

                <div>
                  <h3 style={{ fontSize: '11px', color: 'var(--shark-500)', marginBottom: '6px' }}>Form Cues</h3>
                  <ol style={{ paddingLeft: '18px', color: 'var(--shark-300)', fontSize: '13px', lineHeight: '1.4' }}>
                    {selectedGuideEx.instructions.map((inst, i) => (
                      <li key={i} style={{ marginBottom: '6px' }}>{inst}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    );
  }

  // Completed State View
  if (todayWorkout && todayWorkout.completed) {
    return (
      <div className="scrollable" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
        <div style={{
          backgroundColor: 'var(--gym-gold-dim)',
          border: '1px solid rgba(255,204,0,0.3)',
          padding: '20px',
          borderRadius: '50%',
          marginBottom: '20px'
        }}>
          <Trophy size={48} color="var(--gym-gold)" />
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Workout Completed!</h2>
        <p style={{ textAlign: 'center', marginBottom: '24px', maxWidth: '300px' }}>
          Awesome job! Today's session has been successfully logged to your history.
        </p>
        <div style={{ textAlign: 'center', color: 'var(--shark-500)', fontSize: '12px' }}>
          Check out your stats or download the CSV inside the **Stats** tab.
        </div>
      </div>
    );
  }

  // Standard Plan Target View (Not Started)
  return (
    <div className="scrollable">
      {/* Top Welcome Title */}
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--gym-red)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {todayName}
        </span>
        <h1 style={{ marginTop: '2px' }}>Today's Workout</h1>
        <p>Stay active, stay fit. Keep up the consistency!</p>
      </div>

      {/* Today's Target Card */}
      {todayWorkout ? (
        <div>
          {todayWorkout.type === 'rest' ? (
            /* Rest Day Card */
            <div className="ios-card" style={{ padding: '32px 16px', textAlign: 'center' }}>
              <h2 style={{ color: 'var(--gym-gold)', marginBottom: '8px' }}>💤 {todayWorkout.title}</h2>
              <p style={{ maxWidth: '280px', margin: '0 auto' }}>{todayWorkout.description}</p>
            </div>
          ) : (
            /* Active Workout Card */
            <div>
              <div className="ios-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span className="badge badge-red" style={{ fontSize: '10px' }}>
                    {todayWorkout.type.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--shark-500)', fontWeight: 'bold' }}>
                    {todayWorkout.exercises.length} Exercises
                  </span>
                </div>
                
                <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>{todayWorkout.title}</h2>
                {todayWorkout.type === 'run' ? (
                  <p style={{ fontSize: '13px', marginBottom: '16px' }}>{todayWorkout.description}</p>
                ) : (
                  <p style={{ fontSize: '13px', marginBottom: '16px' }}>
                    Focusing on target regions: {todayWorkout.regions.join(', ')}.
                  </p>
                )}

                <button
                  onClick={startWorkout}
                  className="ios-btn ios-btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(255, 59, 48, 0.3)'
                  }}
                >
                  <Play size={18} fill="#ffffff" />
                  Start Workout
                </button>
              </div>

              {/* List of exercises included today (Preview) */}
              <div>
                <h3 style={{ marginBottom: '8px' }}>Exercise Lineup</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {todayWorkout.exercises.map((ex) => (
                    <div
                      key={ex.id}
                      style={{
                        backgroundColor: 'var(--shark-800)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{ex.name}</div>
                        <span style={{ fontSize: '11px', color: 'var(--shark-500)' }}>
                          {ex.defaultSets} Sets x {ex.defaultReps} {ex.region === 'running' ? 'mins' : 'reps'}
                        </span>
                      </div>
                      <span className="badge badge-red" style={{ fontSize: '9px' }}>{ex.region}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Plan Setup Helper */
        <div className="ios-card" style={{ padding: '32px 16px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '8px' }}>Welcome to IronFlow!</h2>
          <p style={{ marginBottom: '20px' }}>You haven't generated a workout schedule for this week yet.</p>
          <div style={{ color: 'var(--shark-500)', fontSize: '12px' }}>
            Go to the **Builder** tab below to set your targets and generate a schedule!
          </div>
        </div>
      )}

      {/* --- Gold Trophy Completion Alert Overlay --- */}
      {showTrophy && (
        <div
          className="ios-sheet-backdrop active"
          onClick={() => setShowTrophy(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            className="ios-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '320px',
              padding: '30px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--shark-800)',
              border: '1px solid var(--gym-gold)',
              boxShadow: '0 10px 30px rgba(255, 204, 0, 0.15)',
              margin: '0'
            }}
          >
            <div style={{
              backgroundColor: 'var(--gym-gold-dim)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Trophy size={32} color="var(--gym-gold)" />
            </div>
            
            <h2 style={{ color: '#ffffff', marginBottom: '8px' }}>Session Logged!</h2>
            <p style={{ color: 'var(--shark-300)', fontSize: '14px', marginBottom: '20px' }}>
              Your performance weights and reps have been securely logged to local history.
            </p>
            
            <button
              onClick={() => setShowTrophy(false)}
              className="ios-btn ios-btn-secondary"
              style={{ padding: '10px 20px', fontSize: '14px', border: '1px solid var(--glass-border)' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

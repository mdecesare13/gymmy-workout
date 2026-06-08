import React, { useState, useEffect } from 'react';
import FormVisualizer from './FormVisualizer';
import { Play, Check, Trophy, RefreshCw, HelpCircle, X, ChevronRight, Timer } from 'lucide-react';

export default function TodayWorkout({ store }) {
  const { 
    currentPlan, 
    logWorkoutSession, 
    logCardioSession, 
    swapExercise, 
    getSwapAlternatives, 
    getExerciseStats,
    activeSession,
    setActiveSession
  } = store;

  // Find today's workout based on current weekday
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayIndex = (new Date().getDay() + 6) % 7; // Map Sun=0, Mon=1 to Mon=0, Sun=6
  const todayName = weekdays[todayIndex];

  // Active preview day state
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);

  const todayWorkout = currentPlan ? currentPlan[selectedDayIndex] : null;

  // Accordion expanded exercise ID state
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);
  const [hasInitializedAccordion, setHasInitializedAccordion] = useState(false);

  // Active workout logging UI states
  const [selectedSwapEx, setSelectedSwapEx] = useState(null); // exercise we want to swap
  const [selectedGuideEx, setSelectedGuideEx] = useState(null); // exercise we want to see guide for
  const [showTrophy, setShowTrophy] = useState(false);

  // Cardio specific states
  const [cardioType, setCardioType] = useState('Run');
  const [cardioDuration, setCardioDuration] = useState('');
  const [cardioDistance, setCardioDistance] = useState('');
  const [cardioNotes, setCardioNotes] = useState('');

  // Live stopwatch states
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeSession || !activeSession.startTime) {
      setElapsedSeconds(0);
      return;
    }

    const calculateElapsed = () => {
      const start = activeSession.startTime;
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - start) / 1000));
      setElapsedSeconds(diff);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const pad = (num) => String(num).padStart(2, '0');
    
    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Auto-expand first incomplete exercise if a session is loaded from store/localStorage
  useEffect(() => {
    if (activeSession) {
      if (!hasInitializedAccordion) {
        const firstIncomplete = activeSession.exercises.find(ex => 
          ex.sets.some(s => !s.completed)
        );
        if (firstIncomplete) {
          setExpandedExerciseId(firstIncomplete.id);
        } else if (activeSession.exercises.length > 0) {
          setExpandedExerciseId(activeSession.exercises[0].id);
        }
        setHasInitializedAccordion(true);
      }
    } else {
      setHasInitializedAccordion(false);
      setExpandedExerciseId(null);
    }
  }, [activeSession, hasInitializedAccordion]);

  // Initialize active session exercises
  const startWorkout = () => {
    if (!todayWorkout || todayWorkout.type === 'rest') return;
    
    // Reset cardio fields
    setCardioType('Run');
    setCardioDuration('');
    setCardioDistance('');
    setCardioNotes('');
    
    // Create deep copy of target day's exercises to local state
    const copiedExercises = todayWorkout.exercises.map(ex => ({
      ...ex,
      sets: (ex.sets || []).map(s => ({
        ...s,
        // Match history stats for default helper text placeholder
        ...getExerciseStats(ex.id) 
      }))
    }));

    if (copiedExercises.length > 0) {
      setExpandedExerciseId(copiedExercises[0].id);
    }

    setActiveSession({
      dayIndex: selectedDayIndex,
      dayName: weekdays[selectedDayIndex],
      title: todayWorkout.title,
      type: todayWorkout.type,
      exercises: copiedExercises,
      startTime: Date.now()
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

    const stats = getExerciseStats(exerciseId);
    const hasLastLog = stats.last;

    const updatedExercises = activeSession.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;

      const updatedSets = ex.sets.map(s => {
        if (s.setNum !== setNum) return s;
        
        let placeholderWeight = 0;
        let placeholderReps = ex.defaultReps || 10;
        
        if (hasLastLog) {
          const setsArray = stats.last.sets.split(', ');
          const currentSetString = setsArray[setNum - 1] || setsArray[0];
          if (currentSetString) {
            const match = currentSetString.match(/([\d.]+)\s*lbs\s*x\s*(\d+)/);
            if (match) {
              placeholderWeight = Number(match[1]) || 0;
              placeholderReps = Number(match[2]) || placeholderReps;
            }
          }
        }
        
        // Auto-fill defaults if left blank when checking off
        const weight = s.weight !== '' ? s.weight : (placeholderWeight || stats.pr?.weight || 0);
        const reps = s.reps !== '' ? s.reps : placeholderReps;

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
    swapExercise(activeSession.dayIndex, selectedSwapEx.id, alternativeEx);
    setSelectedSwapEx(null);
  };

  // Log session to history
  const finishWorkout = () => {
    if (!activeSession) return;
    
    const seconds = activeSession.startTime ? Math.max(0, Math.floor((Date.now() - activeSession.startTime) / 1000)) : 0;
    
    if (activeSession.type === 'run') {
      const finalDuration = cardioDuration || Math.round(seconds / 60) || '';
      logCardioSession(activeSession.dayIndex, cardioType, finalDuration, cardioDistance, cardioNotes);
    } else {
      // Log active sessions matching completion criteria
      logWorkoutSession(activeSession.dayIndex, activeSession.exercises, seconds);
    }
    setActiveSession(null);
    setShowTrophy(true);
  };

  const toggleExerciseExpand = (exId) => {
    setExpandedExerciseId(expandedExerciseId === exId ? null : exId);
  };

  const handleSaveAndNext = (exercise) => {
    if (!activeSession) return;
    
    const stats = getExerciseStats(exercise.id);
    const hasLastLog = stats.last;

    // 1. Mark all sets of this exercise as complete if they aren't already
    const updatedExercises = activeSession.exercises.map(ex => {
      if (ex.id !== exercise.id) return ex;

      const updatedSets = ex.sets.map(s => {
        if (s.completed) return s;
        
        let placeholderWeight = 0;
        let placeholderReps = ex.defaultReps || 10;
        
        if (hasLastLog) {
          const setsArray = stats.last.sets.split(', ');
          const currentSetString = setsArray[s.setNum - 1] || setsArray[0];
          if (currentSetString) {
            const match = currentSetString.match(/([\d.]+)\s*lbs\s*x\s*(\d+)/);
            if (match) {
              placeholderWeight = Number(match[1]) || 0;
              placeholderReps = Number(match[2]) || placeholderReps;
            }
          }
        }
        
        const weight = s.weight !== '' ? s.weight : (placeholderWeight || stats.pr?.weight || 0);
        const reps = s.reps !== '' ? s.reps : placeholderReps;

        return { 
          ...s, 
          weight, 
          reps, 
          completed: true 
        };
      });

      return { ...ex, sets: updatedSets };
    });

    // Update activeSession state
    const nextSession = { ...activeSession, exercises: updatedExercises };
    setActiveSession(nextSession);

    // 2. Find next incomplete exercise to expand
    const currentIndex = activeSession.exercises.findIndex(ex => ex.id === exercise.id);
    const nextIncomplete = updatedExercises.find((ex, idx) => idx > currentIndex && ex.sets.some(s => !s.completed));
    
    if (nextIncomplete) {
      setExpandedExerciseId(nextIncomplete.id);
    } else {
      // If no next incomplete, expand the very next exercise anyway if it exists
      const nextEx = activeSession.exercises[currentIndex + 1];
      if (nextEx) {
        setExpandedExerciseId(nextEx.id);
      } else {
        // No more exercises, collapse all
        setExpandedExerciseId(null);
      }
    }
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
      <>
        <div className="scrollable" style={{ paddingBottom: 'calc(var(--safe-bottom) + 120px)' }}>
        {/* Active Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-red" style={{ margin: 0 }}>Active Session</span>
              <span className="badge" style={{ backgroundColor: 'var(--shark-700)', color: 'var(--gym-gold)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 'bold', margin: 0 }}>
                <Timer size={12} />
                {formatTime(elapsedSeconds)}
              </span>
            </div>
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
        {activeSession.type === 'run' ? (
          <div className="ios-card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--shark-100)', fontSize: '16px', marginBottom: '14px', fontWeight: '700' }}>
              Log Cardio Session
            </h3>

            {/* SVG Visualizer */}
            <div style={{ marginBottom: '18px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
              <FormVisualizer visualKey={cardioType.toLowerCase()} />
            </div>

            {/* Capsule selector for Cardio Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--shark-500)', letterSpacing: '0.5px' }}>ACTIVITY TYPE</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { id: 'Run', label: '🏃‍♂️ Run' },
                  { id: 'Bike', label: '🚴‍♂️ Bike' },
                  { id: 'Elliptical', label: '👟 Elliptical' },
                  { id: 'Row', label: '🚣‍♂️ Row' },
                  { id: 'Other', label: '✨ Other' }
                ].map((option) => {
                  const selected = cardioType === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setCardioType(option.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: selected ? '1px solid var(--gym-red)' : '1px solid var(--glass-border)',
                        backgroundColor: selected ? 'var(--gym-red)' : 'var(--shark-700)',
                        color: selected ? '#ffffff' : 'var(--shark-300)',
                        fontSize: '13px',
                        fontWeight: selected ? '700' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--shark-500)', letterSpacing: '0.5px' }}>DURATION (MINS)</label>
                <input
                  type="number"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="0"
                  value={cardioDuration}
                  onChange={(e) => setCardioDuration(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--shark-800)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    color: 'var(--shark-100)',
                    padding: '12px',
                    fontSize: '18px',
                    textAlign: 'center',
                    outline: 'none',
                    fontWeight: 'bold'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--shark-500)', letterSpacing: '0.5px' }}>DISTANCE (MILES)</label>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={cardioDistance}
                  onChange={(e) => setCardioDistance(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--shark-800)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    color: 'var(--shark-100)',
                    padding: '12px',
                    fontSize: '18px',
                    textAlign: 'center',
                    outline: 'none',
                    fontWeight: 'bold'
                  }}
                />
              </div>
            </div>

            {/* Notes Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--shark-500)', letterSpacing: '0.5px' }}>SESSION NOTES / PERFORMANCE</label>
              <textarea
                placeholder="Describe your session (e.g. pace, intervals, how you felt)..."
                value={cardioNotes}
                onChange={(e) => setCardioNotes(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--shark-800)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  color: 'var(--shark-100)',
                  padding: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: '1.4'
                }}
              />
            </div>



          </div>
        ) : (
          activeSession.exercises.map((ex) => {
            const isExpanded = expandedExerciseId === ex.id;
            const isExCompleted = ex.sets.every(s => s.completed);

            return (
              <div 
                key={ex.id} 
                className="ios-card" 
                style={{ 
                  padding: '16px', 
                  marginBottom: '16px',
                  border: isExpanded 
                    ? '1px solid var(--gym-red)' 
                    : isExCompleted 
                      ? '1px solid rgba(52, 199, 89, 0.4)' 
                      : '1px solid var(--glass-border)',
                  backgroundColor: isExCompleted && !isExpanded 
                    ? 'rgba(52, 199, 89, 0.04)' 
                    : 'var(--shark-800)',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Accordion Header (Clickable) */}
                <div 
                  onClick={() => toggleExerciseExpand(ex.id)}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <h3 style={{ 
                      color: isExCompleted ? 'var(--shark-300)' : 'var(--shark-100)', 
                      fontSize: '16px', 
                      textTransform: 'none', 
                      marginBottom: '2px', 
                      fontWeight: '700',
                      textDecoration: isExCompleted && !isExpanded ? 'line-through' : 'none',
                      opacity: isExCompleted && !isExpanded ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {ex.name}
                      {isExCompleted && (
                        <span className="badge badge-green" style={{ fontSize: '9px', textTransform: 'uppercase', padding: '1px 4px' }}>
                          ✓ Done
                        </span>
                      )}
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--shark-500)', fontWeight: 'bold' }}>
                      {ex.sets.length} Sets • {ex.region.toUpperCase()}
                    </span>
                  </div>

                  {/* Dropdown Chevron / indicator */}
                  <div style={{
                    color: isExpanded ? 'var(--gym-red)' : 'var(--shark-500)',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <ChevronRight size={18} />
                  </div>
                </div>

                {/* Accordion Body (Collapsible content) */}
                {isExpanded && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                    {/* Header buttons (Form Guide, Swap) */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '14px' }}>
                      <button
                        onClick={() => setSelectedGuideEx(ex)}
                        style={{
                          backgroundColor: 'var(--shark-700)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          color: 'var(--gym-gold)',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                        title="Form Guide"
                      >
                        <HelpCircle size={14} />
                        Form Guide
                      </button>
                      <button
                        onClick={() => setSelectedSwapEx(ex)}
                        style={{
                          backgroundColor: 'var(--shark-700)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          color: 'var(--gym-red)',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                        title="Swap Exercise"
                      >
                        <RefreshCw size={14} />
                        Swap
                      </button>
                    </div>

                    {/* Set Logging Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                      {ex.sets.map((set) => {
                        const stats = getExerciseStats(ex.id);
                        const hasLastLog = stats.last;
                        const prWeight = stats.pr?.weight;
                        const prReps = stats.pr?.reps;

                        let placeholderWeight = "lbs";
                        let placeholderReps = "reps";
                        
                        if (hasLastLog) {
                          const setsArray = stats.last.sets.split(', ');
                          const currentSetString = setsArray[set.setNum - 1] || setsArray[0];
                          if (currentSetString) {
                            const match = currentSetString.match(/([\d.]+)\s*lbs\s*x\s*(\d+)/);
                            if (match) {
                              placeholderWeight = match[1];
                              placeholderReps = match[2];
                            }
                          }
                        }

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
                                    step="any"
                                    inputMode="decimal"
                                    placeholder={placeholderWeight}
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
                                    inputMode="numeric"
                                    placeholder={placeholderReps}
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
                                    {stats.isComparable ? `Comp (${stats.comparableName}): ` : 'Last: '}
                                    <span style={{ color: 'var(--shark-300)' }}>{stats.last.sets.split(', ')[set.setNum - 1] || stats.last.sets.split(', ')[0]}</span>
                                  </span>
                                )}
                                {prWeight && (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <span style={{ color: 'var(--gym-gold)' }}>🏆</span> {stats.isComparable ? 'Comp PR: ' : 'PR: '}<span style={{ color: 'var(--gym-gold)', fontWeight: 'bold' }}>{prWeight} lbs x {prReps}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Save & Next Accordion Control */}
                    <button
                      onClick={() => handleSaveAndNext(ex)}
                      className="ios-btn"
                      style={{
                        padding: '10px 14px',
                        fontSize: '13px',
                        backgroundColor: isExCompleted ? 'var(--shark-700)' : 'var(--ios-green)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: isExCompleted ? 'none' : '0 2px 10px rgba(52, 199, 89, 0.2)'
                      }}
                    >
                      <Check size={14} />
                      {isExCompleted ? "Done (Collapse)" : "Save & Next Exercise"}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}

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
      </div>

      {/* --- Swap Exercise Modal Sheet --- */}
      <div className={`ios-sheet-backdrop ${selectedSwapEx ? 'active' : ''}`} onClick={() => setSelectedSwapEx(null)}>
        <div className={`ios-sheet ${selectedSwapEx ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="ios-sheet-handle" />
          {selectedSwapEx && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '0' }}>Swap: {selectedSwapEx.name}</h2>
                <button
                  onClick={() => setSelectedSwapEx(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shark-500)' }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="ios-sheet-body">
                <p style={{ marginBottom: '16px' }}>Select an alternative movement targeting the **{selectedSwapEx.region}** muscle region:</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
            </>
          )}
        </div>
      </div>

      {/* --- Form Guide Modal Sheet --- */}
      <div className={`ios-sheet-backdrop ${selectedGuideEx ? 'active' : ''}`} onClick={() => setSelectedGuideEx(null)}>
        <div className={`ios-sheet ${selectedGuideEx ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="ios-sheet-handle" />
          {selectedGuideEx && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '0' }}>Form Guide: {selectedGuideEx.name}</h2>
                <button
                  onClick={() => setSelectedGuideEx(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shark-500)' }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="ios-sheet-body">
                <div style={{ marginBottom: '16px' }}>
                  <FormVisualizer visualKey={selectedGuideEx.visualKey} exerciseId={selectedGuideEx.id} />
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
            </>
          )}
        </div>
      </div>
    </>
  );
}

  // Standard Plan Target View (Not Started)
  return (
    <div className="scrollable">
      {/* Top Welcome Title */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--gym-red)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {selectedDayIndex === todayIndex ? todayName : weekdays[selectedDayIndex]}
        </span>
        <h1 style={{ marginTop: '2px' }}>
          {selectedDayIndex === todayIndex ? "Today's Workout" : "Workout Preview"}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--shark-500)' }}>
          {selectedDayIndex === todayIndex 
            ? "Stay active, stay fit. Keep up the consistency!" 
            : `Previewing schedule for ${weekdays[selectedDayIndex]}.`}
        </p>
      </div>

      {/* Calendar Week Selector Strip */}
      <div className="calendar-strip">
        {currentPlan.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const isRealToday = todayIndex === idx;
          
          let statusIcon = '💪';
          if (day.completed) {
            statusIcon = '🏆';
          } else if (day.type === 'rest') {
            statusIcon = '💤';
          } else if (day.type === 'run') {
            statusIcon = '🏃‍♂️';
          }

          const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const dayLabel = dayLabels[idx];

          return (
            <button
              key={idx}
              onClick={() => setSelectedDayIndex(idx)}
              className={`calendar-day-btn ${isSelected ? 'selected' : ''}`}
            >
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--shark-400)',
                marginBottom: '4px',
                letterSpacing: '0.5px'
              }}>
                {dayLabel}
              </span>
              
              <span style={{
                fontSize: '16px',
                lineHeight: '1',
                marginBottom: isRealToday ? '2px' : '0'
              }}>
                {statusIcon}
              </span>

              {isRealToday && (
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: isSelected ? '#ffffff' : 'var(--gym-red)',
                  marginTop: '2px'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Today's Target Card */}
      {todayWorkout ? (
        <div>
          {todayWorkout.completed ? (
            /* Completed Workout Card */
            <div className="ios-card" style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 0 16px 0' }}>
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
              <p style={{ textAlign: 'center', marginBottom: '20px', maxWidth: '280px' }}>
                Awesome job! This session has been successfully logged to your history.
              </p>
              <div style={{ textAlign: 'center', color: 'var(--shark-500)', fontSize: '12px' }}>
                Check out your stats or download the CSV inside the **Stats** tab.
              </div>
            </div>
          ) : todayWorkout.type === 'rest' ? (

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
              {todayWorkout.type === 'run' ? (
                <div className="ios-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    backgroundColor: 'var(--gym-red-dim)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    🏃‍♂️
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '2px', fontWeight: 'bold', textTransform: 'none' }}>Interactive Cardio Tracker</h4>
                    <p style={{ fontSize: '12px', color: 'var(--shark-500)' }}>Log your activity type, duration, distance, and performance details.</p>
                  </div>
                </div>
              ) : (
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
                            {ex.sets ? ex.sets.length : ex.defaultSets} Sets x {ex.defaultReps} {ex.region === 'running' ? 'mins' : 'reps'}
                          </span>
                        </div>
                        <span className="badge badge-red" style={{ fontSize: '9px' }}>{ex.region}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

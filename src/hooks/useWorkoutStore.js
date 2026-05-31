import { useState, useEffect } from 'react';
import exercisesData from '../data/exercises.json';

export function useWorkoutStore() {
  // --- Core State Keys ---
  const [workoutHistory, setWorkoutHistory] = useState(() => {
    const saved = localStorage.getItem('ironflow_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [planConfig, setPlanConfig] = useState(() => {
    const saved = localStorage.getItem('ironflow_config');
    return saved ? JSON.parse(saved) : {
      liftDays: 4,
      runDays: 2,
      focusRegions: ['chest', 'back', 'bis', 'tris', 'shoulders', 'legs', 'abs']
    };
  });

  const [currentPlan, setCurrentPlan] = useState(() => {
    const saved = localStorage.getItem('ironflow_current_plan');
    return saved ? JSON.parse(saved) : null;
  });

  const [recentlyUsed, setRecentlyUsed] = useState(() => {
    const saved = localStorage.getItem('ironflow_recently_used');
    return saved ? JSON.parse(saved) : [];
  });

  const [regionRotationOffset, setRegionRotationOffset] = useState(() => {
    const saved = localStorage.getItem('ironflow_region_rotation');
    return saved ? parseInt(saved, 10) : 0;
  });

  // --- Sync State to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('ironflow_history', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem('ironflow_config', JSON.stringify(planConfig));
  }, [planConfig]);

  useEffect(() => {
    localStorage.setItem('ironflow_current_plan', JSON.stringify(currentPlan));
  }, [currentPlan]);

  useEffect(() => {
    localStorage.setItem('ironflow_recently_used', JSON.stringify(recentlyUsed));
  }, [recentlyUsed]);

  useEffect(() => {
    localStorage.setItem('ironflow_region_rotation', regionRotationOffset.toString());
  }, [regionRotationOffset]);

  // --- Helper: Get Past Performance for an Exercise ---
  const getExerciseStats = (exerciseId) => {
    const logs = workoutHistory.filter(log => log.exerciseId === exerciseId);
    if (logs.length === 0) return { last: null, pr: null };

    // Find PR (Max weight lifted for at least 1 completed rep)
    let prWeight = 0;
    let prReps = 0;
    let prDate = '';

    logs.forEach(log => {
      log.sets.forEach(set => {
        if (set.completed && set.weight > prWeight) {
          prWeight = set.weight;
          prReps = set.reps;
          prDate = log.date;
        }
      });
    });

    // Get the most recent performance
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastLog = sortedLogs[0];

    return {
      last: lastLog ? {
        date: lastLog.date,
        sets: lastLog.sets.filter(s => s.completed).map(s => `${s.weight} lbs x ${s.reps}`).join(', ')
      } : null,
      pr: prWeight > 0 ? {
        weight: prWeight,
        reps: prReps,
        date: prDate
      } : null
    };
  };

  // --- Plan Generator Logic ---
  const generateWeeklyPlan = () => {
    const { liftDays, runDays, focusRegions } = planConfig;
    
    // 1. Cap days to fit 7-day week
    const totalActiveDays = liftDays + runDays;
    let finalLiftDays = liftDays;
    let finalRunDays = runDays;
    if (totalActiveDays > 7) {
      // Prioritize lifting, scale down running
      finalRunDays = Math.max(0, 7 - liftDays);
    }
    const restDaysCount = 7 - (finalLiftDays + finalRunDays);

    // 2. Rotate Muscle Groups to vary week-over-week
    // Max 2 muscle groups per lift day, so we can hit at most 2 * finalLiftDays regions this week
    const maxRegionsThisWeek = finalLiftDays * 2;
    
    // Sort focus regions to ensure consistent base ordering, then rotate by offset
    const sortedFocusRegions = [...focusRegions].sort();
    const rotatedRegions = [];
    if (sortedFocusRegions.length > 0) {
      for (let i = 0; i < sortedFocusRegions.length; i++) {
        const index = (i + regionRotationOffset) % sortedFocusRegions.length;
        rotatedRegions.push(sortedFocusRegions[index]);
      }
    }

    // Select the subset of regions for this week's lifts
    const activeRegionsThisWeek = rotatedRegions.slice(0, maxRegionsThisWeek);

    // Group active regions into pairs (max 2 per day) for the lift days
    const dailyRegions = [];
    for (let i = 0; i < finalLiftDays; i++) {
      dailyRegions.push([]);
    }
    
    activeRegionsThisWeek.forEach((region, index) => {
      const dayIdx = index % finalLiftDays;
      dailyRegions[dayIdx].push(region);
    });

    // 3. Select Exercises (filtering out recently used to prevent fatigue)
    const newRecentlyUsed = [];
    const selectExercisesForDay = (regions) => {
      let dayExercises = [];
      const exercisesPerRegion = regions.length === 1 ? 5 : 3; // 5 if single region, 3 each if paired

      regions.forEach(region => {
        // Find all matching exercises in database
        const pool = exercisesData.filter(ex => ex.region === region);
        if (pool.length === 0) return;

        // Partition pool into not-recently-used and recently-used
        const freshPool = pool.filter(ex => !recentlyUsed.includes(ex.id));
        const fallbackPool = pool.filter(ex => recentlyUsed.includes(ex.id));

        // Shuffle pools
        const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);
        const shuffledFresh = shuffle(freshPool);
        const shuffledFallback = shuffle(fallbackPool);

        // Pick exercises
        let selected = shuffledFresh.slice(0, exercisesPerRegion);
        if (selected.length < exercisesPerRegion) {
          const needed = exercisesPerRegion - selected.length;
          selected = [...selected, ...shuffledFallback.slice(0, needed)];
        }

        selected.forEach(ex => {
          dayExercises.push({
            ...ex,
            sets: Array.from({ length: ex.defaultSets }, (_, i) => ({
              setNum: i + 1,
              weight: '',
              reps: ex.defaultReps,
              completed: false
            }))
          });
          newRecentlyUsed.push(ex.id);
        });
      });

      return dayExercises;
    };

    // 4. Select Running Workouts
    const runWorkouts = exercisesData.filter(ex => ex.region === 'running');
    const selectRunWorkout = (dayIdx) => {
      // Pick a running workout based on day index to vary types (Interval, Tempo, LISS, Recovery)
      const index = dayIdx % runWorkouts.length;
      const runEx = runWorkouts[index];
      return {
        ...runEx,
        sets: [{ setNum: 1, weight: 0, reps: runEx.defaultReps, completed: false }]
      };
    };

    // 5. Structure the 7-day schedule
    // Create an alternating array of slots: e.g. Lift, Run, Rest
    const dayTypes = [];
    let liftsLeft = finalLiftDays;
    let runsLeft = finalRunDays;
    let restLeft = restDaysCount;

    // Distribute slots to avoid back-to-back extremes (e.g. alternating lifts and runs)
    for (let i = 0; i < 7; i++) {
      if (liftsLeft > 0 && (i % 2 === 0 || runsLeft === 0)) {
        dayTypes.push('lift');
        liftsLeft--;
      } else if (runsLeft > 0) {
        dayTypes.push('run');
        runsLeft--;
      } else {
        dayTypes.push('rest');
        restLeft--;
      }
    }

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let liftDayCounter = 0;
    let runDayCounter = 0;

    const weeklyPlan = dayTypes.map((type, index) => {
      const dayName = weekdays[index];

      if (type === 'lift') {
        const regions = dailyRegions[liftDayCounter] || [];
        const exercises = selectExercisesForDay(regions);
        liftDayCounter++;
        return {
          dayIndex: index,
          dayName,
          type: 'lift',
          title: regions.map(r => r.toUpperCase()).join(' & '),
          regions,
          exercises,
          completed: false
        };
      } else if (type === 'run') {
        const runWorkout = selectRunWorkout(runDayCounter);
        runDayCounter++;
        return {
          dayIndex: index,
          dayName,
          type: 'run',
          title: runWorkout.name,
          description: runWorkout.description,
          exercises: [runWorkout],
          completed: false
        };
      } else {
        return {
          dayIndex: index,
          dayName,
          type: 'rest',
          title: 'Rest Day',
          description: 'Focus on stretching, hydration, and active recovery.',
          exercises: [],
          completed: false
        };
      }
    });

    // 6. Update state & offset for next week's generation
    setCurrentPlan(weeklyPlan);
    setRecentlyUsed(newRecentlyUsed);
    if (sortedFocusRegions.length > 0) {
      setRegionRotationOffset((prev) => (prev + maxRegionsThisWeek) % sortedFocusRegions.length);
    }
  };

  // --- Swap Exercise Option ---
  const getSwapAlternatives = (exerciseId, region) => {
    // Return all exercises in same muscle group EXCEPT the active one
    return exercisesData.filter(ex => ex.region === region && ex.id !== exerciseId);
  };

  const swapExercise = (dayIndex, oldExerciseId, alternativeEx) => {
    if (!currentPlan) return;

    const updatedPlan = currentPlan.map((day, dIdx) => {
      if (dIdx !== dayIndex) return day;

      const updatedExercises = day.exercises.map(ex => {
        if (ex.id !== oldExerciseId) return ex;
        
        // Return replacement exercise loaded with default empty sets matching target set count
        return {
          ...alternativeEx,
          sets: Array.from({ length: alternativeEx.defaultSets }, (_, i) => ({
            setNum: i + 1,
            weight: '',
            reps: alternativeEx.defaultReps,
            completed: false
          }))
        };
      });

      return {
        ...day,
        exercises: updatedExercises
      };
    });

    setCurrentPlan(updatedPlan);
  };

  // --- Complete Workout Logger ---
  const logWorkoutSession = (dayIndex, loggedExercises) => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local format
    
    // Append completed entries to history
    const newLogs = loggedExercises.map(ex => ({
      date: todayStr,
      exerciseId: ex.id,
      exerciseName: ex.name,
      region: ex.region,
      sets: ex.sets.map(s => ({
        setNum: s.setNum,
        weight: Number(s.weight) || 0,
        reps: Number(s.reps) || 0,
        completed: s.completed
      }))
    })).filter(log => log.sets.some(s => s.completed)); // Only log if at least 1 set was completed

    setWorkoutHistory(prev => [...prev, ...newLogs]);

    // Mark today's workout as completed in the active plan
    if (currentPlan) {
      const updatedPlan = currentPlan.map((day, idx) => {
        if (idx === dayIndex) {
          return { ...day, completed: true };
        }
        return day;
      });
      setCurrentPlan(updatedPlan);
    }
  };

  // --- CSV Exporter (RFC 4180 Standard) ---
  const exportHistoryCSV = () => {
    if (workoutHistory.length === 0) {
      alert("No logged performances to export yet!");
      return;
    }

    const headers = ['Date', 'Exercise Name', 'Region', 'Set Number', 'Weight (lbs)', 'Reps Completed'];
    const rows = [];

    workoutHistory.forEach(log => {
      log.sets.forEach(set => {
        if (set.completed) {
          // Quote strings to prevent comma breaking
          const safeName = `"${log.exerciseName.replace(/"/g, '""')}"`;
          rows.push([
            log.date,
            safeName,
            log.region,
            set.setNum,
            set.weight,
            set.reps
          ].join(','));
        }
      });
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gymmy_workout_history_${new Date().toLocaleDateString('en-CA')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    workoutHistory,
    planConfig,
    currentPlan,
    recentlyUsed,
    setPlanConfig,
    generateWeeklyPlan,
    getSwapAlternatives,
    swapExercise,
    logWorkoutSession,
    getExerciseStats,
    exportHistoryCSV
  };
}

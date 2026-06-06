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
    const defaults = {
      liftDays: 4,
      runDays: 2,
      focusRegions: ['chest', 'back', 'bis', 'tris', 'shoulders', 'legs', 'abs'],
      defaultLiftDuration: 45
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
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

  const [activeSession, setActiveSession] = useState(() => {
    const saved = localStorage.getItem('ironflow_active_session');
    return saved ? JSON.parse(saved) : null;
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

  useEffect(() => {
    if (activeSession === null) {
      localStorage.removeItem('ironflow_active_session');
    } else {
      localStorage.setItem('ironflow_active_session', JSON.stringify(activeSession));
    }
  }, [activeSession]);


  // --- Helper: Get Past Performance for an Exercise ---
  const getExerciseStats = (exerciseId) => {
    const logs = workoutHistory.filter(log => log.exerciseId === exerciseId);
    if (logs.length === 0) {
      // Find a comparable exercise in the same region, preferably same visualKey
      const targetEx = exercisesData.find(ex => ex.id === exerciseId);
      if (!targetEx) return { last: null, pr: null, isComparable: false };
      
      const regionLogs = workoutHistory.filter(log => log.region === targetEx.region && !log.isCardio);
      if (regionLogs.length > 0) {
        const samePatternLogs = regionLogs.filter(log => {
          const exDetail = exercisesData.find(e => e.id === log.exerciseId);
          return exDetail && exDetail.visualKey === targetEx.visualKey;
        });
        
        const candidateLogs = samePatternLogs.length > 0 ? samePatternLogs : regionLogs;
        // Sort candidateLogs by date descending to find the most recent
        const sortedCandidates = [...candidateLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
        const mostRecentLog = sortedCandidates[0];
        
        if (mostRecentLog) {
          // Compute stats for the comparable exercise
          const compLogs = workoutHistory.filter(log => log.exerciseId === mostRecentLog.exerciseId);
          if (compLogs.length > 0) {
            let prWeight = 0;
            let prReps = 0;
            let prDate = '';
            compLogs.forEach(log => {
              log.sets.forEach(set => {
                if (set.completed && set.weight > prWeight) {
                  prWeight = set.weight;
                  prReps = set.reps;
                  prDate = log.date;
                }
              });
            });
            const sortedCompLogs = [...compLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
            const lastLog = sortedCompLogs[0];
            
            return {
              last: lastLog ? {
                date: lastLog.date,
                sets: lastLog.sets.filter(s => s.completed).map(s => `${s.weight} lbs x ${s.reps}`).join(', ')
              } : null,
              pr: prWeight > 0 ? {
                weight: prWeight,
                reps: prReps,
                date: prDate
              } : null,
              isComparable: true,
              comparableName: mostRecentLog.exerciseName
            };
          }
        }
      }
      return { last: null, pr: null, isComparable: false };
    }

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
      } : null,
      isComparable: false
    };
  };

  // --- Plan Generator Duration-to-Exercise Config Mapping ---
  const durationToExerciseConfig = (duration) => {
    switch (duration) {
      case 15: return { exercises: 2, sets: 3 };
      case 30: return { exercises: 4, sets: 3 };
      case 45: return { exercises: 5, sets: null }; // use defaultSets
      case 60: return { exercises: 6, sets: null };
      case 75: return { exercises: 8, sets: null };
      case 90: return { exercises: 10, sets: null };
      default: return { exercises: 5, sets: null };
    }
  };

  // --- Plan Generator Logic ---
  const generateWeeklyPlan = () => {
    const { liftDays, runDays, focusRegions, defaultLiftDuration } = planConfig;
    
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
    const selectExercisesForDay = (regions, durationMins) => {
      let dayExercises = [];
      const config = durationToExerciseConfig(durationMins);
      const totalExercisesToSelect = config.exercises;
      
      const baseCount = Math.floor(totalExercisesToSelect / regions.length);
      const remainder = totalExercisesToSelect % regions.length;

      regions.forEach((region, rIdx) => {
        const exercisesPerRegion = baseCount + (rIdx < remainder ? 1 : 0);
        if (exercisesPerRegion <= 0) return;

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
          const setsCount = config.sets || ex.defaultSets || 3;
          dayExercises.push({
            ...ex,
            sets: Array.from({ length: setsCount }, (_, i) => ({
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
        const duration = defaultLiftDuration || 45;
        const exercises = selectExercisesForDay(regions, duration);
        liftDayCounter++;
        return {
          dayIndex: index,
          dayName,
          type: 'lift',
          title: regions.map(r => r.toUpperCase()).join(' & '),
          regions,
          exercises,
          duration,
          completed: false
        };
      } else if (type === 'run') {
        runDayCounter++;
        const duration = 30;
        return {
          dayIndex: index,
          dayName,
          type: 'run',
          title: 'Cardio - Run/Bike',
          description: 'Custom cardio session: input activity, duration, and details.',
          exercises: [{
            id: 'cardio_session',
            name: 'Cardio - Run/Bike',
            region: 'running',
            category: 'cardio',
            visualKey: 'run',
            defaultSets: 1,
            defaultReps: duration,
            description: 'Run, cycle, or other aerobic exercises.',
            instructions: ['Warm up for 5 mins.', 'Perform activity at desired pace.', 'Log your details.']
          }],
          duration,
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
          duration: 0,
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

  // --- Change Specific Day Workout Duration (Resizing exercise list) ---
  const changeDayDuration = (dayIndex, direction) => {
    if (!currentPlan) return;

    const durationsList = [15, 30, 45, 60, 75, 90];

    const updatedPlan = currentPlan.map((day, idx) => {
      if (idx !== dayIndex) return day;

      const currentDur = day.duration || (day.type === 'run' ? 30 : 45);
      let newDur = currentDur;
      const curIdx = durationsList.indexOf(currentDur);

      if (direction === 'increase') {
        if (curIdx < durationsList.length - 1) {
          newDur = durationsList[curIdx + 1];
        }
      } else {
        if (curIdx > 0) {
          newDur = durationsList[curIdx - 1];
        }
      }

      if (newDur === currentDur) return day; // no change

      if (day.type === 'run') {
        // Update cardio time
        const updatedExercises = day.exercises.map(ex => {
          if (ex.id === 'cardio_session') {
            return {
              ...ex,
              defaultReps: newDur,
              sets: [{ ...ex.sets[0], reps: newDur }]
            };
          }
          return ex;
        });

        return {
          ...day,
          duration: newDur,
          exercises: updatedExercises
        };
      } else if (day.type === 'lift') {
        // Update lift exercises count and sets
        const config = durationToExerciseConfig(newDur);
        const targetCount = config.exercises;
        const setsCount = config.sets; // if null, use defaultSets

        let updatedExercises = [...day.exercises];
        if (updatedExercises.length > targetCount) {
          // Slice exercises to target count
          updatedExercises = updatedExercises.slice(0, targetCount);
        } else if (updatedExercises.length < targetCount) {
          // Add new exercises
          const needed = targetCount - updatedExercises.length;
          
          // Determine muscle regions for this day
          const regions = day.regions || [];
          if (regions.length > 0) {
            // Find exercises in these regions that aren't already included
            const existingIds = updatedExercises.map(ex => ex.id);
            const pool = exercisesData.filter(ex => regions.includes(ex.region) && !existingIds.includes(ex.id));
            
            // Shuffle pool
            const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
            const selected = shuffledPool.slice(0, needed);
            
            selected.forEach(ex => {
              const targetSets = setsCount || ex.defaultSets || 3;
              updatedExercises.push({
                ...ex,
                sets: Array.from({ length: targetSets }, (_, i) => ({
                  setNum: i + 1,
                  weight: '',
                  reps: ex.defaultReps,
                  completed: false
                }))
              });
            });
          }
        }

        // Adjust sets count for ALL exercises to match the new duration's target set count (e.g. 3 sets for 30m/15m)
        if (setsCount !== null) {
          updatedExercises = updatedExercises.map(ex => {
            if (ex.sets.length === setsCount) return ex;
            return {
              ...ex,
              sets: Array.from({ length: setsCount }, (_, i) => {
                const existingSet = ex.sets[i];
                return {
                  setNum: i + 1,
                  weight: existingSet ? existingSet.weight : '',
                  reps: existingSet ? existingSet.reps : ex.defaultReps,
                  completed: existingSet ? existingSet.completed : false
                };
              })
            };
          });
        } else {
          // Restore to exercise's default sets if duration is 45m or higher and sets were previously scaled to 3
          updatedExercises = updatedExercises.map(ex => {
            const targetSets = ex.defaultSets || 4;
            if (ex.sets.length === targetSets) return ex;
            return {
              ...ex,
              sets: Array.from({ length: targetSets }, (_, i) => {
                const existingSet = ex.sets[i];
                return {
                  setNum: i + 1,
                  weight: existingSet ? existingSet.weight : '',
                  reps: existingSet ? existingSet.reps : ex.defaultReps,
                  completed: existingSet ? existingSet.completed : false
                };
              })
            };
          });
        }

        return {
          ...day,
          duration: newDur,
          exercises: updatedExercises
        };
      }

      return day;
    });

    setCurrentPlan(updatedPlan);
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
  const logWorkoutSession = (dayIndex, loggedExercises, durationSeconds) => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local format
    const durationMins = durationSeconds ? Math.round(durationSeconds / 60) : 0;
    
    // Append completed entries to history
    const newLogs = loggedExercises.map(ex => ({
      date: todayStr,
      exerciseId: ex.id,
      exerciseName: ex.name,
      region: ex.region,
      sessionDuration: durationMins,
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

  // --- Complete Cardio Logger ---
  const logCardioSession = (dayIndex, cardioType, duration, distance, notes) => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    
    const cardioLog = {
      date: todayStr,
      exerciseId: 'cardio_session',
      exerciseName: `Cardio (${cardioType})`,
      region: 'running',
      isCardio: true,
      cardioType,
      duration: Number(duration) || 0,
      distance: Number(distance) || 0,
      notes: notes || "",
      sets: []
    };

    setWorkoutHistory(prev => [...prev, cardioLog]);

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

    const headers = ['Date', 'Exercise Name', 'Region', 'Set Number', 'Weight (lbs)', 'Reps Completed', 'Cardio Type', 'Duration (mins)', 'Distance (miles)', 'Notes'];
    const rows = [];

    workoutHistory.forEach(log => {
      if (log.isCardio) {
        const safeName = `"${log.exerciseName.replace(/"/g, '""')}"`;
        const safeNotes = `"${(log.notes || '').replace(/"/g, '""')}"`;
        rows.push([
          log.date,
          safeName,
          log.region,
          1,
          '',
          '',
          log.cardioType,
          log.duration,
          log.distance,
          safeNotes
        ].join(','));
      } else {
        log.sets.forEach(set => {
          if (set.completed) {
            const safeName = `"${log.exerciseName.replace(/"/g, '""')}"`;
            rows.push([
              log.date,
              safeName,
              log.region,
              set.setNum,
              set.weight,
              set.reps,
              '',
              log.sessionDuration || '',
              '',
              ''
            ].join(','));
          }
        });
      }
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

  // --- CSV Importer ---
  const importHistoryCSV = (csvText) => {
    try {
      const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) return { success: false, message: "CSV file is empty." };

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const dateIdx = headers.indexOf('date');
      const nameIdx = headers.indexOf('exercise name');
      const regionIdx = headers.indexOf('region');
      const setIdx = headers.indexOf('set number');
      const weightIdx = headers.indexOf('weight (lbs)');
      const repsIdx = headers.indexOf('reps completed');
      
      // Cardio indexes
      const cardioTypeIdx = headers.indexOf('cardio type');
      const durationIdx = headers.indexOf('duration (mins)');
      const distanceIdx = headers.indexOf('distance (miles)');
      const notesIdx = headers.indexOf('notes');

      if (dateIdx === -1 || nameIdx === -1 || setIdx === -1 || weightIdx === -1 || repsIdx === -1) {
        return { success: false, message: "Invalid CSV headers. Must match exported headers." };
      }

      const tempHistory = {};

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        let cols = [];
        let inQuotes = false;
        let currentCol = "";
        for (let charIdx = 0; charIdx < line.length; charIdx++) {
          const char = line[charIdx];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cols.push(currentCol.trim());
            currentCol = "";
          } else {
            currentCol += char;
          }
        }
        cols.push(currentCol.trim());

        if (cols.length < headers.length) continue;

        const date = cols[dateIdx];
        const exerciseName = cols[nameIdx].replace(/^"|"$/g, '');
        const region = regionIdx !== -1 ? cols[regionIdx] : 'chest';
        
        const isCardio = cardioTypeIdx !== -1 && cols[cardioTypeIdx] !== '';

        if (isCardio) {
          const cardioType = cols[cardioTypeIdx];
          const duration = parseFloat(cols[durationIdx]) || 0;
          const distance = parseFloat(cols[distanceIdx]) || 0;
          const notes = notesIdx !== -1 ? cols[notesIdx].replace(/^"|"$/g, '') : '';

          const key = `${date}_cardio_${cardioType.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
          tempHistory[key] = {
            date,
            exerciseId: 'cardio_session',
            exerciseName,
            region,
            isCardio: true,
            cardioType,
            duration,
            distance,
            notes,
            sets: []
          };
        } else {
          const setNum = parseInt(cols[setIdx], 10);
          const weight = parseFloat(cols[weightIdx]);
          const reps = parseInt(cols[repsIdx], 10);
          const duration = durationIdx !== -1 ? parseInt(cols[durationIdx], 10) || 0 : 0;

          if (isNaN(setNum) || isNaN(weight) || isNaN(reps)) continue;

          const matchedEx = exercisesData.find(ex => ex.name.toLowerCase() === exerciseName.toLowerCase());
          const exerciseId = matchedEx ? matchedEx.id : exerciseName.toLowerCase().replace(/[^a-z0-9]+/g, '_');

          const key = `${date}_${exerciseId}`;
          if (!tempHistory[key]) {
            tempHistory[key] = {
              date,
              exerciseId,
              exerciseName,
              region,
              sessionDuration: duration,
              sets: []
            };
          }

          tempHistory[key].sets.push({
            setNum,
            weight,
            reps,
            completed: true
          });
        }
      }

      const parsedLogs = Object.values(tempHistory);
      if (parsedLogs.length === 0) {
        return { success: false, message: "No valid logs parsed from CSV." };
      }

      setWorkoutHistory(prev => {
        const merged = [...prev];
        parsedLogs.forEach(newLog => {
          // Unique keys for merging logs cleanly
          const dupIdx = merged.findIndex(existing => {
            if (existing.date !== newLog.date) return false;
            if (existing.isCardio && newLog.isCardio) {
              return existing.cardioType === newLog.cardioType;
            }
            return existing.exerciseId === newLog.exerciseId;
          });
          if (dupIdx !== -1) {
            merged[dupIdx] = newLog;
          } else {
            merged.push(newLog);
          }
        });
        return merged.sort((a, b) => new Date(a.date) - new Date(b.date));
      });

      return { success: true, message: `Successfully imported ${parsedLogs.length} logs!` };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Error parsing CSV file." };
    }
  };

  // --- Swap Days Option ---
  const swapDays = (idx1, idx2) => {
    if (!currentPlan) return;
    const updatedPlan = [...currentPlan];
    
    // Swap everything except dayIndex and dayName
    const temp = {
      type: updatedPlan[idx1].type,
      title: updatedPlan[idx1].title,
      regions: updatedPlan[idx1].regions,
      exercises: updatedPlan[idx1].exercises,
      description: updatedPlan[idx1].description,
      completed: updatedPlan[idx1].completed
    };

    updatedPlan[idx1] = {
      ...updatedPlan[idx1],
      type: updatedPlan[idx2].type,
      title: updatedPlan[idx2].title,
      regions: updatedPlan[idx2].regions,
      exercises: updatedPlan[idx2].exercises,
      description: updatedPlan[idx2].description,
      completed: updatedPlan[idx2].completed
    };

    updatedPlan[idx2] = {
      ...updatedPlan[idx2],
      ...temp
    };

    setCurrentPlan(updatedPlan);
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
    logCardioSession,
    getExerciseStats,
    exportHistoryCSV,
    importHistoryCSV,
    swapDays,
    activeSession,
    setActiveSession,
    changeDayDuration
  };
}

import React, { useRef } from 'react';
import { Download, Upload, Calendar, Activity, BarChart2, Flame } from 'lucide-react';

export default function StatsDashboard({ store }) {
  const { workoutHistory, exportHistoryCSV, importHistoryCSV } = store;
  const fileInputRef = useRef(null);

  // Compute stats
  const totalWorkouts = new Set(workoutHistory.map(log => log.date)).size;
  
  const totalSets = workoutHistory.reduce((sum, log) => {
    return sum + log.sets.filter(s => s.completed).length;
  }, 0);

  const uniqueExercises = new Set(workoutHistory.map(log => log.exerciseId)).size;

  // Group workout history by date
  const groupedHistory = {};
  workoutHistory.forEach(log => {
    if (!groupedHistory[log.date]) {
      groupedHistory[log.date] = [];
    }
    groupedHistory[log.date].push(log);
  });

  // Sort dates descending
  const sortedDates = Object.keys(groupedHistory).sort((a, b) => new Date(b) - new Date(a));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const res = importHistoryCSV(text);
      alert(res.message);
      // Reset input value to allow uploading same file again
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="scrollable">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px'
      }}>
        <div style={{ marginRight: '10px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity color="var(--gym-red)" size={26} />
            Stats & History
          </h1>
          <p>Review your training achievements and manage logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {/* Hidden file input */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="ios-btn"
            style={{
              width: 'auto',
              padding: '8px 12px',
              fontSize: '13px',
              backgroundColor: 'var(--shark-800)',
              color: 'var(--shark-100)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px'
            }}
            title="Import History from CSV"
          >
            <Upload size={14} />
            Import
          </button>
          <button
            onClick={exportHistoryCSV}
            className="ios-btn"
            style={{
              width: 'auto',
              padding: '8px 12px',
              fontSize: '13px',
              backgroundColor: 'var(--gym-gold-dim)',
              color: 'var(--gym-gold)',
              border: '1px solid rgba(255, 204, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px'
            }}
            title="Export History to CSV"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div className="ios-card" style={{ padding: '12px', textAlign: 'center', margin: '0' }}>
          <Flame size={20} color="var(--gym-red)" style={{ margin: '0 auto 6px auto' }} />
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{totalWorkouts}</div>
          <div style={{ fontSize: '10px', color: 'var(--shark-500)', textTransform: 'uppercase' }}>Sessions</div>
        </div>
        <div className="ios-card" style={{ padding: '12px', textAlign: 'center', margin: '0' }}>
          <BarChart2 size={20} color="var(--gym-gold)" style={{ margin: '0 auto 6px auto' }} />
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{totalSets}</div>
          <div style={{ fontSize: '10px', color: 'var(--shark-500)', textTransform: 'uppercase' }}>Total Sets</div>
        </div>
        <div className="ios-card" style={{ padding: '12px', textAlign: 'center', margin: '0' }}>
          <Calendar size={20} color="#34c759" style={{ margin: '0 auto 6px auto' }} />
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{uniqueExercises}</div>
          <div style={{ fontSize: '10px', color: 'var(--shark-500)', textTransform: 'uppercase' }}>Movements</div>
        </div>
      </div>

      {/* History Log Timeline */}
      <div>
        <h3 style={{ marginBottom: '12px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '6px' }}>
          Performance Feed
        </h3>

        {sortedDates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--shark-500)' }}>
            <Activity size={32} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
            <p>Your logged workouts will appear here.</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Start a workout on the Today tab and complete sets to record stats.</p>
          </div>
        ) : (
          sortedDates.map(date => {
            const sessions = groupedHistory[date];
            // Format date nicely
            const d = new Date(date + 'T00:00:00');
            const formattedDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div key={date} style={{ marginBottom: '16px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--shark-500)',
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>
                  {formattedDate}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sessions.map((log, idx) => (
                    <div
                      key={`${log.exerciseId}-${idx}`}
                      style={{
                        backgroundColor: 'var(--shark-800)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '10px',
                        padding: '12px 14px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{log.exerciseName}</span>
                        <span className="badge badge-red" style={{ fontSize: '9px' }}>{log.region}</span>
                      </div>
                      
                      {/* Sets list */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {log.sets.map((set, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              backgroundColor: 'var(--shark-700)',
                              fontSize: '12px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--glass-border)'
                            }}
                          >
                            Set {set.setNum}: <strong style={{ color: 'var(--shark-100)' }}>{set.weight} lbs</strong> x {set.reps}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

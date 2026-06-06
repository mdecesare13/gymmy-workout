import React, { useState } from 'react';
import exercisesData from '../data/exercises.json';
import FormVisualizer from './FormVisualizer';
import { Search, ChevronDown, ChevronRight, X, BookOpen } from 'lucide-react';

export default function ExerciseLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRegion, setExpandedRegion] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const regions = [
    { id: 'chest', name: 'Chest' },
    { id: 'back', name: 'Back' },
    { id: 'bis', name: 'Biceps' },
    { id: 'tris', name: 'Triceps' },
    { id: 'shoulders', name: 'Shoulders' },
    { id: 'legs', name: 'Legs' },
    { id: 'abs', name: 'Abs' },
    { id: 'forearms', name: 'Forearms' }
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const toggleRegion = (regionId) => {
    setExpandedRegion(prev => (prev === regionId ? null : regionId));
  };

  // Filter exercises
  const filteredExercises = exercisesData.filter(ex => {
    const matchesQuery = ex.name.toLowerCase().includes(searchQuery) ||
                         ex.description.toLowerCase().includes(searchQuery);
    return matchesQuery;
  });

  // Group exercises by region
  const getExercisesByRegion = (regionId) => {
    return filteredExercises.filter(ex => ex.region === regionId);
  };

  return (
    <>
      <div className="scrollable">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen color="var(--gym-red)" size={26} />
          Exercise Library
        </h1>
        <p>Browse movements, read form instructions, and view SVG motion animations.</p>
      </div>

      {/* iOS Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--shark-800)',
        borderRadius: '10px',
        padding: '8px 12px',
        marginBottom: '20px',
        border: '1px solid var(--glass-border)',
        position: 'relative'
      }}>
        <Search color="var(--shark-500)" size={18} style={{ marginRight: '8px' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search exercises..."
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--shark-100)',
            fontSize: '15px',
            width: '100%'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--shark-500)'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* If Searching, show plain flat list of results */}
      {searchQuery ? (
        <div>
          <h3 style={{ marginBottom: '12px' }}>Search Results ({filteredExercises.length})</h3>
          {filteredExercises.length === 0 ? (
            <p style={{ textAlign: 'center', margin: '40px 0' }}>No exercises found matching "{searchQuery}".</p>
          ) : (
            filteredExercises.map(ex => (
              <div
                key={ex.id}
                className="ios-card"
                onClick={() => setSelectedExercise(ex)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px',
                  marginBottom: '8px'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{ex.name}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--gym-red)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {ex.region}
                  </span>
                </div>
                <ChevronRight size={18} color="var(--shark-500)" />
              </div>
            ))
          )}
        </div>
      ) : (
        /* Default Region Accordion List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {regions.map(region => {
            const count = getExercisesByRegion(region.id).length;
            const isExpanded = expandedRegion === region.id;
            const items = getExercisesByRegion(region.id);

            return (
              <div
                key={region.id}
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--shark-800)',
                  border: '1px solid var(--glass-border)'
                }}
              >
                {/* Header */}
                <button
                  onClick={() => toggleRegion(region.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '16px',
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--shark-100)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {region.name}
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--shark-500)',
                      backgroundColor: 'var(--shark-700)',
                      padding: '2px 6px',
                      borderRadius: '8px'
                    }}>
                      {count}
                    </span>
                  </span>
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>

                {/* Exercises list inside expanded region */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--glass-border)', padding: '4px' }}>
                    {items.map(ex => (
                      <button
                        key={ex.id}
                        onClick={() => setSelectedExercise(ex)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '12px 12px',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          outline: 'none',
                          color: 'var(--shark-300)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '14px',
                          transition: 'color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                        onMouseLeave={(e) => e.target.style.color = 'var(--shark-300)'}
                      >
                        {ex.name}
                        <ChevronRight size={16} color="var(--shark-600)" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      </div>

      {/* --- Slide-Up Detail Modal Sheet --- */}
      <div className={`ios-sheet-backdrop ${selectedExercise ? 'active' : ''}`} onClick={() => setSelectedExercise(null)}>
        <div
          className={`ios-sheet ${selectedExercise ? 'active' : ''}`}
          onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
        >
          <div className="ios-sheet-handle" />
          
          {selectedExercise && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span className="badge badge-red" style={{ marginBottom: '6px' }}>
                    {selectedExercise.region}
                  </span>
                  <h2 style={{ marginBottom: '4px' }}>{selectedExercise.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  style={{
                    backgroundColor: 'var(--shark-700)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--shark-300)'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="ios-sheet-body">
                {/* Dynamic SVGs Form Guide Animator */}
                <div style={{ marginBottom: '20px' }}>
                  <FormVisualizer visualKey={selectedExercise.visualKey} />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '12px', color: 'var(--shark-500)' }}>Description</h3>
                  <p style={{ fontSize: '14px', color: 'var(--shark-100)' }}>{selectedExercise.description}</p>
                </div>

                {/* Instructions */}
                <div>
                  <h3 style={{ fontSize: '12px', color: 'var(--shark-500)', marginBottom: '8px' }}>Execution Cues</h3>
                  <ol style={{ paddingLeft: '20px', color: 'var(--shark-300)', fontSize: '14px', lineHeight: '1.5' }}>
                    {selectedExercise.instructions.map((inst, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>{inst}</li>
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

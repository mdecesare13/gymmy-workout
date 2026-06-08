import React, { useState, useEffect } from 'react';

export default function FormVisualizer({ visualKey, exerciseId }) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Generate a prioritized list of local media URLs to try loading
  const getSources = (exId, vKey) => {
    const list = [];
    if (exId) {
      list.push({ url: `/assets/exercises/${exId}.mp4`, type: 'video' });
      list.push({ url: `/assets/exercises/${exId}.webm`, type: 'video' });
      list.push({ url: `/assets/exercises/${exId}.gif`, type: 'image' });
      list.push({ url: `/assets/exercises/${exId}.jpg`, type: 'image' });
    }
    if (vKey) {
      list.push({ url: `/assets/exercises/${vKey}.mp4`, type: 'video' });
      list.push({ url: `/assets/exercises/${vKey}.webm`, type: 'video' });
      list.push({ url: `/assets/exercises/${vKey}.gif`, type: 'image' });
      list.push({ url: `/assets/exercises/${vKey}.jpg`, type: 'image' });
    }
    return list;
  };

  const sources = getSources(exerciseId, visualKey);

  // Reset error states when exerciseId or visualKey changes
  useEffect(() => {
    setMediaIndex(0);
    setHasError(sources.length === 0);
  }, [visualKey, exerciseId]);

  const handleMediaError = () => {
    if (mediaIndex + 1 < sources.length) {
      setMediaIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  // Inline Styles
  const containerStyle = {
    width: '100%',
    height: '200px',
    backgroundColor: 'var(--shark-950)',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative'
  };

  const customMediaBadgeStyle = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#10b981', // Emerald green
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: '3px 6px',
    borderRadius: '4px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    backdropFilter: 'blur(4px)',
    zIndex: 10
  };

  const blueprintBadgeStyle = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    fontSize: '9px',
    fontWeight: 'bold',
    color: 'var(--gym-red)', // Gym red
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: '3px 6px',
    borderRadius: '4px',
    border: '1px solid rgba(255, 75, 75, 0.3)',
    backdropFilter: 'blur(4px)',
    zIndex: 10
  };

  // Render video or image demo if media loads successfully
  if (!hasError && sources.length > 0) {
    const currentSource = sources[mediaIndex];
    if (currentSource.type === 'video') {
      return (
        <div style={containerStyle}>
          <video
            src={currentSource.url}
            autoPlay
            loop
            muted
            playsInline
            onError={handleMediaError}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={customMediaBadgeStyle}>
            Demo Video
          </div>
        </div>
      );
    } else if (currentSource.type === 'image') {
      return (
        <div style={containerStyle}>
          <img
            src={currentSource.url}
            onError={handleMediaError}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt={visualKey || 'Exercise Demonstration'}
          />
          <div style={customMediaBadgeStyle}>
            Demo
          </div>
</div>
      );
    }
  }

  // Render premium kinetic fallback SVG
  const renderKineticSVG = () => {
    switch (visualKey) {
      case 'press':
      case 'incline_press':
        return (
          <>
            {/* Bench Support lines */}
            <rect x="130" y="105" width="140" height="8" rx="2" fill="var(--shark-700)" stroke="var(--shark-600)" strokeWidth="1" />
            <line x1="160" y1="113" x2="160" y2="135" stroke="var(--shark-700)" strokeWidth="4" />
            <line x1="240" y1="113" x2="240" y2="135" stroke="var(--shark-700)" strokeWidth="4" />
            <line x1="200" y1="105" x2="200" y2="72" stroke="var(--shark-600)" strokeWidth="3" />
            
            {/* Barbell moving vertically */}
            <g style={{ transformOrigin: '200px 80px', animation: 'pressBarbell 3s ease-in-out infinite' }}>
              <line x1="100" y1="80" x2="300" y2="80" stroke="#e5e7eb" strokeWidth="3.5" />
              <line x1="130" y1="76" x2="130" y2="84" stroke="#e5e7eb" strokeWidth="3" />
              <line x1="270" y1="76" x2="270" y2="84" stroke="#e5e7eb" strokeWidth="3" />
              <rect x="110" y="65" width="8" height="30" rx="2" fill="url(#goldGrad)" />
              <rect x="282" y="65" width="8" height="30" rx="2" fill="url(#goldGrad)" />
              <rect x="120" y="68" width="8" height="24" rx="2" fill="url(#goldGrad)" />
              <rect x="272" y="68" width="8" height="24" rx="2" fill="url(#goldGrad)" />
              <circle cx="170" cy="80" r="3.5" fill="var(--gym-red)" />
              <circle cx="230" cy="80" r="3.5" fill="var(--gym-red)" />
            </g>

            {/* Path Arrows */}
            <path d="M 85 95 L 85 45 M 81 55 L 85 45 L 89 55" stroke="var(--gym-red)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'arrowPulse 3s infinite' }} />
            <path d="M 315 45 L 315 95 M 311 85 L 315 95 L 319 85" stroke="var(--shark-500)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'arrowPulse 3s infinite', animationDelay: '1.5s' }} />
            
            <text x="200" y="35" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">VERTICAL PRESS PATH</text>
          </>
        );

      case 'fly':
        return (
          <>
            {/* Torso outline */}
            <circle cx="200" cy="95" r="26" fill="var(--shark-800)" stroke="var(--shark-600)" strokeWidth="2" />
            <circle cx="200" cy="95" r="18" fill="none" stroke="url(#redGrad)" strokeWidth="2" style={{ animation: 'coreGlow 2s infinite' }} filter="url(#glow)" />
            
            {/* Guide Arc */}
            <path d="M 110 90 A 50 50 0 0 1 155 45" stroke="var(--shark-700)" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
            <path d="M 290 90 A 50 50 0 0 0 245 45" stroke="var(--shark-700)" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />

            {/* Arms sweeping wide to center */}
            <g style={{ transformOrigin: '160px 95px', animation: 'flyLeft 3.2s ease-in-out infinite' }}>
              <line x1="160" y1="95" x2="110" y2="95" stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
              <rect x="100" y="83" width="8" height="24" rx="2" fill="url(#goldGrad)" />
              <line x1="104" y1="81" x2="104" y2="109" stroke="#e5e7eb" strokeWidth="2" />
              <circle cx="130" cy="95" r="3" fill="var(--gym-red)" />
            </g>

            <g style={{ transformOrigin: '240px 95px', animation: 'flyRight 3.2s ease-in-out infinite' }}>
              <line x1="240" y1="95" x2="290" y2="95" stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
              <rect x="292" y="83" width="8" height="24" rx="2" fill="url(#goldGrad)" />
              <line x1="296" y1="81" x2="296" y2="109" stroke="#e5e7eb" strokeWidth="2" />
              <circle cx="270" cy="95" r="3" fill="var(--gym-red)" />
            </g>

            <text x="200" y="35" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">CHEST FLY SWEEP</text>
          </>
        );

      case 'curl':
        return (
          <>
            {/* Static upper arm */}
            <line x1="230" y1="70" x2="185" y2="105" stroke="var(--shark-700)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="230" cy="70" r="5" fill="var(--shark-600)" />
            
            {/* Bicep muscle glow */}
            <path d="M 230 70 Q 200 70 185 105" fill="none" stroke="url(#redGrad)" strokeWidth="4.5" style={{ animation: 'coreGlow 2.5s infinite' }} filter="url(#glow)" />
            
            {/* Forearm curling */}
            <g style={{ transformOrigin: '185px 105px', animation: 'bicepCurl 2.8s ease-in-out infinite' }}>
              <line x1="185" y1="105" x2="115" y2="105" stroke="#e5e7eb" strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="115" cy="105" r="4.5" fill="var(--gym-red)" />
              <line x1="115" y1="91" x2="115" y2="119" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
              <circle cx="115" cy="91" r="6" fill="url(#goldGrad)" />
              <circle cx="115" cy="119" r="6" fill="url(#goldGrad)" />
            </g>

            {/* Elbow Hinge Joint */}
            <circle cx="185" cy="105" r="4.5" fill="var(--shark-500)" />
            
            {/* Arc guide */}
            <path d="M 115 105 A 70 70 0 0 1 190 40" stroke="var(--shark-750)" strokeWidth="1.5" strokeDasharray="3,3" fill="none" strokeLinecap="round" />
            
            <text x="200" y="35" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">BICEP CONTRACTION ARC</text>
          </>
        );

      case 'extension':
        return (
          <>
            {/* Pulley Structure */}
            <circle cx="200" cy="45" r="10" fill="var(--shark-750)" stroke="var(--shark-600)" strokeWidth="2" />
            <line x1="200" y1="35" x2="200" y2="20" stroke="var(--shark-600)" strokeWidth="3" />
            <line x1="200" y1="45" x2="200" y2="65" stroke="var(--shark-600)" strokeWidth="1.5" />
            
            {/* Cable / Handle */}
            <g style={{ animation: 'tricepExtend 2.6s ease-in-out infinite' }}>
              <line x1="200" y1="65" x2="200" y2="105" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="2,2" style={{ animation: 'tricepCable 2.6s linear infinite' }} />
              <path d="M 185 110 Q 200 104 215 110" fill="none" stroke="url(#goldGrad)" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="185" cy="110" r="3" fill="url(#goldGrad)" />
              <circle cx="215" cy="110" r="3" fill="url(#goldGrad)" />
              <circle cx="200" cy="107" r="4.5" fill="var(--gym-red)" />
            </g>

            {/* Tricep muscle guide */}
            <path d="M 175 60 Q 162 82 173 98" fill="none" stroke="url(#redGrad)" strokeWidth="3.5" opacity="0.8" style={{ animation: 'coreGlow 2.6s infinite' }} filter="url(#glow)" />
            
            <text x="200" y="145" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">TRICEP EXTENSION PATH</text>
          </>
        );

      case 'squat':
        return (
          <>
            {/* Squat Cage Line Grid */}
            <line x1="140" y1="35" x2="140" y2="135" stroke="var(--shark-750)" strokeWidth="3.5" />
            <line x1="260" y1="35" x2="260" y2="135" stroke="var(--shark-750)" strokeWidth="3.5" />
            <line x1="110" y1="135" x2="290" y2="135" stroke="var(--shark-700)" strokeWidth="4.5" />
            
            {/* Barbell moving vertically */}
            <g style={{ animation: 'squatMove 3.2s ease-in-out infinite' }}>
              <line x1="110" y1="65" x2="290" y2="65" stroke="#e5e7eb" strokeWidth="3.5" />
              <rect x="115" y="50" width="8" height="30" rx="1.5" fill="url(#goldGrad)" />
              <rect x="123" y="53" width="6" height="24" rx="1" fill="url(#goldGrad)" />
              <rect x="277" y="50" width="8" height="30" rx="1.5" fill="url(#goldGrad)" />
              <rect x="271" y="53" width="6" height="24" rx="1" fill="url(#goldGrad)" />
              <rect x="180" y="62" width="40" height="6" rx="1.5" fill="var(--gym-red)" />
            </g>

            {/* Target Area indicators */}
            <path d="M 175 115 L 200 133 L 225 115" fill="none" stroke="url(#redGrad)" strokeWidth="3" strokeLinecap="round" opacity="0.8" style={{ animation: 'coreGlow 3.2s infinite' }} filter="url(#glow)" />
            
            <text x="200" y="30" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">SQUAT DEPTH AXIS</text>
          </>
        );

      case 'deadlift':
        return (
          <>
            {/* Floor platform */}
            <line x1="100" y1="135" x2="300" y2="135" stroke="var(--shark-700)" strokeWidth="4.5" />
            
            {/* Barbell and weights */}
            <g style={{ animation: 'deadliftMove 3.4s ease-in-out infinite' }}>
              <line x1="115" y1="120" x2="285" y2="120" stroke="#e5e7eb" strokeWidth="3.5" />
              <circle cx="130" cy="120" r="18" fill="url(#goldGrad)" />
              <circle cx="130" cy="120" r="10" fill="var(--shark-950)" />
              <circle cx="270" cy="120" r="18" fill="url(#goldGrad)" />
              <circle cx="270" cy="120" r="10" fill="var(--shark-950)" />
              <circle cx="180" cy="120" r="3.5" fill="var(--gym-red)" />
              <circle cx="220" cy="120" r="3.5" fill="var(--gym-red)" />
            </g>

            {/* Hamstrings / Glutes highlight curve */}
            <path d="M 200 65 Q 180 90 200 115" fill="none" stroke="url(#redGrad)" strokeWidth="3" opacity="0.8" style={{ animation: 'coreGlow 3.4s infinite' }} filter="url(#glow)" />
            
            <text x="200" y="35" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">POSTERIOR CHAIN HINGE</text>
          </>
        );

      case 'row':
        return (
          <>
            {/* Slide Rail and Flywheel */}
            <line x1="110" y1="120" x2="280" y2="120" stroke="var(--shark-750)" strokeWidth="4" strokeLinecap="round" />
            <rect x="280" y="90" width="25" height="35" rx="3" fill="var(--shark-800)" stroke="var(--shark-600)" strokeWidth="1.5" />
            <circle cx="292" cy="107" r="7" fill="none" stroke="var(--shark-600)" strokeWidth="1.5" />

            {/* Seat slider */}
            <rect x="160" y="112" width="16" height="8" rx="2" fill="var(--gym-red)" style={{ animation: 'rowSeat 3s ease-in-out infinite' }} />

            {/* Handle pulling & Cable line */}
            <g style={{ animation: 'rowHandle 3s ease-in-out infinite' }}>
              <line x1="165" y1="100" x2="165" y2="114" stroke="url(#goldGrad)" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="280" y1="107" x2="165" y2="107" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3,3" />
            </g>

            <text x="200" y="35" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">HORIZONTAL ROW PLANE</text>
          </>
        );

      case 'raise':
        return (
          <>
            <line x1="100" y1="130" x2="300" y2="130" stroke="var(--shark-750)" strokeWidth="4" />
            <circle cx="190" cy="120" r="5" fill="var(--shark-600)" />
            
            {/* Legs bent static */}
            <line x1="190" y1="120" x2="150" y2="95" stroke="var(--shark-700)" strokeWidth="4" />
            <line x1="150" y1="95" x2="150" y2="130" stroke="var(--shark-700)" strokeWidth="4" strokeLinecap="round" />

            {/* Spine curling */}
            <g style={{ transformOrigin: '190px 120px', animation: 'crunchTorso 2.8s ease-in-out infinite' }}>
              <line x1="190" y1="120" x2="245" y2="98" stroke="#e5e7eb" strokeWidth="5.5" strokeLinecap="round" />
              <circle cx="245" cy="98" r="8" fill="#e5e7eb" />
              <path d="M 190 120 Q 218 102 245 98" fill="none" stroke="url(#redGrad)" strokeWidth="4.5" style={{ animation: 'coreGlow 2.8s infinite' }} filter="url(#glow)" />
            </g>

            <text x="200" y="35" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">ABDOMINAL COMPRESSION</text>
          </>
        );

      case 'hold':
        return (
          <>
            <line x1="100" y1="130" x2="300" y2="130" stroke="var(--shark-750)" strokeWidth="3.5" />
            
            {/* Plank Figure hovering */}
            <g style={{ animation: 'plankHover 2.2s ease-in-out infinite' }}>
              <circle cx="130" cy="128" r="3" fill="#e5e7eb" />
              <circle cx="250" cy="128" r="4.5" fill="#e5e7eb" />
              <line x1="250" y1="128" x2="270" y2="128" stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
              <line x1="250" y1="128" x2="250" y2="105" stroke="#e5e7eb" strokeWidth="4" />
              <line x1="130" y1="128" x2="250" y2="105" stroke="#e5e7eb" strokeWidth="5.5" strokeLinecap="round" />
              <circle cx="260" cy="98" r="8" fill="#e5e7eb" />
              
              {/* Muscle tension line */}
              <line x1="155" y1="122" x2="235" y2="108" stroke="url(#redGrad)" strokeWidth="3.5" style={{ animation: 'coreGlow 2.2s infinite' }} filter="url(#glow)" />
            </g>

            <text x="200" y="35" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">ISOMETRIC PLANK STABILITY</text>
          </>
        );

      case 'run':
        return (
          <>
            {/* Treadmill structure */}
            <rect x="110" y="125" width="180" height="8" rx="2" fill="var(--shark-800)" stroke="var(--shark-750)" strokeWidth="1.5" />
            <path d="M 260 125 L 275 85 L 260 80" fill="none" stroke="var(--shark-650)" strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Scrolling belt */}
            <line x1="120" y1="129" x2="280" y2="129" stroke="url(#goldGrad)" strokeWidth="2" strokeDasharray="6,8" style={{ animation: 'treadmillBelt 0.8s linear infinite' }} />
            
            {/* Heart rate monitor line */}
            <path d="M 100 60 L 150 60 L 160 40 L 170 80 L 180 50 L 190 60 L 300 60" fill="none" stroke="url(#redGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="300" style={{ animation: 'heartBeat 2.5s linear infinite' }} filter="url(#glow)" />
            
            <text x="200" y="150" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">STEADY STATE CARDIO</text>
          </>
        );

      case 'bike':
        return (
          <>
            <path d="M 150 130 L 200 95 L 250 130 M 200 95 L 200 130" fill="none" stroke="var(--shark-750)" strokeWidth="3" />
            <line x1="130" y1="130" x2="270" y2="130" stroke="var(--shark-750)" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="200" cy="95" r="22" fill="none" stroke="var(--shark-800)" strokeWidth="2" />
            
            {/* Rotating flywheel */}
            <g style={{ transformOrigin: '200px 95px', animation: 'spinWheel 2s linear infinite' }}>
              <circle cx="200" cy="95" r="22" fill="none" stroke="url(#goldGrad)" strokeWidth="3" strokeDasharray="8,10" />
            </g>

            {/* Heart rate wave */}
            <path d="M 110 45 Q 155 25 200 45 T 290 45" fill="none" stroke="url(#redGrad)" strokeWidth="2.5" strokeDasharray="100" style={{ animation: 'heartBeat 3s linear infinite' }} filter="url(#glow)" />
            
            <text x="200" y="150" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">CYCLING CARDIO TEMPO</text>
          </>
        );

      case 'elliptical':
        return (
          <>
            <ellipse cx="200" cy="105" rx="55" ry="24" fill="none" stroke="var(--shark-800)" strokeWidth="2" strokeDasharray="4,4" />
            
            {/* Spinning dot on elliptical path */}
            <circle cx="200" cy="105" r="7.5" fill="url(#goldGrad)" style={{ animation: 'ellipticalDot 2.8s linear infinite' }} filter="url(#glow)" />
            
            {/* Hand levers */}
            <line x1="160" y1="65" x2="160" y2="120" stroke="var(--shark-700)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="240" y1="65" x2="240" y2="120" stroke="var(--shark-700)" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
            
            <text x="200" y="35" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">ELLIPTICAL MOTION FLOW</text>
          </>
        );

      default:
        // Default glowing emblem for any other movement patterns
        return (
          <>
            <circle cx="200" cy="95" r="30" fill="none" stroke="var(--shark-750)" strokeWidth="2" strokeDasharray="5,5" />
            <polygon points="200,60 230,110 170,110" fill="none" stroke="url(#redGrad)" strokeWidth="3.5" style={{ animation: 'coreGlow 2.5s infinite' }} filter="url(#glow)" />
            <circle cx="200" cy="95" r="6" fill="url(#goldGrad)" style={{ animation: 'coreGlow 2s infinite' }} filter="url(#glow)" />
            
            <text x="200" y="35" textAnchor="middle" fill="var(--shark-450)" fontSize="10" fontWeight="bold" letterSpacing="0.5px">EXERCISE MOVEMENT SYMMETRY</text>
          </>
        );
    }
  };

  return (
    <div style={containerStyle}>
      <style>{`
        /* Press */
        @keyframes pressBarbell {
          0%, 100% { transform: translateY(24px); }
          50% { transform: translateY(-28px); }
        }
        @keyframes arrowPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.85; }
        }
        
        /* Fly */
        @keyframes flyLeft {
          0%, 100% { transform: rotate(35deg); }
          50% { transform: rotate(-10deg); }
        }
        @keyframes flyRight {
          0%, 100% { transform: rotate(-35deg); }
          50% { transform: rotate(10deg); }
        }
        
        /* Curl */
        @keyframes bicepCurl {
          0%, 100% { transform: rotate(10deg); }
          50% { transform: rotate(-100deg); }
        }
        
        /* Extension */
        @keyframes tricepExtend {
          0%, 100% { transform: translateY(-16px); }
          50% { transform: translateY(22px); }
        }
        @keyframes tricepCable {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }
        
        /* Squat */
        @keyframes squatMove {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(32px); }
        }
        
        /* Deadlift */
        @keyframes deadliftMove {
          0%, 100% { transform: translateY(12px); }
          50% { transform: translateY(-30px); }
        }
        
        /* Row */
        @keyframes rowSeat {
          0%, 100% { transform: translateX(20px); }
          50% { transform: translateX(-35px); }
        }
        @keyframes rowHandle {
          0%, 100% { transform: translateX(28px) translateY(0px); }
          50% { transform: translateX(-35px) translateY(-5px); }
        }
        
        /* Crunch */
        @keyframes crunchTorso {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
        }
        
        /* Plank */
        @keyframes plankHover {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(3.5px); }
        }
        @keyframes coreGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
        
        /* Cardio */
        @keyframes treadmillBelt {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }
        @keyframes spinWheel {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes heartBeat {
          0% { stroke-dashoffset: 300; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ellipticalDot {
          0% { transform: rotate(0deg) translateX(35px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(35px) rotate(-360deg); }
        }
      `}</style>
      
      {/* Grid Pattern overlay for blueprint aesthetic */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundSize: '20px 20px',
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <svg width="100%" height="100%" viewBox="0 0 400 170" style={{ display: 'block', zIndex: 2 }}>
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb300" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff3b30" />
            <stop offset="100%" stopColor="#ff5252" />
          </linearGradient>
        </defs>
        
        {renderKineticSVG()}
      </svg>

      <div style={blueprintBadgeStyle}>
        Kinetic Blueprint
      </div>
    </div>
  );
}

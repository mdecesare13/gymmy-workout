import React, { useState, useEffect, useRef } from 'react';

export default function FormVisualizer({ visualKey }) {
  const [progress, setProgress] = useState(0);
  const animationRef = useRef();
  const directionRef = useRef(1); // 1 = eccentric (lowering/opening), -1 = concentric (pushing/curling)

  useEffect(() => {
    let lastTime = performance.now();
    const speed = 0.008; // Animation speed controller

    const animate = (time) => {
      setProgress((prev) => {
        let next = prev + directionRef.current * speed;
        if (next >= 1) {
          next = 1;
          directionRef.current = -1; // Reverse direction
        } else if (next <= 0) {
          next = 0;
          directionRef.current = 1; // Reverse direction
        }
        return next;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // --- SVG Coordinates Generation based on Visual Key & Progress ---
  const renderStickFigure = () => {
    const p = progress; // shorthand [0, 1]
    
    // Core coordinate offsets for animation
    switch (visualKey) {
      case 'press': {
        // Bench press style: lying horizontal, bar pushing up and down
        // Body flat on bench (y = 120)
        // Arms extending vertically
        const shoulderY = 120;
        const handY = 120 - (p * 50); // Arm goes from bent (70) to extended (120)
        const elbowX = 75 + (1 - p) * 15; // elbows flare out when bent
        const elbowY = 120 + (1 - p) * 20; // elbows drop below bench when bent
        return (
          <>
            {/* Flat Bench */}
            <line x1="20" y1="130" x2="180" y2="130" stroke="#555e67" strokeWidth="6" strokeLinecap="round" />
            <line x1="60" y1="130" x2="60" y2="180" stroke="#555e67" strokeWidth="4" />
            <line x1="140" y1="130" x2="140" y2="180" stroke="#555e67" strokeWidth="4" />
            
            {/* Spine/Torso */}
            <line x1="50" y1="120" x2="150" y2="120" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            {/* Head */}
            <circle cx="40" cy="120" r="10" fill="#ffffff" />
            {/* Hips & Bent Legs */}
            <circle cx="150" cy="120" r="5" fill="#ffffff" />
            <line x1="150" y1="120" x2="160" y2="140" stroke="#ffffff" strokeWidth="4" />
            <line x1="160" y1="140" x2="160" y2="175" stroke="#ffffff" strokeWidth="4" />
            
            {/* Muscles highlighted (Chest / Triceps) in Red */}
            <path d="M 75 110 Q 95 100 115 110" fill="none" stroke="#ff3b30" strokeWidth={4 + (1 - p) * 4} opacity="0.8" />
            
            {/* Arms - shoulder at 95, 120 */}
            <line x1="95" y1="120" x2="95" y2={elbowY} stroke="#ffffff" strokeWidth="4" />
            <line x1="95" y1={elbowY} x2="95" y2={handY} stroke="#ffffff" strokeWidth="4" />
            
            {/* Barbell Weight */}
            <line x1="70" y1={handY} x2="120" y2={handY} stroke="#ffcc00" strokeWidth="4" />
            <circle cx="70" cy={handY} r="8" fill="#ffcc00" />
            <circle cx="120" cy={handY} r="8" fill="#ffcc00" />
          </>
        );
      }
      
      case 'fly': {
        // Chest Flys or Lateral Raise style
        // Hugging tree motion: standing vertical, arms sweeping wide to close
        const angle = p * 70; // 0 (closed) to 70 degrees (open wide)
        const rad = (angle * Math.PI) / 180;
        
        // Let's draw lateral raise (arms raising up)
        const armLength = 45;
        const shX = 100;
        const shY = 70;
        // Right hand arc
        const rhX = shX + Math.sin((90 - angle) * Math.PI / 180) * armLength;
        const rhY = shY + Math.cos((90 - angle) * Math.PI / 180) * armLength;
        // Left hand arc
        const lhX = shX - Math.sin((90 - angle) * Math.PI / 180) * armLength;
        const lhY = shY + Math.cos((90 - angle) * Math.PI / 180) * armLength;
        return (
          <>
            {/* Floor */}
            <line x1="20" y1="180" x2="180" y2="180" stroke="#555e67" strokeWidth="4" />
            
            {/* Head & Spine */}
            <circle cx="100" cy="45" r="10" fill="#ffffff" />
            <line x1="100" y1="55" x2="100" y2="120" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            
            {/* Highlighted Shoulders/Delts in Gold */}
            <circle cx="100" cy="70" r="12" fill="none" stroke="#ffcc00" strokeWidth={2 + p * 4} opacity="0.6" />
            
            {/* Legs */}
            <line x1="100" y1="120" x2="85" y2="180" stroke="#ffffff" strokeWidth="4" />
            <line x1="100" y1="120" x2="115" y2="180" stroke="#ffffff" strokeWidth="4" />
            
            {/* Arms raising */}
            <line x1="100" y1="70" x2={rhX} y2={rhY} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <line x1="100" y1="70" x2={lhX} y2={lhY} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            
            {/* Dumbbells */}
            <circle cx={rhX} cy={rhY} r="5" fill="#ff3b30" />
            <circle cx={lhX} cy={lhY} r="5" fill="#ff3b30" />
          </>
        );
      }
      
      case 'curl': {
        // Bicep Curl: Standing vertical, elbow pinned, forearm flexing up
        // Elbow at (100, 95)
        const elbowX = 100;
        const elbowY = 95;
        // Forearm rotation: angle from 90 (down) to -40 (fully curled up)
        const angle = 90 - (p * 130);
        const rad = (angle * Math.PI) / 180;
        const wristLength = 35;
        const wrX = elbowX + Math.sin(rad) * wristLength;
        const wrY = elbowY + Math.cos(rad) * wristLength;
        return (
          <>
            {/* Floor */}
            <line x1="20" y1="180" x2="180" y2="180" stroke="#555e67" strokeWidth="4" />
            
            {/* Head & Spine */}
            <circle cx="85" cy="45" r="10" fill="#ffffff" />
            <line x1="85" y1="55" x2="85" y2="120" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            
            {/* Bicep Muscle highlight in Red */}
            <path d="M 85 70 Q 98 78 100 95" fill="none" stroke="#ff3b30" strokeWidth={3 + p * 5} opacity="0.8" />
            
            {/* Upper Arm */}
            <line x1="85" y1="70" x2={elbowX} y2={elbowY} stroke="#ffffff" strokeWidth="4" />
            {/* Forearm */}
            <line x1={elbowX} y1={elbowY} x2={wrX} y2={wrY} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            
            {/* Legs */}
            <line x1="85" y1="120" x2="75" y2="180" stroke="#ffffff" strokeWidth="4" />
            <line x1="85" y1="120" x2="95" y2="180" stroke="#ffffff" strokeWidth="4" />
            
            {/* Dumbbell held in hand */}
            <line x1={wrX - 8} y1={wrY} x2={wrX + 8} y2={wrY} stroke="#ffcc00" strokeWidth="4" />
            <circle cx={wrX - 8} cy={wrY} r="4" fill="#ffcc00" />
            <circle cx={wrX + 8} cy={wrY} r="4" fill="#ffcc00" />
          </>
        );
      }
      
      case 'extension': {
        // Tricep Pushdown: Standing, elbow pinned, forearm extending down
        // Elbow at (100, 95)
        const elbowX = 100;
        const elbowY = 95;
        // Forearm rotates from 30 (bent up) to 110 (fully locked out down)
        const angle = 20 + (p * 90);
        const rad = (angle * Math.PI) / 180;
        const wristLength = 35;
        const wrX = elbowX + Math.sin(rad) * wristLength;
        const wrY = elbowY + Math.cos(rad) * wristLength;
        return (
          <>
            {/* Floor */}
            <line x1="20" y1="180" x2="180" y2="180" stroke="#555e67" strokeWidth="4" />
            
            {/* Head & Spine */}
            <circle cx="80" cy="45" r="10" fill="#ffffff" />
            <line x1="80" y1="55" x2="80" y2="120" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            
            {/* Tricep Muscle highlight in Red */}
            <path d="M 80 70 Q 75 80 100 95" fill="none" stroke="#ff3b30" strokeWidth={3 + (1 - p) * 5} opacity="0.8" />
            
            {/* Upper Arm */}
            <line x1="80" y1="70" x2={elbowX} y2={elbowY} stroke="#ffffff" strokeWidth="4" />
            {/* Forearm */}
            <line x1={elbowX} y1={elbowY} x2={wrX} y2={wrY} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            
            {/* Cable Line */}
            <line x1="110" y1="40" x2={wrX} y2={wrY} stroke="#ffcc00" strokeWidth="1.5" strokeDasharray="3,3" />
            
            {/* Legs */}
            <line x1="80" y1="120" x2="70" y2="180" stroke="#ffffff" strokeWidth="4" />
            <line x1="80" y1="120" x2="90" y2="180" stroke="#ffffff" strokeWidth="4" />
            
            {/* Handle in hand */}
            <circle cx={wrX} cy={wrY} r="4" fill="#ffcc00" />
          </>
        );
      }
      
      case 'squat': {
        // Squat: bending hips and knees down and up.
        // Floor at 180
        // Hips transition from 110 (standing) to 145 (deep squat)
        const hipY = 110 + (p * 35);
        const hipX = 85 - (p * 15); // hips push back
        
        // Knees bend forward
        const kneeY = 145 + (p * 5);
        const kneeX = 115 + (p * 5);
        
        // Torso tilts slightly forward
        const shoulderY = 70 + (p * 35);
        const shoulderX = 90 - (p * 10);
        const headY = shoulderY - 15;
        const headX = shoulderX - 3;
        
        return (
          <>
            {/* Floor */}
            <line x1="20" y1="180" x2="180" y2="180" stroke="#555e67" strokeWidth="4" />
            
            {/* Torso & Head */}
            <circle cx={headX} cy={headY} r="10" fill="#ffffff" />
            <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            
            {/* Barbell resting on back */}
            <circle cx={shoulderX - 3} cy={shoulderY + 2} r="6" fill="#ff3b30" />
            <line x1={shoulderX - 3} y1={shoulderY - 20} x2={shoulderX - 3} y2={shoulderY + 20} stroke="#ff3b30" strokeWidth="3" />
            
            {/* Thigh (Hip to Knee) - highlighting Quads in Gold */}
            <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="#ffffff" strokeWidth="4" />
            <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="#ffcc00" strokeWidth={3 + p * 4} opacity="0.7" />
            
            {/* Calf (Knee to Foot) */}
            <line x1={kneeX} y1={kneeY} x2="110" y2="180" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            
            {/* Arm bracing barbell */}
            <line x1={shoulderX} y1={shoulderY} x2={shoulderX + 15} y2={shoulderY + 10} stroke="#ffffff" strokeWidth="3" />
          </>
        );
      }
      
      case 'deadlift': {
        // Deadlift: Hip hinge, back straight, pulling bar up and down
        // Standing (p = 0) vs Bent over (p = 1)
        const hipX = 75 - (p * 20); // Hips hinge back
        const hipY = 110 + (p * 15);
        
        const shoulderX = 85 + (p * 15); // Shoulders lean forward
        const shoulderY = 65 + (p * 35);
        
        const kneeX = 100 - (p * 5); // soft knee bend
        const kneeY = 145 + (p * 5);
        
        // Hands hanging down to barbell
        const handX = shoulderX;
        const handY = shoulderY + 30; // arms stay extended
        
        return (
          <>
            {/* Floor */}
            <line x1="20" y1="180" x2="180" y2="180" stroke="#555e67" strokeWidth="4" />
            
            {/* Spine (Shoulder to Hip) - Highlighted in Gold for straight back posture! */}
            <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#ffcc00" strokeWidth="6" strokeLinecap="round" />
            <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#ffffff" strokeWidth="3" />
            
            {/* Head */}
            <circle cx={shoulderX + 5} cy={shoulderY - 12} r="9" fill="#ffffff" />
            
            {/* Thigh & Calf */}
            <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="#ffffff" strokeWidth="4" />
            <line x1={kneeX} y1={kneeY} x2="100" y2="180" stroke="#ffffff" strokeWidth="4" />
            
            {/* Arm pulling */}
            <line x1={shoulderX} y1={shoulderY} x2={handX} y2={handY} stroke="#ffffff" strokeWidth="4" />
            
            {/* Barbell dead weight */}
            <line x1={handX - 25} y1={handY} x2={handX + 25} y2={handY} stroke="#ff3b30" strokeWidth="4" />
            <circle cx={handX - 25} cy={handY} r="7" fill="#ff3b30" />
            <circle cx={handX + 25} cy={handY} r="7" fill="#ff3b30" />
          </>
        );
      }
      
      case 'row': {
        // Row: Pulling cable/weight horizontally to stomach
        // Sitting/hinged, arms extend/contract
        const handX = 90 + (p * 45); // Arm goes from extended (135) to contracted (90)
        const elbowX = 80 - (1 - p) * 20; // Elbow pulls back past spine when contracted
        const elbowY = 90 + (1 - p) * 10;
        
        return (
          <>
            {/* Seat platform */}
            <line x1="30" y1="130" x2="140" y2="130" stroke="#555e67" strokeWidth="5" />
            <line x1="80" y1="130" x2="80" y2="180" stroke="#555e67" strokeWidth="4" />
            
            {/* Spine / Head */}
            <circle cx="70" cy="65" r="9" fill="#ffffff" />
            <line x1="70" y1="75" x2="75" y2="125" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            
            {/* Back muscle highlight in Gold */}
            <path d="M 70 78 Q 60 90 75 110" fill="none" stroke="#ffcc00" strokeWidth={3 + (1 - p) * 4} opacity="0.8" />
            
            {/* Legs */}
            <line x1="75" y1="125" x2="120" y2="120" stroke="#ffffff" strokeWidth="4" />
            <line x1="120" y1="120" x2="135" y2="125" stroke="#ffffff" strokeWidth="4" />
            
            {/* Upper Arm & Forearm */}
            <line x1="75" y1="85" x2={elbowX} y2={elbowY} stroke="#ffffff" strokeWidth="4" />
            <line x1={elbowX} y1={elbowY} x2={handX} y2="90" stroke="#ffffff" strokeWidth="4" />
            
            {/* Cable wire pulling */}
            <line x1="160" y1="90" x2={handX} y2="90" stroke="#ff3b30" strokeWidth="1.5" strokeDasharray="3,3" />
            <circle cx={handX} cy="90" r="4" fill="#ff3b30" />
          </>
        );
      }
      
      case 'raise': {
        // Ab crunch style: lying down, hips anchored, shoulders curling upwards
        const crunchAngle = p * 25; // 0 to 25 deg lift
        const shY = 120 - (p * 15);
        const shX = 90 - (p * 10);
        return (
          <>
            {/* Floor */}
            <line x1="20" y1="130" x2="180" y2="130" stroke="#555e67" strokeWidth="4" />
            
            {/* Hips & Legs flat */}
            <circle cx="120" cy="120" r="5" fill="#ffffff" />
            <line x1="120" y1="120" x2="155" y2="125" stroke="#ffffff" strokeWidth="4" />
            
            {/* Ab crunch highlight in Red */}
            <path d="M 90 120 Q 105 105 120 120" fill="none" stroke="#ff3b30" strokeWidth={3 + p * 5} opacity="0.8" />
            
            {/* Lower spine & curling upper spine */}
            <line x1="120" y1="120" x2={shX} y2={shY} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <circle cx={shX - 10} cy={shY - 10} r="9" fill="#ffffff" />
            
            {/* Arms bracing neck */}
            <line x1={shX} y1={shY} x2={shX - 12} y2={shY - 5} stroke="#ffffff" strokeWidth="3" />
          </>
        );
      }
      
      case 'hold': {
        // Plank: completely static horizontal line, slight hover animation
        const hover = Math.sin(p * Math.PI * 2) * 2;
        return (
          <>
            {/* Ground */}
            <line x1="20" y1="140" x2="180" y2="140" stroke="#555e67" strokeWidth="4" />
            
            {/* Forearm and toes resting */}
            <line x1="120" y1="110" x2="125" y2="140" stroke="#ffffff" strokeWidth="4" />
            <line x1="50" y1="140" x2="60" y2="130" stroke="#ffffff" strokeWidth="4" />
            
            {/* Solid core line - highlighting core in Gold */}
            <line x1="60" y1="130" x2="120" y2={110 + hover} stroke="#ffcc00" strokeWidth="6" strokeLinecap="round" />
            <line x1="60" y1="130" x2="120" y2={110 + hover} stroke="#ffffff" strokeWidth="3" />
            
            {/* Head */}
            <circle cx="130" cy={105 + hover} r="9" fill="#ffffff" />
          </>
        );
      }
      
      case 'run': 
      default: {
        // Running cycle: alternating legs and arms
        // Simple 2D runner simulation
        const phase = p * Math.PI * 2;
        const hipX = 100;
        const hipY = 110;
        
        // Knees/feet cycling
        const leg1KneeX = hipX + Math.sin(phase) * 15;
        const leg1KneeY = hipY + 25 + Math.cos(phase) * 10;
        const leg1FootX = leg1KneeX + Math.cos(phase) * 10;
        const leg1FootY = leg1KneeY + 20 + Math.sin(phase) * 5;
        
        const leg2KneeX = hipX - Math.sin(phase) * 15;
        const leg2KneeY = hipY + 25 - Math.cos(phase) * 10;
        const leg2FootX = leg2KneeX - Math.cos(phase) * 10;
        const leg2FootY = leg2KneeY + 20 - Math.sin(phase) * 5;
        
        // Torso leaning forward slightly
        const shX = 108;
        const shY = 75;
        
        return (
          <>
            {/* Treadmill / Ground line */}
            <line x1="20" y1="165" x2="180" y2="165" stroke="#555e67" strokeWidth="4" />
            
            {/* Head & Torso */}
            <circle cx="112" cy="55" r="9" fill="#ffffff" />
            <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            
            {/* Leg 1 (Back leg) */}
            <line x1={hipX} y1={hipY} x2={leg1KneeX} y2={leg1KneeY} stroke="#ff3b30" strokeWidth="3.5" />
            <line x1={leg1KneeX} y1={leg1KneeY} x2={leg1FootX} y2={leg1FootY} stroke="#ff3b30" strokeWidth="3.5" />
            
            {/* Leg 2 (Front leg) */}
            <line x1={hipX} y1={hipY} x2={leg2KneeX} y2={leg2KneeY} stroke="#ffffff" strokeWidth="4" />
            <line x1={leg2KneeX} y1={leg2KneeY} x2={leg2FootX} y2={leg2FootY} stroke="#ffffff" strokeWidth="4" />
            
            {/* Arm swinging */}
            <line x1={shX} y1={shY} x2={shX - Math.cos(phase) * 15} y2={shY + 15} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          </>
        );
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '200px',
      backgroundColor: 'var(--shark-950)',
      borderRadius: '12px',
      border: '1px solid var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {renderStickFigure()}
      </svg>
      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        fontSize: '9px',
        fontWeight: 'bold',
        color: 'var(--gym-red)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: '3px 6px',
        borderRadius: '4px'
      }}>
        {visualKey === 'run' ? 'Cardio Active' : directionRef.current === -1 ? 'Concentric (Pull/Press)' : 'Eccentric (Slow)'}
      </div>
    </div>
  );
}

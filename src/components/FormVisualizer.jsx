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
    const phase = p * Math.PI * 2; // phase for running/cycling loops

    switch (visualKey) {
      case 'press': {
        // --- BENCH PRESS (Side & Top View) ---
        // Side View (x: 0-200)
        const sideElbowY = 120 + (1 - p) * 20;
        const sideHandY = 120 - p * 42;
        // Top View (x: 200-400)
        const topElbowY = 75 + (1 - p) * 16;
        const topHandY = 75 - p * 5;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">TOP VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            {/* Flat Bench (Equipment: Slate Gray) */}
            <rect x="35" y="125" width="130" height="8" rx="2" fill="#4b5563" />
            <line x1="60" y1="133" x2="60" y2="165" stroke="#4b5563" strokeWidth="4" />
            <line x1="140" y1="133" x2="140" y2="165" stroke="#4b5563" strokeWidth="4" />
            {/* Rack upright support */}
            <line x1="110" y1="125" x2="110" y2="80" stroke="#4b5563" strokeWidth="3" />
            <line x1="110" y1="80" x2="115" y2="80" stroke="#4b5563" strokeWidth="3" />

            {/* Spine / Head (Person: White/Red Joints) */}
            <line x1="50" y1="120" x2="135" y2="120" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <circle cx="40" cy="120" r="8" fill="#ffffff" />
            {/* Hips & Legs */}
            <circle cx="135" cy="120" r="5" fill="#ffffff" />
            <line x1="135" y1="120" x2="148" y2="140" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="148" y1="140" x2="148" y2="165" stroke="#ff3b30" strokeWidth="3.5" />

            {/* Primary active muscle highlight: Chest (Sports Red) */}
            <path d="M 75 112 Q 95 102 115 112" fill="none" stroke="#ff3b30" strokeWidth={3 + (1 - p) * 4} opacity="0.8" />

            {/* Arm pushing vertical barbell */}
            <line x1="85" y1="120" x2="85" y2={sideElbowY} stroke="#ffffff" strokeWidth="3.5" />
            <line x1="85" y1={sideElbowY} x2="85" y2={sideHandY} stroke="#ffffff" strokeWidth="3.5" />
            <circle cx="85" cy={sideElbowY} r="4" fill="#ffffff" />
            <circle cx="85" cy={sideHandY} r="3" fill="#ffffff" />

            {/* Barbell Weight (Moving: Gold) */}
            <line x1="60" y1={sideHandY} x2="110" y2={sideHandY} stroke="#ffd700" strokeWidth="3" />
            <rect x="56" y={sideHandY - 14} width="4" height="28" rx="1" fill="#ffd700" />
            <rect x="110" y={sideHandY - 14} width="4" height="28" rx="1" fill="#ffd700" />

            {/* --- TOP VIEW --- */}
            {/* Bench Pad (Equipment) */}
            <rect x="285" y="35" width="30" height="135" rx="3" fill="#4b5563" />

            {/* Spine (Torso lying along the bench) */}
            <line x1="300" y1="45" x2="300" y2="140" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <circle cx="300" cy="40" r="8" fill="#ffffff" />

            {/* Shoulders */}
            <line x1="275" y1="75" x2="325" y2="75" stroke="#ffffff" strokeWidth="4" />
            <circle cx="275" cy="75" r="4.5" fill="#ffffff" />
            <circle cx="325" cy="75" r="4.5" fill="#ffffff" />

            {/* Left Arm bending wide */}
            <line x1="275" y1="75" x2="260" y2={topElbowY} stroke="#ffffff" strokeWidth="3" />
            <line x1="260" y1={topElbowY} x2="268" y2={topHandY} stroke="#ffffff" strokeWidth="3" />
            <circle cx="260" cy={topElbowY} r="3" fill="#ffffff" />

            {/* Right Arm bending wide */}
            <line x1="325" y1="75" x2="340" y2={topElbowY} stroke="#ffffff" strokeWidth="3" />
            <line x1="340" y1={topElbowY} x2="332" y2={topHandY} stroke="#ffffff" strokeWidth="3" />
            <circle cx="340" cy={topElbowY} r="3" fill="#ffffff" />

            {/* Barbell Bar (Moving: Gold) */}
            <line x1="235" y1={topHandY} x2="365" y2={topHandY} stroke="#ffd700" strokeWidth="3.5" />
            <circle cx="242" cy={topHandY} r="12" fill="#ffd700" />
            <circle cx="242" cy={topHandY} r="8" fill="#ffb300" />
            <circle cx="358" cy={topHandY} r="12" fill="#ffd700" />
            <circle cx="358" cy={topHandY} r="8" fill="#ffb300" />
          </>
        );
      }

      case 'fly': {
        // --- CHEST FLY / LATERAL RAISE (Side & Front View) ---
        // p = 0 closed/down, p = 1 open/extended horizontally
        const angle = p * 80;
        const rad = (angle * Math.PI) / 180;
        const armLength = 35;
        // Side View hands swing forward
        const sideHandX = 100 - (1 - p) * 25;
        const sideHandY = 82 + (1 - p) * 10;
        // Front View hands sweep wide
        const frontLhX = 280 - Math.sin(rad) * armLength;
        const frontLhY = 72 + Math.cos(rad) * armLength;
        const frontRhX = 320 + Math.sin(rad) * armLength;
        const frontRhY = 72 + Math.cos(rad) * armLength;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            {/* Floor */}
            <line x1="25" y1="165" x2="175" y2="165" stroke="#4b5563" strokeWidth="3" />
            {/* Skeletal Trunk */}
            <circle cx="100" cy="48" r="8" fill="#ffffff" />
            <line x1="100" y1="56" x2="100" y2="120" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            {/* Legs */}
            <line x1="100" y1="120" x2="90" y2="165" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="100" y1="120" x2="108" y2="165" stroke="#ffffff" strokeWidth="3.5" />

            {/* Muscle highlight (Chest/Front Delt) */}
            <circle cx="100" cy="74" r="10" fill="none" stroke="#ff3b30" strokeWidth={1 + p * 3} opacity="0.6" />

            {/* Arms hugging forward */}
            <line x1="100" y1="74" x2="108" y2="88" stroke="#ffffff" strokeWidth="3.5" />
            <line x1="108" y1="88" x2={sideHandX} y2={sideHandY} stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={sideHandX} cy={sideHandY} r="4" fill="#ffd700" />

            {/* --- FRONT VIEW --- */}
            {/* Floor */}
            <line x1="225" y1="165" x2="375" y2="165" stroke="#4b5563" strokeWidth="3" />
            {/* Head & Spine */}
            <circle cx="300" cy="48" r="8" fill="#ffffff" />
            <line x1="300" y1="56" x2="300" y2="120" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            {/* Legs */}
            <line x1="300" y1="120" x2="285" y2="165" stroke="#ffffff" strokeWidth="3.5" />
            <line x1="300" y1="120" x2="315" y2="165" stroke="#ffffff" strokeWidth="3.5" />
            {/* Shoulders */}
            <line x1="280" y1="72" x2="320" y2="72" stroke="#ffffff" strokeWidth="4" />

            {/* Target Muscle: Delts (Gold Accent) */}
            <circle cx="280" cy="72" r="7" fill="none" stroke="#ffd700" strokeWidth={1 + p * 3} opacity="0.7" />
            <circle cx="320" cy="72" r="7" fill="none" stroke="#ffd700" strokeWidth={1 + p * 3} opacity="0.7" />

            {/* Left Arm Sweeping */}
            <line x1="280" y1="72" x2={frontLhX} y2={frontLhY} stroke="#ff3b30" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={frontLhX} cy={frontLhY} r="5" fill="#ffd700" />

            {/* Right Arm Sweeping */}
            <line x1="320" y1="72" x2={frontRhX} y2={frontRhY} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <circle cx={frontRhX} cy={frontRhY} r="5" fill="#ffd700" />
          </>
        );
      }

      case 'curl': {
        // --- BICEP CURL (Side & Front View) ---
        const curlAngle = 90 - p * 130;
        const rad = (curlAngle * Math.PI) / 180;
        const wristL = 32;
        // Side view forearms
        const sideHandX = 100 + Math.sin(rad) * wristL;
        const sideHandY = 95 + Math.cos(rad) * wristL;
        // Front view hands curling
        const frontHandY = 128 - p * 45;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            <line x1="25" y1="165" x2="175" y2="165" stroke="#4b5563" strokeWidth="3" />
            <circle cx="85" cy="48" r="8" fill="#ffffff" />
            <line x1="85" y1="56" x2="85" y2="120" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="85" y1="120" x2="78" y2="165" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="85" y1="120" x2="92" y2="165" stroke="#ffffff" strokeWidth="3.5" />

            {/* Active Muscle: Biceps (Sports Red) */}
            <path d="M 85 70 Q 98 78 100 95" fill="none" stroke="#ff3b30" strokeWidth={2 + p * 5} opacity="0.8" />

            {/* Arm curling */}
            <line x1="85" y1="72" x2="100" y2="95" stroke="#ffffff" strokeWidth="4" />
            <line x1="100" y1="95" x2={sideHandX} y2={sideHandY} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="95" r="4" fill="#ffffff" />
            {/* Dumbbell details */}
            <line x1={sideHandX - 8} y1={sideHandY} x2={sideHandX + 8} y2={sideHandY} stroke="#ffd700" strokeWidth="4" />
            <circle cx={sideHandX - 8} cy={sideHandY} r="4" fill="#ffb300" />
            <circle cx={sideHandX + 8} cy={sideHandY} r="4" fill="#ffb300" />

            {/* --- FRONT VIEW --- */}
            <line x1="225" y1="165" x2="375" y2="165" stroke="#4b5563" strokeWidth="3" />
            <circle cx="300" cy="48" r="8" fill="#ffffff" />
            <line x1="300" y1="56" x2="300" y2="120" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="300" y1="120" x2="288" y2="165" stroke="#ffffff" strokeWidth="3.5" />
            <line x1="300" y1="120" x2="312" y2="165" stroke="#ffffff" strokeWidth="3.5" />
            {/* Shoulders */}
            <line x1="275" y1="74" x2="325" y2="74" stroke="#ffffff" strokeWidth="4" />

            {/* Left Arm (Curling) */}
            <line x1="275" y1="74" x2="272" y2="100" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="272" y1="100" x2="265" y2={frontHandY} stroke="#ff3b30" strokeWidth="3.5" />
            {/* Left dumbbell */}
            <line x1="257" y1={frontHandY} x2="273" y2={frontHandY} stroke="#ffd700" strokeWidth="4" />

            {/* Right Arm (Curling) */}
            <line x1="325" y1="74" x2="328" y2="100" stroke="#ffffff" strokeWidth="4" />
            <line x1="328" y1="100" x2="335" y2={frontHandY} stroke="#ffffff" strokeWidth="4" />
            {/* Right dumbbell */}
            <line x1="327" y1={frontHandY} x2="343" y2={frontHandY} stroke="#ffd700" strokeWidth="4" />
          </>
        );
      }

      case 'extension': {
        // --- TRICEP PUSHDOWN (Side & Front View) ---
        const extAngle = 20 + p * 92;
        const rad = (extAngle * Math.PI) / 180;
        const wristL = 32;
        // Side view forearms
        const sideHandX = 100 + Math.sin(rad) * wristL;
        const sideHandY = 95 + Math.cos(rad) * wristL;
        // Front view hands extending down & flaring
        const frontLhX = 285 - p * 12;
        const frontRhX = 315 + p * 12;
        const frontHandY = 90 + p * 40;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            <line x1="25" y1="165" x2="175" y2="165" stroke="#4b5563" strokeWidth="3" />
            {/* Cable Machine Pulley (Equipment) */}
            <line x1="125" y1="45" x2="125" y2="165" stroke="#4b5563" strokeWidth="4" />
            <circle cx="125" cy="50" r="6" fill="#4b5563" />

            <circle cx="80" cy="48" r="8" fill="#ffffff" />
            <line x1="80" y1="56" x2="80" y2="120" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="80" y1="120" x2="72" y2="165" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="80" y1="120" x2="88" y2="165" stroke="#ffffff" strokeWidth="3.5" />

            {/* Tricep highlight */}
            <path d="M 80 70 Q 74 82 100 95" fill="none" stroke="#ff3b30" strokeWidth={2 + (1 - p) * 5} opacity="0.8" />

            {/* Arm extending */}
            <line x1="80" y1="72" x2="100" y2="95" stroke="#ffffff" strokeWidth="4" />
            <line x1="100" y1="95" x2={sideHandX} y2={sideHandY} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="95" r="4" fill="#ffffff" />

            {/* Cable rope (Moving Parts: Gold) */}
            <line x1="122" y1="52" x2={sideHandX} y2={sideHandY} stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3,3" />
            <circle cx={sideHandX} cy={sideHandY} r="3" fill="#ffd700" />

            {/* --- FRONT VIEW --- */}
            <line x1="225" y1="165" x2="375" y2="165" stroke="#4b5563" strokeWidth="3" />
            {/* Cable pully frame top */}
            <line x1="300" y1="40" x2="300" y2="165" stroke="#4b5563" strokeWidth="3" />
            <circle cx="300" cy="44" r="6" fill="#4b5563" />

            <circle cx="300" cy="48" r="8" fill="#ffffff" />
            <line x1="300" y1="56" x2="300" y2="120" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="300" y1="120" x2="288" y2="165" stroke="#ffffff" strokeWidth="3.5" />
            <line x1="300" y1="120" x2="312" y2="165" stroke="#ffffff" strokeWidth="3.5" />
            <line x1="280" y1="74" x2="320" y2="74" stroke="#ffffff" strokeWidth="4" />

            {/* Left Arm extending */}
            <line x1="280" y1="74" x2="280" y2="98" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="280" y1="98" x2={frontLhX} y2={frontHandY} stroke="#ff3b30" strokeWidth="3.5" />
            {/* Left cable rope */}
            <line x1="300" y1="46" x2={frontLhX} y2={frontHandY} stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* Right Arm extending */}
            <line x1="320" y1="74" x2="320" y2="98" stroke="#ffffff" strokeWidth="4" />
            <line x1="320" y1="98" x2={frontRhX} y2={frontHandY} stroke="#ffffff" strokeWidth="4" />
            {/* Right cable rope */}
            <line x1="300" y1="46" x2={frontRhX} y2={frontHandY} stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3,3" />
          </>
        );
      }

      case 'squat': {
        // --- SQUAT (Side & Front View) ---
        const hipY = 110 + p * 38;
        const hipX = 85 - p * 16;
        const kneeX = 118 + p * 1;
        const kneeY = 145 + p * 6;

        const shoulderY = 70 + p * 38;
        const shoulderX = 92 - p * 10;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            {/* Squat Rack (Equipment) */}
            <line x1="120" y1="60" x2="120" y2="165" stroke="#4b5563" strokeWidth="4" />
            <line x1="60" y1="165" x2="135" y2="165" stroke="#4b5563" strokeWidth="3" />
            <line x1="60" y1="60" x2="120" y2="60" stroke="#4b5563" strokeWidth="2" />

            {/* Skeletal alignment */}
            <circle cx={shoulderX - 3} cy={shoulderY - 14} r="8" fill="#ffffff" />
            <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            {/* Thigh (Hip to Knee) - highlighting Quads in Red */}
            <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="#ff3b30" strokeWidth="4.5" />
            {/* Calf */}
            <line x1={kneeX} y1={kneeY} x2="114" y2="165" stroke="#ffffff" strokeWidth="4" />
            <circle cx={hipX} cy={hipY} r="4" fill="#ffffff" />
            <circle cx={kneeX} cy={kneeY} r="4" fill="#ffffff" />

            {/* Barbell (Gold) */}
            <line x1={shoulderX - 3} y1={shoulderY - 18} x2={shoulderX - 3} y2={shoulderY + 18} stroke="#ffd700" strokeWidth="3" />
            <circle cx={shoulderX - 3} cy={shoulderY} r="10" fill="#ffd700" />
            <circle cx={shoulderX - 3} cy={shoulderY} r="7" fill="#ffb300" />

            {/* --- FRONT VIEW --- */}
            {/* Squat Rack Cage columns */}
            <line x1="250" y1="50" x2="250" y2="165" stroke="#4b5563" strokeWidth="3.5" />
            <line x1="350" y1="50" x2="350" y2="165" stroke="#4b5563" strokeWidth="3.5" />
            <line x1="250" y1="50" x2="350" y2="50" stroke="#4b5563" strokeWidth="2" />

            {/* Torso & Head */}
            <circle cx="300" cy={55 + p * 38} r="8" fill="#ffffff" />
            <line x1="300" y1="65 + p * 38" x2="300" y2="110 + p * 38" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            {/* Shoulders */}
            <line x1="275" y1="75 + p * 38" x2="325" y2="75 + p * 38" stroke="#ffffff" strokeWidth="4" />

            {/* Left leg tracking */}
            <line x1="280" y1="110 + p * 38" x2="270 - p * 3" y2="138 + p * 15" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="270 - p * 3" y1="138 + p * 15" x2="268" y2="165" stroke="#ffffff" strokeWidth="3.5" />
            {/* Right leg tracking */}
            <line x1="320" y1="110 + p * 38" x2="330 + p * 3" y2="138 + p * 15" stroke="#ffffff" strokeWidth="4" />
            <line x1="330 + p * 3" y1="138 + p * 15" x2="332" y2="165" stroke="#ffffff" strokeWidth="4" />

            {/* Barbell Bar & plates (Gold, moving down) */}
            <line x1="230" y1={72 + p * 38} x2="370" y2={72 + p * 38} stroke="#ffd700" strokeWidth="4" />
            <rect x="236" y={57 + p * 38} width="8" height="30" rx="2" fill="#ffd700" />
            <rect x="356" y={57 + p * 38} width="8" height="30" rx="2" fill="#ffd700" />
          </>
        );
      }

      case 'deadlift': {
        // --- DEADLIFT (Side & Front View) ---
        const hipX = 80 - p * 20;
        const hipY = 110 + p * 15;
        const shX = 85 + p * 22;
        const shY = 65 + p * 38;
        const kneeX = 100 - p * 5;
        const kneeY = 145 + p * 5;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            <line x1="25" y1="165" x2="175" y2="165" stroke="#4b5563" strokeWidth="3" />

            {/* Straight spine safety guidelines (Gold highlight) */}
            <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#ffd700" strokeWidth="7" strokeLinecap="round" opacity="0.3" />
            <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={shX + 4} cy={shY - 12} r="8" fill="#ffffff" />

            {/* Hips & Legs */}
            <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="#ffffff" strokeWidth="3.5" />
            <line x1={kneeX} y1={kneeY} x2="98" y2="165" stroke="#ffffff" strokeWidth="3.5" />

            {/* Arms pulling barbell */}
            <line x1={shX} y1={shY} x2={shX} y2={shY + 32} stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />

            {/* Barbell Weight (Gold circular plates) */}
            <line x1={shX - 22} y1={shY + 32} x2={shX + 22} y2={shY + 32} stroke="#ffd700" strokeWidth="3" />
            <circle cx={shX} cy={shY + 32} r="15" fill="#ffd700" opacity="0.9" />
            <circle cx={shX} cy={shY + 32} r="9" fill="#ffb300" />

            {/* --- FRONT VIEW --- */}
            <line x1="225" y1="165" x2="375" y2="165" stroke="#4b5563" strokeWidth="3" />
            <circle cx="300" cy="50 + p * 38" r="8" fill="#ffffff" />
            <line x1="300" y1="58 + p * 38" x2="300" y2="110 + p * 15" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="280" y1="68 + p * 38" x2="320" y2="68 + p * 38" stroke="#ffffff" strokeWidth="4" />

            {/* Legs */}
            <line x1="290" y1="110 + p * 15" x2="280" y2="165" stroke="#ffffff" strokeWidth="4" />
            <line x1="310" y1="110 + p * 15" x2="320" y2="165" stroke="#ffffff" strokeWidth="4" />

            {/* Arms extending down */}
            <line x1="280" y1="68 + p * 38" x2="278" y2="98 + p * 38" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="320" y1="68 + p * 38" x2="322" y2="98 + p * 38" stroke="#ffffff" strokeWidth="4" />

            {/* Barbell & Plates (Gold) */}
            <line x1="240" y1={98 + p * 38} x2="360" y2={98 + p * 38} stroke="#ffd700" strokeWidth="4" />
            <rect x="230" y={83 + p * 38} width="10" height="30" rx="2" fill="#ffd700" />
            <rect x="360" y={83 + p * 38} width="10" height="30" rx="2" fill="#ffd700" />
          </>
        );
      }

      case 'row': {
        // --- ROWING MACHINE (Side & Front View) ---
        const hipX = 65 + p * 45;
        const hipY = 128;
        const kneeX = 95 + p * 24;
        const kneeY = 100 + p * 28;
        const shX = (hipX + 8) - p * 16;
        const shY = 82 + p * 4;
        const handX = 135 - p * 50;
        const handY = 92;

        const elbowX = ((shX + handX) / 2) * (1 - p) + (shX - 12) * p;
        const elbowY = ((shY + handY) / 2) * (1 - p) + (shY + 10) * p;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            {/* Track, flywheel support (Equipment: Slate Gray) */}
            <line x1="30" y1="135" x2="155" y2="135" stroke="#4b5563" strokeWidth="5" strokeLinecap="round" />
            <circle cx="150" cy="105" r="18" fill="none" stroke="#4b5563" strokeWidth="3" />
            <path d="M 135 135 L 150 90 L 160 135 Z" fill="#4b5563" opacity="0.4" />

            {/* Sliding red seat */}
            <rect x={hipX - 6} y={hipY - 4} width="12" height="6" rx="1.5" fill="#ff3b30" />

            {/* Skeletal model */}
            <circle cx={shX + (p < 0.5 ? 4 : -4)} cy={shY - 14} r="9" fill="#ffffff" />
            <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            {/* Spine gold loading accent */}
            <path d={`M ${shX} ${shY + 10} Q ${hipX - 10} ${(shY + hipY)/2} ${hipX} ${hipY}`} fill="none" stroke="#ffd700" strokeWidth={2 + p * 3} opacity="0.7" />

            {/* Leg (Hip to Knee to Foot) */}
            <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="#ffffff" strokeWidth="4" />
            <line x1={kneeX} y1={kneeY} x2="135" y2="135" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

            {/* Arm (Shoulder to Elbow to Hand) */}
            <line x1={shX} y1={shY} x2={elbowX} y2={elbowY} stroke="#ffffff" strokeWidth="3.5" />
            <line x1={elbowX} y1={elbowY} x2={handX} y2={handY} stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />

            {/* Cable pull rope (Gold) */}
            <line x1="145" y1="92" x2={handX} y2={handY} stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* --- FRONT VIEW --- */}
            {/* Front console cage (Equipment) */}
            <rect x="288" y="80" width="24" height="26" rx="4" fill="#4b5563" />
            <line x1="300" y1="106" x2="300" y2="165" stroke="#4b5563" strokeWidth="4" />
            <line x1="270" y1="165" x2="330" y2="165" stroke="#4b5563" strokeWidth="4" />

            {/* Chest & spine */}
            <circle cx="300" cy="62" r="8" fill="#ffffff" />
            <line x1="300" y1="70" x2="300" y2="128" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="280" y1="82 + p * 4" x2="320" y2="82 + p * 4" stroke="#ffffff" strokeWidth="4" />

            {/* Hands pulling gold bar */}
            <line x1="285" y1="94" x2="315" y2="94" stroke="#ffd700" strokeWidth="3" />
            <circle cx="300" cy="94" r="3" fill="#ffffff" />

            {/* Left Elbow pulling back */}
            <line x1="280" y1="82 + p * 4" x2={270 - p * 12} y2={90 + p * 8} stroke="#ff3b30" strokeWidth="3.5" />
            <line x1={270 - p * 12} y1={90 + p * 8} x2="288" y2="94" stroke="#ff3b30" strokeWidth="3.5" />

            {/* Right Elbow pulling back */}
            <line x1="320" y1="82 + p * 4" x2={330 + p * 12} y2={90 + p * 8} stroke="#ffffff" strokeWidth="4" />
            <line x1={330 + p * 12} y1={90 + p * 8} x2="312" y2="94" stroke="#ffffff" strokeWidth="4" />
          </>
        );
      }

      case 'raise': {
        // --- AB CRUNCH / CORE RAISE (Side & Front View) ---
        const shY = 125 - p * 16;
        const shX = 90 - p * 10;
        const legY = 125 - p * 40;
        const legX = 150 - p * 15;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            {/* Floor/Mat */}
            <line x1="25" y1="135" x2="175" y2="135" stroke="#4b5563" strokeWidth="4" strokeLinecap="round" />

            {/* Hips */}
            <circle cx="120" cy="125" r="5" fill="#ffffff" />
            {/* Legs lifting (Gold accents on moving core) */}
            <line x1="120" y1="125" x2={legX} y2={legY} stroke="#ffd700" strokeWidth="4" strokeLinecap="round" />

            {/* Curling upper spine */}
            <line x1="120" y1="125" x2={shX} y2={shY} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <circle cx={shX - 10} cy={shY - 10} r="8" fill="#ffffff" />
            {/* Arms bracing neck */}
            <line x1={shX} y1={shY} x2={shX - 12} y2={shY - 6} stroke="#ffffff" strokeWidth="3" />

            {/* --- FRONT VIEW --- */}
            <line x1="225" y1="135" x2="375" y2="135" stroke="#4b5563" strokeWidth="4" strokeLinecap="round" />

            <circle cx="300" cy="130" r="5" fill="#ffffff" />
            {/* Crunch spine curling vertically */}
            <line x1="300" y1="130" x2="300" y2={100 - p * 15} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <circle cx="300" cy={92 - p * 15} r="8" fill="#ffffff" />
            {/* Raised knees */}
            <line x1="290" y1="130" x2="290" y2={130 - p * 20} stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="310" y1="130" x2="310" y2={130 - p * 20} stroke="#ffffff" strokeWidth="4" />
          </>
        );
      }

      case 'hold': {
        // --- PLANK (Side & Front View) ---
        const hover = Math.sin(p * Math.PI * 2) * 1.5;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            <line x1="25" y1="140" x2="175" y2="140" stroke="#4b5563" strokeWidth="3" />
            {/* Forearm & toes */}
            <line x1="120" y1="110" x2="125" y2="140" stroke="#ffffff" strokeWidth="4" />
            <line x1="50" y1="140" x2="60" y2="130" stroke="#ffffff" strokeWidth="4" />

            {/* Spine flat indicator line (Gold) */}
            <line x1="50" y1="130" x2="120" y2={110 + hover} stroke="#ffd700" strokeWidth="6" strokeLinecap="round" opacity="0.35" />
            <line x1="50" y1="130" x2="120" y2={110 + hover} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="128" cy={105 + hover} r="8" fill="#ffffff" />

            {/* --- FRONT VIEW --- */}
            <line x1="225" y1="140" x2="375" y2="140" stroke="#4b5563" strokeWidth="3" />

            {/* Elbows anchored shoulder width (White) */}
            <line x1="280" y1="112" x2="280" y2="140" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="320" y1="112" x2="320" y2="140" stroke="#ffffff" strokeWidth="4" />

            {/* Shoulder bar & Head */}
            <line x1="280" y1="112" x2="320" y2="112" stroke="#ffffff" strokeWidth="4" />
            <circle cx="300" cy="98" r="8" fill="#ffffff" />
          </>
        );
      }

      case 'run': {
        // --- CARDIO RUNNING (Side & Front View) ---
        const legPhase = p * Math.PI * 2;
        const hipX = 100;
        const hipY = 110;

        // Knees cycling
        const l1KneeX = hipX + Math.sin(legPhase) * 15;
        const l1KneeY = hipY + 25 + Math.cos(legPhase) * 10;
        const l1FootX = l1KneeX + Math.cos(legPhase) * 10;
        const l1FootY = l1KneeY + 20 + Math.sin(legPhase) * 5;

        const l2KneeX = hipX - Math.sin(legPhase) * 15;
        const l2KneeY = hipY + 25 - Math.cos(legPhase) * 10;
        const l2FootX = l2KneeX - Math.cos(legPhase) * 10;
        const l2FootY = l2KneeY + 20 - Math.sin(legPhase) * 5;

        // Front view knee heights
        const frontLkneeY = 138 + Math.sin(legPhase) * 12;
        const frontRkneeY = 138 - Math.sin(legPhase) * 12;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            {/* Treadmill Frame (Equipment) */}
            <rect x="25" y="152" width="130" height="10" rx="3" fill="#4b5563" />
            <path d="M 125 152 L 132 110 L 115 106" fill="none" stroke="#4b5563" strokeWidth="4" strokeLinecap="round" />

            {/* Spine & Head */}
            <circle cx="112" cy="55" r="9" fill="#ffffff" />
            <line x1="108" y1="75" x2="100" y2="110" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />

            {/* Back Leg (Red) */}
            <line x1={hipX} y1={hipY} x2={l1KneeX} y2={l1KneeY} stroke="#ff3b30" strokeWidth="3.5" />
            <line x1={l1KneeX} y1={l1KneeY} x2={l1FootX} y2={l1FootY} stroke="#ff3b30" strokeWidth="3.5" />

            {/* Front Leg (White) */}
            <line x1={hipX} y1={hipY} x2={l2KneeX} y2={l2KneeY} stroke="#ffffff" strokeWidth="4" />
            <line x1={l2KneeX} y1={l2KneeY} x2={l2FootX} y2={l2FootY} stroke="#ffffff" strokeWidth="4" />

            {/* Arm swinging */}
            <line x1="108" y1="75" x2={108 - Math.cos(legPhase) * 14} y2="92" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />

            {/* --- FRONT VIEW --- */}
            {/* Treadmill structure (Equipment) */}
            <line x1="250" y1="165" x2="350" y2="165" stroke="#4b5563" strokeWidth="4" />
            <rect x="280" y="85" width="40" height="16" rx="3" fill="#4b5563" />
            <line x1="280" y1="101" x2="270" y2="165" stroke="#4b5563" strokeWidth="3" />
            <line x1="320" y1="101" x2="330" y2="165" stroke="#4b5563" strokeWidth="3" />

            {/* Spine & chest */}
            <circle cx="300" cy="55" r="9" fill="#ffffff" />
            <line x1="300" y1="64" x2="300" y2="110" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />

            {/* Left Leg (Red) */}
            <line x1="292" y1="110" x2="288" y2={frontLkneeY} stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="288" y1={frontLkneeY} x2="288" y2={frontLkneeY + 18} stroke="#ff3b30" strokeWidth="3.5" />

            {/* Right Leg (White) */}
            <line x1="308" y1="110" x2="312" y2={frontRkneeY} stroke="#ffffff" strokeWidth="4" />
            <line x1="312" y1={frontRkneeY} x2="312" y2={frontRkneeY + 18} stroke="#ffffff" strokeWidth="4" />
          </>
        );
      }

      case 'bike': {
        // --- CARDIO CYCLING (Side & Front View) ---
        const legPhase = p * Math.PI * 2;
        const hipX = 85;
        const hipY = 110;
        const crankX = 110;
        const crankY = 145;
        const pedalR = 12;

        const p1X = crankX + Math.cos(legPhase) * pedalR;
        const p1Y = crankY + Math.sin(legPhase) * pedalR;
        const p2X = crankX - Math.cos(legPhase) * pedalR;
        const p2Y = crankY - Math.sin(legPhase) * pedalR;

        const k1X = (hipX + p1X) / 2 + 12;
        const k1Y = (hipY + p1Y) / 2 - 12;
        const k2X = (hipX + p2X) / 2 + 12;
        const k2Y = (hipY + p2Y) / 2 - 12;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            {/* Bike structure (Equipment) */}
            <line x1="25" y1="165" x2="165" y2="165" stroke="#4b5563" strokeWidth="4" />
            <circle cx="55" cy="140" r="20" fill="none" stroke="#4b5563" strokeWidth="3" />
            {/* Frame geometry */}
            <line x1="55" y1="140" x2={crankX} y2={crankY} stroke="#4b5563" strokeWidth="3.5" />
            <line x1="55" y1="140" x2={hipX} y2={hipY - 4} stroke="#4b5563" strokeWidth="3.5" />
            <line x1={hipX} y1={hipY - 4} x2={crankX} y2={crankY} stroke="#4b5563" strokeWidth="3.5" />
            <line x1={crankX} y1={crankY} x2="125" y2="90" stroke="#4b5563" strokeWidth="3.5" />
            <line x1={hipX} y1={hipY - 4} x2="125" y2="90" stroke="#4b5563" strokeWidth="3.5" />
            {/* Handlebars & Seat */}
            <line x1={hipX - 8} y1={hipY - 4} x2={hipX + 8} y2={hipY - 4} stroke="#ff3b30" strokeWidth="4" strokeLinecap="round" />
            <line x1="120" y1="90" x2="135" y2="90" stroke="#4b5563" strokeWidth="4" strokeLinecap="round" />

            {/* Rider profile */}
            <circle cx="102" cy="58" r="9" fill="#ffffff" />
            <line x1="95" y1="78" x2={hipX} y2={hipY} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="95" y1="78" x2="120" y2="90" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />

            {/* Left Leg (Red) */}
            <line x1={hipX} y1={hipY} x2={k1X} y2={k1Y} stroke="#ff3b30" strokeWidth="3.5" />
            <line x1={k1X} y1={k1Y} x2={p1X} y2={p1Y} stroke="#ff3b30" strokeWidth="3.5" />
            <line x1={p1X - 5} y1={p1Y} x2={p1X + 5} y2={p1Y} stroke="#ffd700" strokeWidth="3.5" />

            {/* Right Leg (White) */}
            <line x1={hipX} y1={hipY} x2={k2X} y2={k2Y} stroke="#ffffff" strokeWidth="4" />
            <line x1={k2X} y1={k2Y} x2={p2X} y2={p2Y} stroke="#ffffff" strokeWidth="4" />
            <line x1={p2X - 5} y1={p2Y} x2={p2X + 5} y2={p2Y} stroke="#ffd700" strokeWidth="3.5" />

            {/* --- FRONT VIEW --- */}
            {/* Frame center and console (Equipment) */}
            <line x1="300" y1="95" x2="300" y2="165" stroke="#4b5563" strokeWidth="4" />
            <line x1="275" y1="165" x2="325" y2="165" stroke="#4b5563" strokeWidth="4" />
            <rect x="290" y="80" width="20" height="15" rx="2" fill="#4b5563" />

            {/* Rider torso */}
            <circle cx="300" cy="58" r="8" fill="#ffffff" />
            <line x1="300" y1="66" x2="300" y2="110" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="285" y1="78" x2="315" y2="78" stroke="#ffffff" strokeWidth="4" />

            {/* Pedaling knees front projection */}
            {/* Left Knee flare */}
            <line x1="290" y1="110" x2={286 - Math.abs(Math.sin(legPhase)) * 4} y2={128 + Math.sin(legPhase) * 12} stroke="#ff3b30" strokeWidth="3.5" />
            <line x1={286 - Math.abs(Math.sin(legPhase)) * 4} y1={128 + Math.sin(legPhase) * 12} x2="288" y2={145 + Math.sin(legPhase) * 12} stroke="#ff3b30" strokeWidth="3.5" />
            {/* Right Knee flare */}
            <line x1="310" y1="110" x2={314 + Math.abs(Math.cos(legPhase)) * 4} y2={128 - Math.sin(legPhase) * 12} stroke="#ffffff" strokeWidth="4" />
            <line x1={314 + Math.abs(Math.cos(legPhase)) * 4} y1={128 - Math.sin(legPhase) * 12} x2="312" y2={145 - Math.sin(legPhase) * 12} stroke="#ffffff" strokeWidth="4" />
          </>
        );
      }

      case 'elliptical': {
        // --- CARDIO ELLIPTICAL (Side & Front View) ---
        const legPhase = p * Math.PI * 2;
        const hipX = 100;
        const hipY = 110;

        const p1X = 100 + Math.cos(legPhase) * 18;
        const p1Y = 152 + Math.sin(legPhase) * 5;
        const p2X = 100 - Math.cos(legPhase) * 18;
        const p2Y = 152 - Math.sin(legPhase) * 5;

        const k1X = (hipX + p1X) / 2 + 10;
        const k1Y = (hipY + p1Y) / 2 - 10;
        const k2X = (hipX + p2X) / 2 + 10;
        const k2Y = (hipY + p2Y) / 2 - 10;

        // Front view levers & pedal heights
        const hand1X = 278 - Math.sin(legPhase) * 12;
        const hand2X = 322 + Math.sin(legPhase) * 12;
        const lFeetY = 148 + Math.sin(legPhase) * 10;
        const rFeetY = 148 - Math.sin(legPhase) * 10;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            {/* Elliptical Frame (Equipment) */}
            <line x1="25" y1="165" x2="165" y2="165" stroke="#4b5563" strokeWidth="4" />
            <ellipse cx="100" cy="152" rx="22" ry="7" fill="none" stroke="#4b5563" strokeWidth="2.5" strokeDasharray="3,3" />
            <line x1="125" y1="165" x2="120" y2="90" stroke="#4b5563" strokeWidth="3" />

            {/* Swing Arm Levers */}
            <line x1="120" y1="90" x2={120 + Math.sin(legPhase) * 15} y2="70" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />

            {/* Skeletal Frame */}
            <circle cx="100" cy="55" r="9" fill="#ffffff" />
            <line x1="100" y1="75" x2={hipX} y2={hipY} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />

            {/* Left Leg (Red) */}
            <line x1={hipX} y1={hipY} x2={k1X} y2={k1Y} stroke="#ff3b30" strokeWidth="3.5" />
            <line x1={k1X} y1={k1Y} x2={p1X} y2={p1Y} stroke="#ff3b30" strokeWidth="3.5" />
            <circle cx={p1X} cy={p1Y} r="4.5" fill="#ffd700" />

            {/* Right Leg (White) */}
            <line x1={hipX} y1={hipY} x2={k2X} y2={k2Y} stroke="#ffffff" strokeWidth="4" />
            <line x1={k2X} y1={k2Y} x2={p2X} y2={p2Y} stroke="#ffffff" strokeWidth="4" />
            <circle cx={p2X} cy={p2Y} r="4.5" fill="#ffd700" />

            {/* Arm swinging */}
            <line x1="100" y1="75" x2={120 + Math.sin(legPhase) * 15} y2="70" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />

            {/* --- FRONT VIEW --- */}
            {/* Elliptical structure (Equipment) */}
            <line x1="250" y1="165" x2="350" y2="165" stroke="#4b5563" strokeWidth="4" />
            <line x1="300" y1="92" x2="300" y2="165" stroke="#4b5563" strokeWidth="4" />
            <rect x="288" y="80" width="24" height="15" rx="3" fill="#4b5563" />

            {/* Lever handles */}
            <line x1="288" y1="92" x2={hand1X} y2="68" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="312" y1="92" x2={hand2X} y2="68" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

            {/* Spine & Chest */}
            <circle cx="300" cy="55" r="8" fill="#ffffff" />
            <line x1="300" y1="63" x2="300" y2="110" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="282" y1="74" x2="318" y2="74" stroke="#ffffff" strokeWidth="4" />

            {/* Left Leg (Red) */}
            <line x1="292" y1="110" x2="290" y2={lFeetY} stroke="#ff3b30" strokeWidth="3.5" strokeLinecap="round" />
            {/* Right Leg (White) */}
            <line x1="308" y1="110" x2="310" y2={rFeetY} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

            {/* Hands swinging levers */}
            <line x1="282" y1="74" x2={hand1X} y2="68" stroke="#ff3b30" strokeWidth="3" strokeLinecap="round" />
            <line x1="318" y1="74" x2={hand2X} y2="68" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          </>
        );
      }

      case 'incline_press': {
        // --- INCLINE BENCH PRESS (Side & Top View) ---
        // Side View (x: 0-200)
        const sideHandX = 105 + p * 24;
        const sideHandY = 92 - p * 36;
        const elbowX = 105 + (1 - p) * 12 + p * 12;
        const elbowY = 92 + (1 - p) * 18 - p * 18;

        // Top View (x: 200-400)
        const topHandY = 80 - p * 8;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">TOP VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            {/* Incline Bench (Equipment: Slate Gray) */}
            <line x1="40" y1="150" x2="135" y2="150" stroke="#4b5563" strokeWidth="4" />
            <line x1="60" y1="150" x2="60" y2="128" stroke="#4b5563" strokeWidth="3" />
            {/* Rack upright support */}
            <line x1="110" y1="150" x2="110" y2="85" stroke="#4b5563" strokeWidth="3" />
            <line x1="110" y1="85" x2="115" y2="85" stroke="#4b5563" strokeWidth="3" />
            {/* Pad slanted at 35 degrees */}
            <line x1="50" y1="130" x2="125" y2="78" stroke="#4b5563" strokeWidth="8" strokeLinecap="round" />
            <line x1="42" y1="130" x2="52" y2="130" stroke="#4b5563" strokeWidth="8" strokeLinecap="round" />

            {/* Skeletal model */}
            <line x1="55" y1="124" x2="105" y2="92" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <circle cx="114" cy="85" r="8" fill="#ffffff" />
            {/* Legs */}
            <circle cx="55" cy="124" r="5" fill="#ffffff" />
            <line x1="55" y1="124" x2="65" y2="145" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="65" y1="145" x2="68" y2="165" stroke="#ff3b30" strokeWidth="3.5" strokeLinecap="round" />

            {/* Upper Chest muscle highlight */}
            <path d="M 85 102 Q 100 88 112 95" fill="none" stroke="#ff3b30" strokeWidth={3 + (1 - p) * 4} opacity="0.8" />

            {/* Arm pressing */}
            <line x1="105" y1="92" x2={elbowX} y2={elbowY} stroke="#ffffff" strokeWidth="3.5" />
            <line x1={elbowX} y1={elbowY} x2={handX} y2={handY} stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={elbowX} cy={elbowY} r="3.5" fill="#ffffff" />

            {/* Barbell Weight (Gold) */}
            <line x1={handX - 16} y1={handY - 11} x2={handX + 16} y2={handY + 11} stroke="#ffd700" strokeWidth="3" />
            <circle cx={handX} cy={handY} r="8.5" fill="#ffd700" />
            <circle cx={handX} cy={handY} r="5" fill="#ffb300" />

            {/* --- TOP VIEW --- */}
            {/* Bench Pad */}
            <rect x="285" y="35" width="30" height="135" rx="3" fill="#4b5563" />
            <circle cx="300" cy="55" r="8" fill="#ffffff" />
            <line x1="300" y1="63" x2="300" y2="130" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="275" y1="80" x2="325" y2="80" stroke="#ffffff" strokeWidth="4" />

            {/* Barbell wide grip press */}
            <line x1="235" y1={topHandY} x2="365" y2={topHandY} stroke="#ffd700" strokeWidth="3.5" />
            <circle cx="242" cy={topHandY} r="12" fill="#ffd700" />
            <circle cx="358" cy={topHandY} r="12" fill="#ffd700" />
          </>
        );
      }

      case 'incline_fly': {
        // --- INCLINE DUMBBELL FLY (Side & Front View) ---
        const sideHandX = 110 + (1 - p) * 20 - p * 15;
        const sideHandY = 88 - (1 - p) * 30 + p * 12;
        const sideElbowX = 105 + (1 - p) * 10 + p * 15;
        const sideElbowY = 92 + (1 - p) * 5 + p * 20;

        const rad = (p * 70 * Math.PI) / 180;
        const frontLhX = 280 - Math.sin(rad) * 35;
        const frontLhY = 75 + Math.cos(rad) * 35;
        const frontRhX = 320 + Math.sin(rad) * 35;
        const frontRhY = 75 + Math.cos(rad) * 35;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            {/* Incline Bench */}
            <line x1="40" y1="150" x2="135" y2="150" stroke="#4b5563" strokeWidth="4" />
            <line x1="50" y1="130" x2="125" y2="78" stroke="#4b5563" strokeWidth="8" strokeLinecap="round" />
            <line x1="42" y1="130" x2="52" y2="130" stroke="#4b5563" strokeWidth="8" strokeLinecap="round" />

            {/* Skeletal model */}
            <line x1="55" y1="124" x2="105" y2="92" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <circle cx="114" cy="85" r="8" fill="#ffffff" />
            <line x1="55" y1="124" x2="65" y2="145" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="65" y1="145" x2="68" y2="165" stroke="#ff3b30" strokeWidth="3.5" />

            {/* Upper chest muscle tension */}
            <path d="M 85 102 Q 100 88 112 95" fill="none" stroke="#ff3b30" strokeWidth={1 + p * 3} opacity="0.6" />

            {/* Arm fly motion */}
            <line x1="105" y1="92" x2={sideElbowX} y2={sideElbowY} stroke="#ffffff" strokeWidth="3.5" />
            <line x1={sideElbowX} y1={sideElbowY} x2={sideHandX} y2={sideHandY} stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={sideHandX} cy={sideHandY} r="4" fill="#ffd700" />

            {/* --- FRONT VIEW --- */}
            <rect x="285" y="45" width="30" height="110" rx="2" fill="#4b5563" />
            <circle cx="300" cy="55" r="8" fill="#ffffff" />
            <line x1="300" y1="63" x2="300" y2="130" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="280" y1="75" x2="320" y2="75" stroke="#ffffff" strokeWidth="4" />

            {/* Left Arm (Red) */}
            <line x1="280" y1="75" x2={frontLhX} y2={frontLhY} stroke="#ff3b30" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={frontLhX} cy={frontLhY} r="5" fill="#ffd700" />

            {/* Right Arm (White) */}
            <line x1="320" y1="75" x2={frontRhX} y2={frontRhY} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <circle cx={frontRhX} cy={frontRhY} r="5" fill="#ffd700" />
          </>
        );
      }

      case 'incline_curl': {
        // --- INCLINE BICEP CURL (Side & Front View) ---
        const sideHandX = 105 + p * 17;
        const sideHandY = 142 - p * 44;
        const frontHandY = 132 - p * 46;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            {/* Incline bench pad 45 degrees */}
            <line x1="40" y1="150" x2="130" y2="150" stroke="#4b5563" strokeWidth="4" />
            <line x1="60" y1="135" x2="120" y2="75" stroke="#4b5563" strokeWidth="8" strokeLinecap="round" />

            {/* Rider profile */}
            <line x1="70" y1="128" x2="105" y2="90" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <circle cx="115" cy="80" r="8" fill="#ffffff" />
            <line x1="70" y1="128" x2="80" y2="165" stroke="#ff3b30" strokeWidth="3.5" />

            {/* Muscle highlight */}
            <path d="M 105 90 Q 112 100 105 112" fill="none" stroke="#ff3b30" strokeWidth={2 + p * 4} opacity="0.8" />

            {/* Arm curling from shoulder */}
            <line x1="105" y1="90" x2="105" y2="112" stroke="#ffffff" strokeWidth="4" />
            <line x1="105" y1="112" x2={sideHandX} y2={sideHandY} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="105" cy="112" r="4.5" fill="#ffffff" />

            {/* Dumbbell */}
            <line x1={sideHandX - 8} y1={sideHandY} x2={sideHandX + 8} y2={sideHandY} stroke="#ffd700" strokeWidth="3.5" />
            <circle cx={sideHandX - 8} cy={sideHandY} r="4" fill="#ffb300" />
            <circle cx={sideHandX + 8} cy={sideHandY} r="4" fill="#ffb300" />

            {/* --- FRONT VIEW --- */}
            <rect x="290" y="45" width="20" height="110" rx="2" fill="#4b5563" />
            <circle cx="300" cy="58" r="8" fill="#ffffff" />
            <line x1="300" y1="66" x2="300" y2="128" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="275" y1="75" x2="325" y2="75" stroke="#ffffff" strokeWidth="4" />

            {/* Left Arm curling */}
            <line x1="275" y1="75" x2="275" y2="102" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="275" y1="102" x2="270" y2={frontHandY} stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="262" y1={frontHandY} x2="278" y2={frontHandY} stroke="#ffd700" strokeWidth="3.5" />

            {/* Right Arm curling */}
            <line x1="325" y1="75" x2="325" y2="102" stroke="#ffffff" strokeWidth="4" />
            <line x1="325" y1="102" x2="330" y2={frontHandY} stroke="#ffffff" strokeWidth="4" />
            <line x1="322" y1={frontHandY} x2="338" y2={frontHandY} stroke="#ffd700" strokeWidth="3.5" />
          </>
        );
      }

      case 'incline_row': {
        // --- CHEST-SUPPORTED INCLINE ROW (Side & Front View) ---
        const sideHandX = 115 - p * 10;
        const sideHandY = 122 - p * 27;
        const sideElbowX = 115 * (1 - p) + 90 * p;
        const sideElbowY = 102 * (1 - p) + 72 * p;

        const frontHandY = 122 - p * 30;
        const frontLekX = 265 - p * 12;
        const frontLekY = 95 - p * 15;
        const frontRekX = 335 + p * 12;
        const frontRekY = 95 - p * 15;

        return (
          <>
            {/* VIEWPORT LABELS */}
            <text x="12" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">SIDE VIEW</text>
            <text x="212" y="20" fill="var(--shark-500)" fontSize="9" fontWeight="bold" letterSpacing="1">FRONT VIEW</text>
            <line x1="200" y1="10" x2="200" y2="190" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4,4" />

            {/* --- SIDE VIEW --- */}
            {/* Incline pad slanted forward */}
            <line x1="30" y1="150" x2="140" y2="150" stroke="#4b5563" strokeWidth="4" />
            <line x1="125" y1="75" x2="55" y2="125" stroke="#4b5563" strokeWidth="8" strokeLinecap="round" />

            {/* Skeletal model face down */}
            <line x1="65" y1="118" x2="115" y2="82" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <circle cx="128" cy="74" r="8" fill="#ffffff" />
            <line x1="65" y1="118" x2="50" y2="142" stroke="#ff3b30" strokeWidth="3.5" />
            <line x1="50" y1="142" x2="45" y2="165" stroke="#ff3b30" strokeWidth="3.5" strokeLinecap="round" />

            {/* Upper back stretch highlight */}
            <path d={`M 115 82 Q 100 88 95 105`} fill="none" stroke="#ffcc00" strokeWidth={2 + p * 3} opacity="0.8" />

            {/* Arm rowing */}
            <line x1="115" y1="82" x2={sideElbowX} y2={sideElbowY} stroke="#ffffff" strokeWidth="3.5" />
            <line x1={sideElbowX} y1={sideElbowY} x2={sideHandX} y2={sideHandY} stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={sideElbowX} cy={sideElbowY} r="3.5" fill="#ffffff" />

            {/* Dumbbell */}
            <line x1={sideHandX - 8} y1={sideHandY} x2={sideHandX + 8} y2={sideHandY} stroke="#ffd700" strokeWidth="3.5" />
            <circle cx={sideHandX - 8} cy={sideHandY} r="4.5" fill="#ffb300" />
            <circle cx={sideHandX + 8} cy={sideHandY} r="4.5" fill="#ffb300" />

            {/* --- FRONT VIEW --- */}
            <rect x="285" y="45" width="30" height="110" rx="2" fill="#4b5563" />
            <circle cx="300" cy="55" r="8" fill="#ffffff" />
            <line x1="300" y1="63" x2="300" y2="128" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1="280" y1="75" x2="320" y2="75" stroke="#ffffff" strokeWidth="4" />

            {/* Left Arm pulling wide */}
            <line x1="280" y1="75" x2={frontLekX} y2={frontLekY} stroke="#ff3b30" strokeWidth="3.5" />
            <line x1={frontLekX} y1={frontLekY} x2="276" y2={frontHandY} stroke="#ff3b30" strokeWidth="3.5" />
            <circle cx="276" cy={frontHandY} r="4" fill="#ffd700" />

            {/* Right Arm pulling wide */}
            <line x1="320" y1="75" x2={frontRekX} y2={frontRekY} stroke="#ffffff" strokeWidth="4" />
            <line x1={frontRekX} y1={frontRekY} x2="324" y2={frontHandY} stroke="#ffffff" strokeWidth="4" />
            <circle cx="324" cy={frontHandY} r="4" fill="#ffd700" />
          </>
        );
      }

      default:
        return null;
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
      <svg width="100%" height="100%" viewBox="0 0 400 200">
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
        {['run', 'bike', 'elliptical', 'row'].includes(visualKey) ? 'Cardio Active' : directionRef.current === -1 ? 'Concentric (Pull/Press)' : 'Eccentric (Slow)'}
      </div>
    </div>
  );
}

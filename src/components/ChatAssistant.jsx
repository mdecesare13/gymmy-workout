import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot } from 'lucide-react';

export default function ChatAssistant({ store }) {
  const { planConfig, setPlanConfig, generateWeeklyPlan } = store;
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hey! I'm your Gymmy AI Coach. 🏋️‍♂️\n\nYou can chat with me to instantly update your workout plan or weekly settings. For example, try typing:\n• *'Add a run day'*\n• *'Focus only on chest, back, and arms'*\n• *'Generate a new split'*",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const feedEndRef = useRef(null);

  // Scroll chat feed to bottom on new message
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      processCommand(userMessage.text);
    }, 1200);
  };

  // --- Local NLP Command Parser ---
  const processCommand = (text) => {
    const cleanText = text.toLowerCase().trim();
    let reply = "";
    let configUpdated = false;
    let planRegenerated = false;

    // 1. Add/Remove Runs
    if (cleanText.includes('add a run') || cleanText.includes('more run') || cleanText.includes('increase run')) {
      setPlanConfig((prev) => {
        const nextVal = Math.min(7, prev.runDays + 1);
        reply = `I've increased your target running days to ${nextVal} per week and generated an updated schedule. 🏃‍♂️`;
        return { ...prev, runDays: nextVal };
      });
      configUpdated = true;
      planRegenerated = true;
    } 
    else if (cleanText.includes('remove a run') || cleanText.includes('fewer run') || cleanText.includes('decrease run')) {
      setPlanConfig((prev) => {
        const nextVal = Math.max(0, prev.runDays - 1);
        reply = `I've decreased your target running days to ${nextVal} per week and generated an updated schedule.`;
        return { ...prev, runDays: nextVal };
      });
      configUpdated = true;
      planRegenerated = true;
    }
    
    // 2. Add/Remove Lifts
    else if (cleanText.includes('add a lift') || cleanText.includes('more lift') || cleanText.includes('increase lift') || cleanText.includes('add a workout')) {
      setPlanConfig((prev) => {
        const nextVal = Math.min(7, prev.liftDays + 1);
        reply = `I've increased your target lifting days to ${nextVal} per week and updated your routine. 🏋️‍♂️`;
        return { ...prev, liftDays: nextVal };
      });
      configUpdated = true;
      planRegenerated = true;
    }
    else if (cleanText.includes('remove a lift') || cleanText.includes('fewer lift') || cleanText.includes('decrease lift') || cleanText.includes('remove a workout')) {
      setPlanConfig((prev) => {
        const nextVal = Math.max(0, prev.liftDays - 1);
        reply = `I've decreased your target lifting days to ${nextVal} per week and updated your routine.`;
        return { ...prev, liftDays: nextVal };
      });
      configUpdated = true;
      planRegenerated = true;
    }

    // 3. Muscle Group Selections
    else if (cleanText.includes('focus') || cleanText.includes('target') || cleanText.includes('only hit')) {
      // Extract regions mentioned
      const availableRegions = ['chest', 'back', 'bis', 'tris', 'shoulders', 'legs', 'abs', 'forearms'];
      const targets = [];
      
      // Map synonyms/plural forms
      if (cleanText.includes('chest')) targets.push('chest');
      if (cleanText.includes('back')) targets.push('back');
      if (cleanText.includes('bi') || cleanText.includes('arm')) {
        targets.push('bis');
        targets.push('tris');
      }
      if (cleanText.includes('shoulder')) targets.push('shoulders');
      if (cleanText.includes('leg') || cleanText.includes('quad') || cleanText.includes('hamstring')) targets.push('legs');
      if (cleanText.includes('ab') || cleanText.includes('core')) targets.push('abs');
      if (cleanText.includes('forearm') || cleanText.includes('grip')) targets.push('forearms');

      if (targets.length > 0) {
        setPlanConfig((prev) => ({ ...prev, focusRegions: targets }));
        reply = `Got it! I've updated your muscle focus list to target: **${targets.join(', ')}**. Generating your updated split now!`;
        configUpdated = true;
        planRegenerated = true;
      } else {
        reply = "I couldn't identify which body regions you wanted to focus on. Try saying: *'focus on chest and back'* or *'only hit legs'*.";
      }
    }

    // 4. Manual Regeneration
    else if (cleanText.includes('regenerate') || cleanText.includes('new split') || cleanText.includes('refresh') || cleanText.includes('new plan')) {
      reply = "No problem! I've refreshed your weekly plan with new varied exercises to keep your routine fresh. check the Builder or Today tabs!";
      planRegenerated = true;
    }

    // 5. Default Friendly Assist Fallback
    else {
      reply = "I'm not sure how to parse that command yet. I'm currently set up for basic scheduling commands. Try asking me to *'add a run day'*, *'remove a lift day'*, or *'focus on chest and arms'*.";
    }

    // Trigger store updates
    if (configUpdated && !planRegenerated) {
      // Configuration was updated but plan needs manual hook (should update together)
    }

    if (planRegenerated) {
      // Allow a brief millisecond offset to let store states process config edits
      setTimeout(() => {
        generateWeeklyPlan();
      }, 50);
    }

    const botMessage = {
      id: Math.random().toString(),
      sender: 'bot',
      text: reply,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--shark-950)',
      paddingTop: 'calc(var(--safe-top) + 44px)'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 59, 48, 0.15)',
          padding: '8px',
          borderRadius: '50%'
        }}>
          <Sparkles color="var(--gym-red)" size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '17px', marginBottom: '0', fontWeight: '700' }}>AI Assistant</h2>
          <span style={{ fontSize: '11px', color: 'var(--shark-500)' }}>Offline NLP Controller</span>
        </div>
      </div>

      {/* Message Feed Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 16px calc(var(--safe-bottom) + 80px) 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              {!isUser && (
                <div style={{
                  backgroundColor: 'var(--shark-800)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '4px'
                }}>
                  <Bot size={14} color="var(--gym-red)" />
                </div>
              )}

              <div style={{
                maxWidth: '75%',
                backgroundColor: isUser ? 'var(--gym-red)' : 'var(--shark-800)',
                color: isUser ? '#ffffff' : 'var(--shark-100)',
                padding: '12px 14px',
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: '14px',
                lineHeight: '1.45',
                border: isUser ? 'none' : '1px solid var(--glass-border)',
                whiteSpace: 'pre-line'
              }}>
                {msg.text}
              </div>

              {isUser && (
                <div style={{
                  backgroundColor: 'var(--shark-700)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '4px'
                }}>
                  <User size={14} color="var(--shark-300)" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              backgroundColor: 'var(--shark-800)',
              border: '1px solid var(--glass-border)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={14} color="var(--gym-red)" />
            </div>
            <div style={{
              backgroundColor: 'var(--shark-800)',
              padding: '10px 16px',
              borderRadius: '16px 16px 16px 4px',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
              height: '36px'
            }}>
              <span className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--shark-500)', borderRadius: '50%', animation: 'bounce 1s infinite 0.1s' }} />
              <span className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--shark-500)', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
              <span className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--shark-500)', borderRadius: '50%', animation: 'bounce 1s infinite 0.3s' }} />
            </div>
          </div>
        )}
        <div ref={feedEndRef} />
      </div>

      {/* Input Tray */}
      <form
        onSubmit={handleSend}
        style={{
          position: 'absolute',
          bottom: 'calc(var(--safe-bottom) + 56px + 10px)',
          left: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          backgroundColor: 'var(--shark-800)',
          borderRadius: '14px',
          padding: '6px 8px',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask me to modify plan..."
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--shark-100)',
            fontSize: '14px',
            padding: '8px 4px'
          }}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          style={{
            backgroundColor: inputText.trim() ? 'var(--gym-red)' : 'var(--shark-700)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'default',
            transition: 'background-color 0.2s ease'
          }}
        >
          <Send size={16} />
        </button>
      </form>

      {/* Inline styles for typing bouncing animation */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

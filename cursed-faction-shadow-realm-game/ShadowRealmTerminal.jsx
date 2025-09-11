import React, { useState, useRef, useEffect } from 'react';

const ShadowRealmTerminal = () => {
  const [history, setHistory] = useState([
    { type: 'system', text: '══════════════════════════════════════════' },
    { type: 'system', text: '     CURSED FACTION SHADOW REALM TERMINAL      ' },
    { type: 'system', text: '══════════════════════════════════════════' },
    { type: 'system', text: 'Welcome to the Shadow Realm. Type "help" for available commands.' },
    { type: 'prompt', text: 'shadow-realm:~$ ' }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [gameState, setGameState] = useState({
    level: 1,
    shadowEnergy: 100,
    cursedTokens: 0,
    inRealm: false
  });
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const addToHistory = (text, type = 'output') => {
    setHistory(prev => [...prev, { type, text }]);
  };

  const processCommand = (command) => {
    const args = command.toLowerCase().trim().split(' ');
    const cmd = args[0];

    addToHistory(`shadow-realm:~$ ${command}`, 'input');

    switch (cmd) {
      case 'help':
        addToHistory('Available commands:');
        addToHistory('  enter     - Enter the shadow realm');
        addToHistory('  exit      - Exit the shadow realm');
        addToHistory('  status    - Show player status');
        addToHistory('  cast      - Cast a shadow spell');
        addToHistory('  restore   - Restore shadow energy');
        addToHistory('  name      - Generate a cursed name');
        addToHistory('  clear     - Clear terminal');
        addToHistory('  art       - Display shadow realm art');
        break;

      case 'enter':
        if (gameState.inRealm) {
          addToHistory('You are already in the Shadow Realm.');
        } else {
          setGameState(prev => ({ ...prev, inRealm: true }));
          addToHistory('🌑 Entering the Shadow Realm...');
          addToHistory('The darkness welcomes you, cursed one.');
          addToHistory('Ancient powers stir in the void...');
          showStatus();
        }
        break;

      case 'exit':
        if (!gameState.inRealm) {
          addToHistory('You are not in the Shadow Realm.');
        } else {
          setGameState(prev => ({ ...prev, inRealm: false }));
          addToHistory('🌅 Exiting the Shadow Realm...');
          addToHistory('You return to the mortal plane.');
        }
        break;

      case 'status':
        showStatus();
        break;

      case 'cast':
        if (!gameState.inRealm) {
          addToHistory('❌ You must be in the Shadow Realm to cast spells.');
        } else if (gameState.shadowEnergy >= 10) {
          setGameState(prev => ({
            ...prev,
            shadowEnergy: prev.shadowEnergy - 10,
            cursedTokens: prev.cursedTokens + 1
          }));
          addToHistory('⚡ Shadow spell cast successfully!');
          addToHistory('You gained 1 Cursed Token.');
          setTimeout(showStatus, 100);
        } else {
          addToHistory('❌ Insufficient shadow energy to cast spell.');
        }
        break;

      case 'restore':
        setGameState(prev => ({ ...prev, shadowEnergy: 100 }));
        addToHistory('🔋 Shadow energy restored to maximum.');
        setTimeout(showStatus, 100);
        break;

      case 'name': {
        const prefixes = ['Shadow', 'Cursed', 'Dark', 'Void', 'Phantom', 'Wraith', 'Doom', 'Hex'];
        const suffixes = ['blade', 'wraith', 'lord', 'keeper', 'walker', 'weaver', 'bringer', 'master'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        addToHistory(`🎭 Your cursed name: ${prefix}${suffix}`);
        break;
      }

      case 'clear':
        setHistory([{ type: 'prompt', text: 'shadow-realm:~$ ' }]);
        return;

      case 'art':
        addToHistory('         ░░░░░░░░░░░░░░░░░░░░░░░░░');
        addToHistory('       ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░');
        addToHistory('     ░░▓▓██████████████████████▓▓░░');
        addToHistory('   ░░▓▓██████████████████████████▓▓░░');
        addToHistory('  ░▓▓████████████████████████████████▓▓░');
        addToHistory(' ░▓██████████████████████████████████████▓░');
        addToHistory('░▓████████████████████████████████████████▓░');
        addToHistory('▓██████████████████████████████████████████▓');
        addToHistory('██████████████  SHADOW REALM  ██████████████');
        addToHistory('▓██████████████████████████████████████████▓');
        addToHistory('░▓████████████████████████████████████████▓░');
        addToHistory(' ░▓██████████████████████████████████████▓░');
        addToHistory('  ░▓▓████████████████████████████████▓▓░');
        addToHistory('   ░░▓▓██████████████████████████▓▓░░');
        addToHistory('     ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░');
        addToHistory('       ░░░░░░░░░░░░░░░░░░░░░░░');
        break;

      default:
        if (command.trim() === '') {
          break;
        }
        addToHistory(`Command not found: ${cmd}. Type "help" for available commands.`);
    }

    addToHistory('shadow-realm:~$ ', 'prompt');
  };

  const showStatus = () => {
    addToHistory('┌─────────────────────────────────────┐');
    addToHistory('│            PLAYER STATUS            │');
    addToHistory('├─────────────────────────────────────┤');
    addToHistory(`│ Level: ${gameState.level}${' '.repeat(30 - gameState.level.toString().length)}│`);
    addToHistory(`│ Shadow Energy: ${gameState.shadowEnergy}${' '.repeat(20 - gameState.shadowEnergy.toString().length)}│`);
    addToHistory(`│ Cursed Tokens: ${gameState.cursedTokens}${' '.repeat(20 - gameState.cursedTokens.toString().length)}│`);
    addToHistory(`│ In Shadow Realm: ${gameState.inRealm ? 'Yes' : 'No'}${' '.repeat(15 - (gameState.inRealm ? 3 : 2))}│`);
    addToHistory('└─────────────────────────────────────┘');
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      processCommand(currentInput);
      setCurrentInput('');
    }
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      style={{
        backgroundColor: '#0a0a0a',
        color: '#00ff41',
        fontFamily: 'Monaco, "Lucida Console", monospace',
        fontSize: '14px',
        padding: '20px',
        border: '2px solid #333',
        borderRadius: '8px',
        height: '400px',
        overflow: 'hidden',
        cursor: 'text'
      }}
      onClick={handleTerminalClick}
    >
      <div 
        ref={terminalRef}
        style={{
          height: '360px',
          overflowY: 'auto',
          paddingRight: '10px'
        }}
      >
        {history.map((line, index) => (
          <div
            key={index}
            style={{
              marginBottom: '2px',
              whiteSpace: 'pre-wrap',
              color: line.type === 'system' ? '#ff6b6b' : 
                     line.type === 'input' ? '#4ecdc4' :
                     line.type === 'prompt' ? '#00ff41' : '#00ff41'
            }}
          >
            {line.type === 'prompt' ? (
              <span>
                {line.text}
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#00ff41',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    outline: 'none',
                    width: '300px'
                  }}
                  autoFocus
                />
              </span>
            ) : (
              line.text
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShadowRealmTerminal;
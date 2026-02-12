import { useState, useEffect } from 'react';
import './index.css';

// Types
interface Exercise {
  name: string;
  best_pr?: string;
  special_logging?: 'weight_only' | 'reps_as_seconds';
}

interface Workout {
  [key: string]: Exercise[];
}

interface DeloadStatus {
  [key: string]: number;
}

function App() {
  const [workouts, setWorkouts] = useState<Workout>({
    A: [
      { name: 'Squat', best_pr: '315/5' },
      { name: 'Bench Press', best_pr: '225/8' },
      { name: 'Barbell Row', best_pr: '185/10' },
    ],
    B: [
      { name: 'Deadlift', best_pr: '405/3' },
      { name: 'Overhead Press', best_pr: '135/8' },
      { name: 'Pull Ups', best_pr: 'BW/12' },
    ],
  });
  
  const [deloadStatus, setDeloadStatus] = useState<DeloadStatus>({
    A: 4,
    B: 5,
  });
  
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [coreFoods, setCoreFoods] = useState(false);
  const [inputs, setInputs] = useState<{[key: string]: {weight: string, reps: string}}>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleWorkout = (letter: string) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(letter)) {
      newExpanded.delete(letter);
    } else {
      newExpanded.add(letter);
    }
    setExpandedWorkouts(newExpanded);
  };

  const handleInputChange = (workout: string, exercise: string, type: 'weight' | 'reps', value: string) => {
    const key = `${workout}:${exercise}`;
    setInputs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: value
      }
    }));
  };

  const submitWorkout = () => {
    // Find which workout has data
    const workoutsWithData = new Set<string>();
    Object.keys(inputs).forEach(key => {
      const [workout] = key.split(':');
      if (inputs[key].weight || inputs[key].reps) {
        workoutsWithData.add(workout);
      }
    });

    if (workoutsWithData.size === 0) {
      alert('Please enter at least one exercise');
      return;
    }
    if (workoutsWithData.size > 1) {
      alert('Please log only one workout at a time');
      return;
    }

    // Show success and clear
    setShowSuccess(true);
    setInputs({});
    setCoreFoods(false);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', color: '#e0e0e0', padding: '6px', fontSize: '13px', lineHeight: '1.2' }}>
      {/* Header */}
      <div style={{ background: '#2a2a2a', padding: '8px', borderRadius: '6px', marginBottom: '6px' }}>
        <h1 style={{ fontSize: '15px', marginBottom: '2px', fontWeight: 600 }}>Three Target Method</h1>
        <div style={{ fontSize: '13px', color: '#888' }}>Tap workout to expand</div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div style={{ background: '#4CAF50', color: 'white', padding: '8px', borderRadius: '6px', marginBottom: '6px', fontSize: '12px' }}>
          ✅ Workout logged successfully!
        </div>
      )}

      {/* Workouts */}
      {Object.keys(workouts).map(letter => (
        <div key={letter} style={{ background: '#2a2a2a', borderRadius: '6px', marginBottom: '4px', overflow: 'hidden' }}>
          {/* Workout Header */}
          <div 
            onClick={() => toggleWorkout(letter)}
            style={{ 
              background: '#3a3a3a', 
              padding: '8px 10px', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Workout {letter}</span>
            <span style={{ 
              fontSize: '11px', 
              color: deloadStatus[letter] >= 6 ? '#ff6b35' : '#4CAF50', 
              fontWeight: 500 
            }}>
              {deloadStatus[letter]}/6 {deloadStatus[letter] >= 6 && '⚠️ DELOAD'}
            </span>
          </div>

          {/* Workout Content */}
          {expandedWorkouts.has(letter) && (
            <div style={{ padding: '8px' }}>
              {workouts[letter].map((exercise, idx) => {
                const key = `${letter}:${exercise.name}`;
                return (
                  <div 
                    key={idx}
                    style={{ 
                      marginBottom: '8px', 
                      paddingBottom: '8px', 
                      borderBottom: idx < workouts[letter].length - 1 ? '1px solid #3a3a3a' : 'none' 
                    }}
                  >
                    {/* Exercise Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{exercise.name}</div>
                      <div style={{ fontSize: '10px', color: exercise.best_pr ? '#888' : '#666' }}>
                        {exercise.best_pr ? (
                          <>PR: <span style={{ color: '#4CAF50', fontWeight: 600 }}>{exercise.best_pr}</span></>
                        ) : '--'}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: '#999' }}>Weight:</label>
                        <input
                          type="number"
                          value={inputs[key]?.weight || ''}
                          onChange={(e) => handleInputChange(letter, exercise.name, 'weight', e.target.value)}
                          placeholder="lbs"
                          step="0.5"
                          style={{
                            width: '50px',
                            padding: '6px 4px',
                            background: '#1a1a1a',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            color: '#e0e0e0',
                            fontSize: '14px',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: '#999' }}>Reps:</label>
                        <input
                          type="number"
                          value={inputs[key]?.reps || ''}
                          onChange={(e) => handleInputChange(letter, exercise.name, 'reps', e.target.value)}
                          placeholder="reps"
                          style={{
                            width: '50px',
                            padding: '6px 4px',
                            background: '#1a1a1a',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            color: '#e0e0e0',
                            fontSize: '14px',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Core Foods */}
      <div style={{ background: '#2a2a2a', padding: '8px', borderRadius: '6px', margin: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input 
          type="checkbox" 
          id="core-foods" 
          checked={coreFoods}
          onChange={(e) => setCoreFoods(e.target.checked)}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <label htmlFor="core-foods" style={{ fontSize: '13px', cursor: 'pointer' }}>Ate core foods today</label>
      </div>

      {/* Submit Button */}
      <button 
        onClick={submitWorkout}
        style={{
          width: '100%',
          padding: '10px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: '4px'
        }}
      >
        Log Workout
      </button>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import './index.css';
import DashboardAPI, { Exercise, Workout, DeloadStatus } from './api';

function App() {
  // Dashboard state
  const [api, setApi] = useState<DashboardAPI | null>(null);
  const [username, setUsername] = useState<string>('');
  const [workouts, setWorkouts] = useState<Workout>({});
  const [deloadStatus, setDeloadStatus] = useState<DeloadStatus>({});
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [coreFoods, setCoreFoods] = useState(false);
  const [inputs, setInputs] = useState<{[key: string]: {weight: string, reps: string}}>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Load dashboard on mount using URL path
  useEffect(() => {
    const loadDashboard = async () => {
      // Get unique code from URL path
      const path = window.location.pathname;
      const uniqueCode = path.substring(1); // Remove leading slash
      
      if (!uniqueCode) {
        setAuthError('Invalid dashboard link. Please check your link and try again.');
        setIsLoading(false);
        return;
      }
      
      try {
        const apiInstance = new DashboardAPI(uniqueCode);
        
        // Test the code by fetching workouts
        const workoutData = await apiInstance.getWorkouts();
        
        // Success! Set up dashboard
        setApi(apiInstance);
        setUsername(workoutData.username);
        
        // Load initial data
        await loadDashboardData(apiInstance);
        
      } catch (error) {
        setAuthError('Invalid dashboard link. Please check your link and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboard();
  }, []);

  const loadDashboardData = async (apiInstance: DashboardAPI) => {
    try {
      // Load workouts, best PRs, and deload status
      const [workoutData, bestPRs, deloadData] = await Promise.all([
        apiInstance.getWorkouts(),
        apiInstance.getBestPRs(),
        apiInstance.getDeloadStatus()
      ]);
      
      // Merge best PRs into workout data
      const workoutsWithPRs: Workout = {};
      for (const [letter, exercises] of Object.entries(workoutData.workouts)) {
        workoutsWithPRs[letter] = exercises.map(ex => ({
          ...ex,
          best_pr: bestPRs[ex.name]
        }));
      }
      
      setWorkouts(workoutsWithPRs);
      setDeloadStatus(deloadData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

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

  const submitWorkout = async () => {
    if (!api) return;
    
    setSubmitError('');
    
    // Find which workout has data
    const workoutsWithData = new Set<string>();
    const exercisesData: Array<{name: string, weight: number, reps: number}> = [];
    
    Object.keys(inputs).forEach(key => {
      const [workout, exercise] = key.split(':');
      const weight = inputs[key].weight;
      const reps = inputs[key].reps;
      
      if (weight || reps) {
        workoutsWithData.add(workout);
        exercisesData.push({
          name: exercise,
          weight: parseFloat(weight) || 0,
          reps: parseInt(reps) || 0
        });
      }
    });

    if (workoutsWithData.size === 0) {
      setSubmitError('Please enter at least one exercise');
      return;
    }
    if (workoutsWithData.size > 1) {
      setSubmitError('Please log only one workout at a time');
      return;
    }

    const workoutLetter = Array.from(workoutsWithData)[0];
    
    try {
      const result = await api.logWorkout({
        workout_letter: workoutLetter,
        exercises: exercisesData,
        core_foods: coreFoods
      });
      
      // Show success
      setShowSuccess(true);
      setInputs({});
      setCoreFoods(false);
      
      // Update deload status
      setDeloadStatus(prev => ({
        ...prev,
        [workoutLetter]: result.new_completion_count
      }));
      
      // Reload best PRs
      const bestPRs = await api.getBestPRs();
      const updatedWorkouts: Workout = {};
      for (const [letter, exercises] of Object.entries(workouts)) {
        updatedWorkouts[letter] = exercises.map(ex => ({
          ...ex,
          best_pr: bestPRs[ex.name]
        }));
      }
      setWorkouts(updatedWorkouts);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to log workout');
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div style={{ 
        background: '#1a1a1a', 
        minHeight: '100vh', 
        color: '#e0e0e0', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ fontSize: '18px', color: '#888' }}>Loading dashboard...</div>
      </div>
    );
  }

  // Error screen
  if (authError) {
    return (
      <div style={{ 
        background: '#1a1a1a', 
        minHeight: '100vh', 
        color: '#e0e0e0', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: '#2a2a2a',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#ff4444',
            color: 'white',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '14px',
            marginBottom: '15px'
          }}>
            {authError}
          </div>
          <p style={{ fontSize: '13px', color: '#888' }}>
            Please contact your coach for your personal dashboard link.
          </p>
        </div>
      </div>
    );
  }

  // Dashboard screen
  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', color: '#e0e0e0', padding: '6px', fontSize: '13px', lineHeight: '1.2' }}>
      {/* Header */}
      <div style={{ background: '#2a2a2a', padding: '8px', borderRadius: '6px', marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '15px', marginBottom: '2px', fontWeight: 600 }}>{username}'s Program</h1>
            <div style={{ fontSize: '11px', color: '#888' }}>Three Target Method</div>
          </div>
        </div>
        <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Tap workout to expand</div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div style={{ background: '#4CAF50', color: 'white', padding: '8px', borderRadius: '6px', marginBottom: '6px', fontSize: '12px' }}>
          ✅ Workout logged successfully!
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div style={{ background: '#ff4444', color: 'white', padding: '8px', borderRadius: '6px', marginBottom: '6px', fontSize: '12px' }}>
          ❌ {submitError}
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
              {deloadStatus[letter] || 0}/6 {deloadStatus[letter] >= 6 && '⚠️ DELOAD'}
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

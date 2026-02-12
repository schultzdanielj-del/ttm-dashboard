import { useState, useEffect } from 'react';
import './index.css';

// Types
interface Exercise {
  id: string;
  name: string;
  bestPR: {
    weight: number;
    reps: number;
  };
}

interface Workout {
  id: string;
  letter: string;
  exercises: Exercise[];
  expanded: boolean;
}

interface CoreFood {
  date: string;
  proteins: number;
  veggies: number;
}

function App() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [deloadProgress, setDeloadProgress] = useState(0);
  const [coreFoods, setCoreFoods] = useState<CoreFood[]>([]);
  
  // Mock data - replace with API calls
  useEffect(() => {
    // TODO: Fetch from API
    setWorkouts([
      {
        id: '1',
        letter: 'A',
        expanded: false,
        exercises: [
          { id: '1', name: 'Squat', bestPR: { weight: 315, reps: 5 } },
          { id: '2', name: 'Bench Press', bestPR: { weight: 225, reps: 8 } },
          { id: '3', name: 'Barbell Row', bestPR: { weight: 185, reps: 10 } },
        ]
      },
      {
        id: '2',
        letter: 'B',
        expanded: false,
        exercises: [
          { id: '4', name: 'Deadlift', bestPR: { weight: 405, reps: 3 } },
          { id: '5', name: 'Overhead Press', bestPR: { weight: 135, reps: 8 } },
          { id: '6', name: 'Pull Ups', bestPR: { weight: 45, reps: 12 } },
        ]
      },
    ]);
    
    setDeloadProgress(66); // 4/6 workouts completed
    
    setCoreFoods([
      { date: '2026-02-11', proteins: 4, veggies: 3 },
      { date: '2026-02-10', proteins: 4, veggies: 3 },
      { date: '2026-02-09', proteins: 3, veggies: 3 },
      { date: '2026-02-08', proteins: 4, veggies: 2 },
      { date: '2026-02-07', proteins: 4, veggies: 3 },
      { date: '2026-02-06', proteins: 4, veggies: 3 },
      { date: '2026-02-05', proteins: 4, veggies: 3 },
    ]);
  }, []);

  const toggleWorkout = (workoutId: string) => {
    setWorkouts(workouts.map(w => 
      w.id === workoutId ? { ...w, expanded: !w.expanded } : w
    ));
  };

  const calculateWarmup = (weight: number): number => {
    return Math.round(weight * 0.5 / 5) * 5;
  };

  const calculateFeeler = (weight: number): number => {
    return Math.round(weight * 0.75 / 5) * 5;
  };

  const handleLog = (exerciseId: string, weight: number, reps: number) => {
    console.log('Log PR:', { exerciseId, weight, reps });
    // TODO: API call to log PR
  };

  return (
    <div className="min-h-screen bg-black text-white font-roboto">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Three Target Method</h1>
      </div>

      {/* Deload Progress */}
      <div className="p-4">
        <div className="mb-2 flex justify-between text-sm">
          <span>Deload Progress</span>
          <span>{deloadProgress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${deloadProgress}%` }}
          />
        </div>
      </div>

      {/* Workouts */}
      <div className="p-4 space-y-3">
        {workouts.map(workout => (
          <div key={workout.id} className="border border-gray-800 rounded">
            {/* Workout Header */}
            <button
              onClick={() => toggleWorkout(workout.id)}
              className="w-full p-3 flex justify-between items-center hover:bg-gray-900"
            >
              <span className="font-bold">Workout {workout.letter}</span>
              <span className="text-gray-400">{workout.expanded ? '▼' : '▶'}</span>
            </button>

            {/* Exercises */}
            {workout.expanded && (
              <div className="border-t border-gray-800">
                {workout.exercises.map(exercise => (
                  <div key={exercise.id} className="p-3 border-b border-gray-800 last:border-b-0">
                    {/* Exercise Name & Best PR */}
                    <div className="mb-2">
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-gray-400">
                        Best PR: {exercise.bestPR.weight}/{exercise.bestPR.reps}
                      </div>
                    </div>

                    {/* Warmup & Feeler */}
                    <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                      <div>
                        <span className="text-gray-400">Warmup: </span>
                        <span>{calculateWarmup(exercise.bestPR.weight)} lbs</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Feeler: </span>
                        <span>{calculateFeeler(exercise.bestPR.weight)} lbs</span>
                      </div>
                    </div>

                    {/* Input Fields */}
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Weight"
                        className="w-20 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        className="w-16 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm"
                      />
                      <button
                        onClick={() => handleLog(exercise.id, 0, 0)}
                        className="px-4 py-1 bg-orange-500 hover:bg-orange-600 rounded text-sm font-medium"
                      >
                        Log
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Core Foods */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-3">Core Foods (Last 7 Days)</h2>
        <div className="space-y-2">
          {coreFoods.map(food => (
            <div key={food.date} className="flex justify-between items-center p-2 bg-gray-900 rounded">
              <span className="text-sm">{new Date(food.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <div className="flex gap-4 text-sm">
                <span className={food.proteins >= 4 ? 'text-green-500' : 'text-red-500'}>
                  P: {food.proteins}/4
                </span>
                <span className={food.veggies >= 3 ? 'text-green-500' : 'text-red-500'}>
                  V: {food.veggies}/3
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

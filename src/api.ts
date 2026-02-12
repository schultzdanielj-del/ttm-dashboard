/**
 * TTM Dashboard API Service
 * Connects to FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ttm-metrics-api-production.up.railway.app';

export interface Exercise {
  name: string;
  best_pr?: string;
  special_logging?: 'weight_only' | 'reps_as_seconds';
  setup_notes?: string;
  video_link?: string;
}

export interface Workout {
  [key: string]: Exercise[];
}

export interface DeloadStatus {
  [key: string]: number;
}

export interface WorkoutData {
  user_id: string;
  username: string;
  workouts: Workout;
}

export interface LogWorkoutRequest {
  workout_letter: string;
  exercises: Array<{
    name: string;
    weight: number;
    reps: number;
  }>;
  core_foods: boolean;
}

export interface CoreFoodsData {
  [date: string]: boolean;
}

class DashboardAPI {
  private uniqueCode: string;

  constructor(uniqueCode: string) {
    this.uniqueCode = uniqueCode;
  }

  /**
   * Get user's workout program
   */
  async getWorkouts(): Promise<WorkoutData> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/${this.uniqueCode}/workouts`);
    if (!response.ok) {
      throw new Error('Failed to fetch workouts');
    }
    return response.json();
  }

  /**
   * Get best PRs for all exercises
   */
  async getBestPRs(): Promise<{ [exercise: string]: string }> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/${this.uniqueCode}/best-prs`);
    if (!response.ok) {
      throw new Error('Failed to fetch best PRs');
    }
    return response.json();
  }

  /**
   * Get deload status (completion counts)
   */
  async getDeloadStatus(): Promise<DeloadStatus> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/${this.uniqueCode}/deload-status`);
    if (!response.ok) {
      throw new Error('Failed to fetch deload status');
    }
    return response.json();
  }

  /**
   * Log a workout
   */
  async logWorkout(workoutData: LogWorkoutRequest): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/${this.uniqueCode}/log-workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to log workout');
    }
    
    return response.json();
  }

  /**
   * Get last 7 days of core foods check-ins
   */
  async getCoreFoods(): Promise<CoreFoodsData> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/${this.uniqueCode}/core-foods`);
    if (!response.ok) {
      throw new Error('Failed to fetch core foods');
    }
    return response.json();
  }
}

export default DashboardAPI;

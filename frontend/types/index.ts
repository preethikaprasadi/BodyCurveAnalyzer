export type BodyShapeType = "hourglass" | "rectangle" | "pear" | "inverted_triangle" | "apple";

export type FitnessGoal = "maintain" | "muscle_gain" | "fat_loss" | "mobility";

export type ActivityLevel = "beginner" | "intermediate" | "advanced";

export interface MeasurementInput {
  height: number;
  weight: number;
  shoulder: number;
  bust: number;
  waist: number;
  hip: number;
  goal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  userId?: string;
  date?: string;
  saveRecord?: boolean;
  notes?: string;
}

export interface Proportions {
  bmi: number;
  bmiCategory: string;
  waistHipRatio: number;
  shoulderHipRatio: number;
  waistBustRatio: number;
  bustHipRatio: number;
}

export interface AnalysisResult {
  bodyShape: BodyShapeType;
  displayName: string;
  description: string;
  confidence: number;
  probabilities: Record<string, number>;
  proportions: Proportions;
  modelUsed: string;
}

export interface GoalCustomization {
  selectedGoal: string;
  title: string;
  guidance: string;
}

export interface ActivityCustomization {
  selectedLevel: string;
  frequency: string;
  intensity: string;
}

export interface FitnessRecommendations {
  focus: string;
  exercises: string[];
  cardio: string;
  weeklyStructure: string;
}

export interface WellnessRecommendations {
  nutritionTips: string[];
  postureTips: string[];
  recovery: string;
}

export interface FashionRecommendations {
  tops: string[];
  bottoms: string[];
  dresses: string[];
  outerwear: string[];
  stylingTips: string[];
  avoid: string[];
}

export interface RecommendationsData {
  bodyShape: BodyShapeType;
  displayName: string;
  summary: string;
  goalCustomization: GoalCustomization;
  activityCustomization: ActivityCustomization;
  fitness: FitnessRecommendations;
  wellness: WellnessRecommendations;
  fashion: FashionRecommendations;
}

export interface AnalyzeResponse {
  success: boolean;
  inputMeasurements: Record<string, number>;
  analysis: AnalysisResult;
  recommendations: RecommendationsData;
  savedRecord?: any;
  error?: string;
  details?: string[];
}

export interface MeasurementRecord {
  id: number;
  userId: string;
  date: string;
  height: number;
  weight: number;
  shoulder: number;
  bust: number;
  waist: number;
  hip: number;
  bodyShape: string;
  confidence: number;
  bmi: number;
  waistHipRatio: number;
  shoulderHipRatio: number;
  notes?: string;
  createdAt: string;
}

export interface ProgressTimelinePoint {
  date: string;
  weight: number;
  waist: number;
  hip: number;
  bust: number;
  bmi: number;
  waistHipRatio: number;
  bodyShape: string;
}

export interface ProgressData {
  totalRecords: number;
  timeline: ProgressTimelinePoint[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  ageRange?: string;
  gender?: string;
  goal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  error?: string;
  details?: string[];
}

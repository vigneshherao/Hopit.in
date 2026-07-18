export const AI_FEATURES = ['land-analysis', 'crop-recommendation', 'business-recommendation', 'chat'] as const;

export const AI_SEASONS = ['kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon', 'year-round'] as const;
export const FARMING_EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'experienced', 'expert'] as const;
export const FARMING_TYPES = ['traditional', 'organic', 'natural', 'commercial', 'mixed', 'precision'] as const;
export const AI_RISK_LEVELS = ['low', 'medium', 'high'] as const;
export const MARKET_DEMAND_LEVELS = ['low', 'medium', 'high'] as const;
export const WATER_REQUIREMENT_LEVELS = ['low', 'medium', 'high'] as const;

export type AIFeature = (typeof AI_FEATURES)[number];

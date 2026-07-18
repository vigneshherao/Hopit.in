import { z } from 'zod';
import { ASSISTANT_REPORT_TYPES } from '@/constants/assistant.constants.js';

export const farmPlanIdParamSchema = z.object({
  farmPlanId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid farm plan id.'),
});

export const assistantChatSchema = z.object({
  farmPlanId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid farm plan id.'),
  conversationId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid conversation id.').optional(),
  message: z.string().trim().min(2).max(1200),
  regenerateMessageId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid message id.').optional(),
});

export const assistantAnalyzeSchema = z.object({
  farmPlanId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid farm plan id.'),
  focus: z.enum(['weekly-advice', 'risk-analysis', 'profit-suggestions', 'cost-reduction', 'harvest-readiness', 'general']).default('general'),
});

export const reportSchema = z.object({
  farmPlanId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid farm plan id.'),
  reportType: z.enum(ASSISTANT_REPORT_TYPES).default('weekly'),
  format: z.enum(['markdown', 'pdf', 'excel']).default('markdown'),
});

export const assistantQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(20),
  search: z.string().trim().max(80).optional(),
});

export const assistantChatResponseSchema = z.object({
  answer: z.string().min(1).max(5000),
  healthScore: z.number().min(0).max(100).optional(),
  suggestedActions: z.array(z.string().min(1).max(180)).max(8).default([]),
  suggestedQuestions: z.array(z.string().min(1).max(180)).max(8).default([]),
  confidenceScore: z.number().min(0).max(100),
});

export const assistantAnalyzeResponseSchema = z.object({
  summary: z.string().min(1).max(2000),
  healthScore: z.number().min(0).max(100),
  insights: z
    .array(
      z.object({
        title: z.string().min(1).max(180),
        category: z.string().min(1).max(40),
        priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
        description: z.string().min(1).max(1200),
        recommendation: z.string().min(1).max(1200),
        confidenceScore: z.number().min(0).max(100),
      }),
    )
    .max(12),
  recommendations: z.array(z.string().min(1).max(220)).max(12),
});

export const assistantForecastResponseSchema = z.object({
  forecasts: z
    .array(
      z.object({
        forecastType: z.enum(['Harvest', 'Revenue', 'Expense', 'Profit', 'ROI', 'Risk', 'Yield', 'Water', 'Labour']),
        prediction: z.string().min(1).max(1500),
        confidence: z.number().min(0).max(100),
        estimatedDate: z.string().datetime().optional(),
        metadata: z
          .object({
            reasoning: z.string().max(1200).optional(),
            assumptions: z.array(z.string().max(180)).max(8).optional(),
            possibleRisks: z.array(z.string().max(180)).max(8).optional(),
            recommendations: z.array(z.string().max(180)).max(8).optional(),
          })
          .optional(),
      }),
    )
    .min(1)
    .max(12),
});

export const assistantReportResponseSchema = z.object({
  title: z.string().min(1).max(180),
  format: z.enum(['markdown', 'pdf', 'excel']),
  reportType: z.enum(ASSISTANT_REPORT_TYPES),
  executiveSummary: z.string().min(1).max(2500),
  sections: z.array(z.object({ title: z.string().min(1).max(120), content: z.string().min(1).max(3000) })).min(1).max(12),
  healthScore: z.number().min(0).max(100),
  recommendations: z.array(z.string().min(1).max(220)).max(12),
});

export type AssistantChatInput = z.infer<typeof assistantChatSchema>;
export type AssistantAnalyzeInput = z.infer<typeof assistantAnalyzeSchema>;
export type AssistantReportInput = z.infer<typeof reportSchema>;
export type AssistantQuery = z.infer<typeof assistantQuerySchema>;


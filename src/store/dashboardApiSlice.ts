import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';
import type {
  ConversationStat, TopQuery, LanguageStat, CoverageTopic, OverviewStats, Period,
  AdoptionFunnelStage, AdoptionSegment, StandTypeAdoption, UserRetention,
  FeedbackSentiment, Escalation, IntentOutcome, OpsImpact, RecentConversation,
} from '../types';

type PeriodArg = { period?: Period };

export const dashboardApiSlice = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    // Tab 0 — Overview KPI cards (period-aware)
    getOverviewStats: builder.query<OverviewStats, PeriodArg>({
      query: ({ period } = {}) => ({ url: '/dashboard/overview-stats', params: period ? { period } : undefined }),
    }),

    // Tab 0 — Recent Conversations (period-aware)
    getRecentConversations: builder.query<RecentConversation[], PeriodArg>({
      query: ({ period } = {}) => ({ url: '/dashboard/recent-conversations', params: period ? { period } : undefined }),
    }),

    // Tab 0 — Charts (period-aware)
    getConversationStats: builder.query<ConversationStat[], PeriodArg>({
      query: ({ period } = {}) => ({ url: '/dashboard/conversation-stats', params: period ? { period } : undefined }),
    }),
    getLanguageStats: builder.query<LanguageStat[], PeriodArg>({
      query: ({ period } = {}) => ({ url: '/dashboard/language-stats', params: period ? { period } : undefined }),
    }),
    getTopQueries: builder.query<TopQuery[], PeriodArg>({
      query: ({ period } = {}) => ({ url: '/dashboard/top-queries', params: period ? { period } : undefined }),
    }),

    // Tab 1 — Adoption
    getAdoptionFunnel: builder.query<AdoptionFunnelStage[], void>({
      query: () => ({ url: '/dashboard/adoption-funnel' }),
    }),
    getAdoptionSegments: builder.query<AdoptionSegment[], void>({
      query: () => ({ url: '/dashboard/adoption-segments' }),
    }),
    getStandTypeAdoption: builder.query<StandTypeAdoption[], void>({
      query: () => ({ url: '/dashboard/stand-type-adoption' }),
    }),
    getUserRetention: builder.query<UserRetention[], void>({
      query: () => ({ url: '/dashboard/user-retention' }),
    }),

    // Tab 3 — Response Quality
    getFeedbackSentiment: builder.query<FeedbackSentiment[], void>({
      query: () => ({ url: '/dashboard/feedback-sentiment' }),
    }),
    getEscalations: builder.query<Escalation[], void>({
      query: () => ({ url: '/dashboard/escalations' }),
    }),
    getIntentOutcome: builder.query<IntentOutcome[], void>({
      query: () => ({ url: '/dashboard/intent-outcome' }),
    }),

    // Tab 4 — Knowledge Base
    getCoverageTopics: builder.query<CoverageTopic[], void>({
      query: () => ({ url: '/dashboard/coverage-topics' }),
    }),

    // Tab 5 — Operational Insights
    getOpsImpact: builder.query<OpsImpact[], void>({
      query: () => ({ url: '/dashboard/ops-impact' }),
    }),
  }),
});

export const {
  // Auto-fetch on mount (Tab 0 — Overview)
  useGetOverviewStatsQuery,
  useGetRecentConversationsQuery,
  useGetConversationStatsQuery,
  useGetLanguageStatsQuery,
  useGetTopQueriesQuery,

  // Lazy — fetch on tab switch (Tabs 1, 3, 4, 5)
  useLazyGetAdoptionFunnelQuery,
  useLazyGetAdoptionSegmentsQuery,
  useLazyGetStandTypeAdoptionQuery,
  useLazyGetUserRetentionQuery,
  useLazyGetFeedbackSentimentQuery,
  useLazyGetEscalationsQuery,
  useLazyGetIntentOutcomeQuery,
  useLazyGetCoverageTopicsQuery,
  useLazyGetOpsImpactQuery,
} = dashboardApiSlice;

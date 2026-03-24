import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';

export interface EventOut {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
}

export interface EventCreate {
  name: string;
  description?: string | null;
  start_date: string; // ISO datetime
  end_date: string;   // ISO datetime
}

export interface EventUpdate {
  name?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

// event_id null → create, provided → update
export interface EventUpsert {
  event_id?: number | null;
  name: string;
  description?: string | null;
  start_date: string;
  end_date: string;
}

export interface ChatbotConfigOut {
  id: number;
  event_id: number;
  bot_name: string | null;
  welcome_message: string | null;
  chatboticon: string | null;
  chatbotscript: string | null;
  isactive: boolean;
  createddate: string | null;
  modifieddate: string | null;
}

export interface ChatbotConfigCreate {
  bot_name?: string | null;
  welcome_message?: string | null;
  chatboticon?: string | null;
  chatbotscript?: string | null;
  isactive?: boolean;
}

export interface ChatbotConfigUpdate {
  bot_name?: string | null;
  welcome_message?: string | null;
  chatboticon?: string | null;
  chatbotscript?: string | null;
  isactive?: boolean | null;
}

// event_id required; create if absent, update if exists
export interface ChatbotConfigUpsert {
  event_id: number;
  bot_name?: string | null;
  welcome_message?: string | null;
  chatboticon?: string | null;
  chatbotscript?: string | null;
  isactive?: boolean;
}

export interface EventLanguageOut {
  id: number;
  event_id: number;
  language: string | null;
  isactive: boolean;
}

export interface EventLanguageItem {
  language: string;
  isactive?: boolean;
}

export interface ChatbotThemeOut {
  id: number;
  event_id: number;
  background: string | null;
  foreground: string | null;
  fontsize: number | null;
  isactive: boolean;
  createddate: string | null;
  modifieddate: string | null;
}

export interface ChatbotThemeCreate {
  background?: string | null;
  foreground?: string | null;
  fontsize?: number | null;
  isactive?: boolean;
}

export interface ChatbotThemeUpdate {
  background?: string | null;
  foreground?: string | null;
  fontsize?: number | null;
  isactive?: boolean | null;
}

export const eventsApiSlice = createApi({
  reducerPath: 'eventsApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Events', 'ChatbotConfig', 'EventLanguages'],
  endpoints: (builder) => ({
    // Events CRUD
    getEvents: builder.query<EventOut[], void>({
      query: () => ({ url: 'events' }),
      providesTags: ['Events'],
    }),
    getEvent: builder.query<EventOut, number>({
      query: (id) => ({ url: `events/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Events', id }],
    }),
    createEvent: builder.mutation<EventOut, EventCreate>({
      query: (data) => ({ url: 'events', method: 'POST', data }),
      invalidatesTags: ['Events'],
    }),
    updateEvent: builder.mutation<EventOut, { id: number; data: EventUpdate }>({
      query: ({ id, data }) => ({ url: `events/${id}`, method: 'PUT', data }),
      invalidatesTags: (_r, _e, { id }) => ['Events', { type: 'Events', id }],
    }),
    upsertEvent: builder.mutation<EventOut, EventUpsert>({
      query: (data) => ({ url: 'events/upsert', method: 'POST', data }),
      invalidatesTags: (_r, _e, arg) => ['Events', ...(arg.event_id ? [{ type: 'Events' as const, id: arg.event_id }] : [])],
    }),
    deleteEvent: builder.mutation<void, number>({
      query: (id) => ({ url: `events/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Events'],
    }),

    // Chatbot Config
    getChatbotConfig: builder.query<ChatbotConfigOut, number>({
      query: (eventId) => ({ url: `events/${eventId}/chatbot-config` }),
      providesTags: (_r, _e, eventId) => [{ type: 'ChatbotConfig', id: eventId }],
    }),
    createChatbotConfig: builder.mutation<ChatbotConfigOut, { eventId: number; data: ChatbotConfigCreate }>({
      query: ({ eventId, data }) => ({ url: `events/${eventId}/chatbot-config`, method: 'POST', data }),
      invalidatesTags: (_r, _e, { eventId }) => [{ type: 'ChatbotConfig', id: eventId }],
    }),
    updateChatbotConfig: builder.mutation<ChatbotConfigOut, { eventId: number; data: ChatbotConfigUpdate }>({
      query: ({ eventId, data }) => ({ url: `events/${eventId}/chatbot-config`, method: 'PUT', data }),
      invalidatesTags: (_r, _e, { eventId }) => [{ type: 'ChatbotConfig', id: eventId }],
    }),
    upsertChatbotConfig: builder.mutation<ChatbotConfigOut, ChatbotConfigUpsert>({
      query: (data) => ({ url: 'events/chatbot-config/upsert', method: 'POST', data }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'ChatbotConfig', id: arg.event_id }],
    }),

    // Theme
    getChatbotTheme: builder.query<ChatbotThemeOut, number>({
      query: (eventId) => ({ url: `events/${eventId}/theme` }),
      providesTags: (_r, _e, eventId) => [{ type: 'ChatbotConfig' as const, id: `theme-${eventId}` }],
    }),
    createChatbotTheme: builder.mutation<ChatbotThemeOut, { eventId: number; data: ChatbotThemeCreate }>({
      query: ({ eventId, data }) => ({ url: `events/${eventId}/theme`, method: 'POST', data }),
      invalidatesTags: (_r, _e, { eventId }) => [{ type: 'ChatbotConfig' as const, id: `theme-${eventId}` }],
    }),
    updateChatbotTheme: builder.mutation<ChatbotThemeOut, { eventId: number; data: ChatbotThemeUpdate }>({
      query: ({ eventId, data }) => ({ url: `events/${eventId}/theme`, method: 'PUT', data }),
      invalidatesTags: (_r, _e, { eventId }) => [{ type: 'ChatbotConfig' as const, id: `theme-${eventId}` }],
    }),

    // Languages
    getEventLanguages: builder.query<EventLanguageOut[], number>({
      query: (eventId) => ({ url: `events/${eventId}/languages` }),
      providesTags: (_r, _e, eventId) => [{ type: 'EventLanguages', id: eventId }],
    }),
    setEventLanguages: builder.mutation<EventLanguageOut[], { eventId: number; languages: EventLanguageItem[] }>({
      query: ({ eventId, languages }) => ({ url: `events/${eventId}/languages`, method: 'PUT', data: { languages } }),
      invalidatesTags: (_r, _e, { eventId }) => [{ type: 'EventLanguages', id: eventId }],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useUpsertEventMutation,
  useDeleteEventMutation,
  useGetChatbotConfigQuery,
  useCreateChatbotConfigMutation,
  useUpdateChatbotConfigMutation,
  useUpsertChatbotConfigMutation,
  useGetChatbotThemeQuery,
  useCreateChatbotThemeMutation,
  useUpdateChatbotThemeMutation,
  useGetEventLanguagesQuery,
  useSetEventLanguagesMutation,
} = eventsApiSlice;

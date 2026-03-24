import { configureStore } from '@reduxjs/toolkit';
import { dashboardApiSlice } from './dashboardApiSlice';
import { analyticsApiSlice } from './analyticsApiSlice';
import { eventsApiSlice } from './eventsApiSlice';

export const store = configureStore({
  reducer: {
    [dashboardApiSlice.reducerPath]: dashboardApiSlice.reducer,
    [analyticsApiSlice.reducerPath]: analyticsApiSlice.reducer,
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(dashboardApiSlice.middleware)
      .concat(analyticsApiSlice.middleware)
      .concat(eventsApiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

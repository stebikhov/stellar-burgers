import { getFeedsApi } from '@api';

import {
  PayloadAction,
  SerializedError,
  createAsyncThunk,
  createSlice
} from '@reduxjs/toolkit';

import { TOrdersData } from '@utils-types';

type TFeedsState = {
  isLoading: boolean;
  error: null | SerializedError;
  data: TOrdersData;
};

export const initialState: TFeedsState = {
  isLoading: true,
  error: null,
  data: {
    orders: [],
    total: 0,
    totalToday: 0
  }
};

export const fetchFeeds = createAsyncThunk<TOrdersData, void>(
  'feed/fetch',
  async () => getFeedsApi()
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.error = null;
        state.isLoading = true;
      })

      .addCase(fetchFeeds.rejected, (state, action) => {
        state.error = action.error;
        state.isLoading = false;
      })

      .addCase(
        fetchFeeds.fulfilled,
        (state, action: PayloadAction<TOrdersData>) => {
          state.data = action.payload;
          state.isLoading = false;
        }
      );
  }
});

export default feedSlice.reducer;

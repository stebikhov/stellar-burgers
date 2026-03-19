import { getIngredientsApi } from '@api';

import {
  SerializedError,
  createAsyncThunk,
  createSlice
} from '@reduxjs/toolkit';

import { TIngredient } from '@utils-types';

type TIngredientsState = {
  isLoading: boolean;
  error: null | SerializedError;
  data: TIngredient[];
};

export const initialState: TIngredientsState = {
  isLoading: true,
  error: null,
  data: []
};

export const fetchIngredients = createAsyncThunk(
  'ingredients/fetch',
  getIngredientsApi
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.error = null;
        state.isLoading = true;
      })

      .addCase(fetchIngredients.rejected, (state, action) => {
        state.error = action.error;
        state.isLoading = false;
      })

      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
        state.isLoading = false;
      });
  }
});

export default ingredientsSlice.reducer;

import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { TConstructorIngredient, TIngredient } from '@utils-types';

import { v4 as uuidv4 } from 'uuid';

type TConstructorState = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
};

export const initialState: TConstructorState = {
  bun: null,
  ingredients: []
};

const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,

  reducers: {
    setBun(state, action: PayloadAction<TIngredient | null>) {
      state.bun = action.payload;
    },

    addIngredient: {
      prepare: (ingredient: TIngredient) => {
        const id = uuidv4();
        return {
          payload: { ...ingredient, id }
        };
      },

      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        const ingredient = action.payload;

        if (ingredient.type === 'bun') {
          state.bun = ingredient;
          return;
        }

        state.ingredients.push(ingredient);
      }
    },
    removeIngredient(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.ingredients = state.ingredients.filter(
        (ingredient) => ingredient.id !== id
      );
    },

    moveIngredient(
      state,
      action: PayloadAction<{ index: number; upwards: boolean }>
    ) {
      const { index, upwards } = action.payload;
      const newIndex = upwards ? index - 1 : index + 1;

      if (upwards && index === 0) {
        return;
      }

      if (!upwards && index === state.ingredients.length - 1) {
        return;
      }

      const temp = state.ingredients[index];
      state.ingredients[index] = state.ingredients[newIndex];
      state.ingredients[newIndex] = temp;
    },

    resetConstructor(state) {
      state.bun = null;
      state.ingredients = [];
    }
  }
});

export const {
  setBun,
  addIngredient,
  removeIngredient,
  moveIngredient,
  resetConstructor
} = constructorSlice.actions;

export default constructorSlice.reducer;

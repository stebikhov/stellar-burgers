// Мокируем API перед импортом slices
jest.mock('../../../utils/burger-api');

import { TIngredient } from '@utils-types';
import ingredientsReducer, {
  fetchIngredients,
  initialState
} from '../ingredientsSlice';

const mockIngredient1: TIngredient = {
  _id: 'bulka-top',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bulka-bottom.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bulka-bottom-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/bulka-bottom-large.png'
};

const mockIngredient2: TIngredient = {
  _id: 'sauce-01',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png'
};

const mockIngredient3: TIngredient = {
  _id: 'sauce-02',
  name: 'Соус традиционный галактический',
  type: 'main',
  proteins: 42,
  fat: 24,
  carbohydrates: 42,
  calories: 99,
  price: 15,
  image: 'https://code.s3.yandex.net/react/code/meat-03.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-03-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-03-large.png'
};

const mockIngredients: TIngredient[] = [
  mockIngredient1,
  mockIngredient2,
  mockIngredient3
];

describe('обработка ingredientsSlice', () => {
  describe('проверка начального состояния', () => {
    test('должен возвращать начальное состояние при вызове с undefined', () => {
      const state = ingredientsReducer(undefined, { type: 'unknown' });

      expect(state).toEqual(initialState);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.data).toEqual([]);
    });

    test('начальное состояние должно иметь флаг загрузки', () => {
      expect(initialState.isLoading).toBe(true);
    });

    test('начальное состояние должно иметь пустой массив данных', () => {
      expect(initialState.data).toEqual([]);
      expect(Array.isArray(initialState.data)).toBe(true);
    });

    test('начальное состояние не должно иметь ошибок', () => {
      expect(initialState.error).toBeNull();
    });
  });

  describe('обработка fetchIngredients', () => {
    describe('начало запроса (pending)', () => {
      test('должен включать индикатор загрузки при запросе ингредиентов', () => {
        const action = { type: fetchIngredients.pending.type };
        const state = ingredientsReducer(initialState, action);

        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      test('должен очищать предыдущую ошибку перед новым запросом', () => {
        const stateWithError = {
          ...initialState,
          error: { message: 'Предыдущая ошибка' },
          isLoading: false
        };
        const action = { type: fetchIngredients.pending.type };
        const state = ingredientsReducer(stateWithError, action);

        expect(state.error).toBeNull();
        expect(state.isLoading).toBe(true);
      });

      test('должен сохранять предыдущие данные во время загрузки', () => {
        const stateWithData = {
          ...initialState,
          data: mockIngredients,
          isLoading: false
        };
        const action = { type: fetchIngredients.pending.type };
        const state = ingredientsReducer(stateWithData, action);

        expect(state.data).toEqual(mockIngredients);
        expect(state.isLoading).toBe(true);
      });
    });

    describe('успешное получение ингредиентов (fulfilled)', () => {
      test('должен завершать загрузку и сохранять список ингредиентов', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const action = {
          type: fetchIngredients.fulfilled.type,
          payload: mockIngredients
        };
        const state = ingredientsReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.data).toEqual(mockIngredients);
        expect(state.error).toBeNull();
      });

      test('должен сохранять все свойства ингредиентов', () => {
        const action = {
          type: fetchIngredients.fulfilled.type,
          payload: mockIngredients
        };
        const state = ingredientsReducer(initialState, action);

        expect(state.data[0]).toEqual(mockIngredient1);
        expect(state.data[0]._id).toBe(mockIngredient1._id);
        expect(state.data[0].name).toBe(mockIngredient1.name);
        expect(state.data[0].type).toBe(mockIngredient1.type);
        expect(state.data[0].price).toBe(mockIngredient1.price);
      });

      test('должен заменять предыдущие данные новыми', () => {
        const oldIngredients = [mockIngredient1];
        const stateWithOldData = {
          ...initialState,
          isLoading: true,
          data: oldIngredients
        };
        const newIngredients = [mockIngredient2, mockIngredient3];
        const action = {
          type: fetchIngredients.fulfilled.type,
          payload: newIngredients
        };
        const state = ingredientsReducer(stateWithOldData, action);

        expect(state.data).toEqual(newIngredients);
        expect(state.data).not.toEqual(oldIngredients);
        expect(state.data).toHaveLength(2);
      });

      test('должен корректно обрабатывать пустой список ингредиентов', () => {
        const action = {
          type: fetchIngredients.fulfilled.type,
          payload: []
        };
        const state = ingredientsReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.data).toEqual([]);
        expect(state.error).toBeNull();
      });

      test('должен очищать ошибку при успешной загрузке', () => {
        const stateWithError = {
          ...initialState,
          isLoading: true,
          error: { message: 'Предыдущая ошибка' }
        };
        const action = {
          type: fetchIngredients.fulfilled.type,
          payload: mockIngredients
        };
        const state = ingredientsReducer(stateWithError, action);

        expect(state.error).toBeNull();
      });

      test('должен сохранять порядок ингредиентов из ответа', () => {
        const action = {
          type: fetchIngredients.fulfilled.type,
          payload: mockIngredients
        };
        const state = ingredientsReducer(initialState, action);

        expect(state.data[0]._id).toBe(mockIngredient1._id);
        expect(state.data[1]._id).toBe(mockIngredient2._id);
        expect(state.data[2]._id).toBe(mockIngredient3._id);
      });
    });

    describe('ошибка при получении ингредиентов (rejected)', () => {
      test('должен завершать загрузку и сохранять сообщение об ошибке', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const errorMessage = 'Ошибка загрузки ингредиентов';
        const action = {
          type: fetchIngredients.rejected.type,
          error: { message: errorMessage }
        };
        const state = ingredientsReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.error).toEqual({ message: errorMessage });
      });

      test('должен сохранять предыдущие данные при ошибке', () => {
        const stateWithData = {
          ...initialState,
          isLoading: true,
          data: mockIngredients
        };
        const action = {
          type: fetchIngredients.rejected.type,
          error: { message: 'Ошибка сети' }
        };
        const state = ingredientsReducer(stateWithData, action);

        expect(state.data).toEqual(mockIngredients);
        expect(state.isLoading).toBe(false);
      });

      test('должен обрабатывать ошибку с пустым сообщением', () => {
        const action = {
          type: fetchIngredients.rejected.type,
          error: {}
        };
        const state = ingredientsReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.error).toEqual({});
      });

      test('должен обрабатывать сетевые ошибки', () => {
        const networkError = {
          message: 'Network Error',
          name: 'NetworkError',
          code: 'ERR_NETWORK'
        };
        const action = {
          type: fetchIngredients.rejected.type,
          error: networkError
        };
        const state = ingredientsReducer(initialState, action);

        expect(state.error).toEqual(networkError);
        expect(state.isLoading).toBe(false);
      });

      test('должен обрабатывать ошибки 404', () => {
        const notFoundError = {
          message: 'Not Found',
          code: '404'
        };
        const action = {
          type: fetchIngredients.rejected.type,
          error: notFoundError
        };
        const state = ingredientsReducer(initialState, action);

        expect(state.error).toEqual(notFoundError);
      });
    });
  });

  describe('интеграционные тесты', () => {
    test('полный цикл загрузки ингредиентов: pending -> fulfilled', () => {
      let state = ingredientsReducer(initialState, {
        type: fetchIngredients.pending.type
      });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();

      state = ingredientsReducer(state, {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients
      });
      expect(state.isLoading).toBe(false);
      expect(state.data).toEqual(mockIngredients);
      expect(state.error).toBeNull();
    });

    test('полный цикл загрузки ингредиентов: pending -> rejected', () => {
      let state = ingredientsReducer(initialState, {
        type: fetchIngredients.pending.type
      });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();

      const error = { message: 'Ошибка сервера' };
      state = ingredientsReducer(state, {
        type: fetchIngredients.rejected.type,
        error
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toEqual(error);
      expect(state.data).toEqual([]);
    });

    test('последовательные обновления списка ингредиентов', () => {
      // Первая загрузка
      let state = ingredientsReducer(initialState, {
        type: fetchIngredients.fulfilled.type,
        payload: [mockIngredient1]
      });
      expect(state.data).toHaveLength(1);

      // Обновление списка
      state = ingredientsReducer(state, {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients
      });
      expect(state.data).toHaveLength(3);
    });

    test('восстановление после ошибки', () => {
      // Ошибка
      let state = ingredientsReducer(initialState, {
        type: fetchIngredients.rejected.type,
        error: { message: 'Ошибка' }
      });
      expect(state.error).toBeTruthy();
      expect(state.data).toEqual([]);

      // Повторный запрос
      state = ingredientsReducer(state, {
        type: fetchIngredients.pending.type
      });
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(true);

      // Успешная загрузка
      state = ingredientsReducer(state, {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients
      });
      expect(state.error).toBeNull();
      expect(state.data).toEqual(mockIngredients);
      expect(state.isLoading).toBe(false);
    });

    test('обработка большого количества ингредиентов', () => {
      const largeIngredientsList: TIngredient[] = Array(50)
        .fill(null)
        .map((_, index) => ({
          ...mockIngredient1,
          _id: `ingredient-${index}`,
          name: `Ингредиент ${index}`
        }));

      const state = ingredientsReducer(initialState, {
        type: fetchIngredients.fulfilled.type,
        payload: largeIngredientsList
      });

      expect(state.data).toHaveLength(50);
      expect(state.isLoading).toBe(false);
    });

    test('сценарий: загрузка -> ошибка -> повторная успешная загрузка', () => {
      // Первая успешная загрузка
      let state = ingredientsReducer(initialState, {
        type: fetchIngredients.fulfilled.type,
        payload: [mockIngredient1]
      });
      expect(state.data).toHaveLength(1);

      // Повторный запрос с ошибкой
      state = ingredientsReducer(state, {
        type: fetchIngredients.pending.type
      });
      state = ingredientsReducer(state, {
        type: fetchIngredients.rejected.type,
        error: { message: 'Временная ошибка' }
      });
      expect(state.error).toBeTruthy();
      expect(state.data).toHaveLength(1); // Старые данные сохранены

      // Повторная успешная загрузка
      state = ingredientsReducer(state, {
        type: fetchIngredients.pending.type
      });
      state = ingredientsReducer(state, {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients
      });
      expect(state.error).toBeNull();
      expect(state.data).toEqual(mockIngredients);
      expect(state.data).toHaveLength(3);
    });

    test('проверка фильтрации ингредиентов по типу', () => {
      const state = ingredientsReducer(initialState, {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients
      });

      const buns = state.data.filter((item) => item.type === 'bun');
      const sauces = state.data.filter((item) => item.type === 'sauce');
      const mains = state.data.filter((item) => item.type === 'main');

      expect(buns).toHaveLength(1);
      expect(sauces).toHaveLength(1);
      expect(mains).toHaveLength(1);
    });
  });
});

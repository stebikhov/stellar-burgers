// Мокируем API перед импортом slices
jest.mock('../../../utils/burger-api');

import { TOrder, TOrdersData } from '@utils-types';
import feedReducer, { fetchFeeds, initialState } from '../feedSlice';

const mockOrder: TOrder = {
  _id: '69bad816a64177001b330077',
  ingredients: ['bulka-top', 'sauce-02', 'bulka-top'],
  status: 'done',
  name: 'Space краторный бургер',
  createdAt: '2026-03-18T16:51:34.583Z',
  updatedAt: '2026-03-18T16:51:34.797Z',
  number: 103026
};

const mockOrder2: TOrder = {
  _id: '69bad681a64177001b330076',
  ingredients: ['bulka-bottom', 'sauce-02', 'bulka-bottom'],
  status: 'done',
  name: 'Space флюоресцентный бургер',
  createdAt: '2026-03-18T16:44:49.819Z',
  updatedAt: '2026-03-18T16:44:50.071Z',
  number: 103025
};

const mockFeedsData: TOrdersData = {
  orders: [mockOrder, mockOrder2],
  total: 102500,
  totalToday: 250
};

const mockEmptyFeedsData: TOrdersData = {
  orders: [],
  total: 0,
  totalToday: 0
};

describe('обработка feedSlice', () => {
  describe('проверка начального состояния', () => {
    test('должен возвращать начальное состояние при вызове с undefined', () => {
      const state = feedReducer(undefined, { type: 'unknown' });

      expect(state).toEqual(initialState);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.data).toEqual({
        orders: [],
        total: 0,
        totalToday: 0
      });
    });

    test('начальное состояние должно иметь флаг загрузки', () => {
      expect(initialState.isLoading).toBe(true);
    });

    test('начальное состояние должно иметь пустые данные', () => {
      expect(initialState.data.orders).toEqual([]);
      expect(initialState.data.total).toBe(0);
      expect(initialState.data.totalToday).toBe(0);
    });
  });

  describe('обработка fetchFeeds', () => {
    describe('начало запроса (pending)', () => {
      test('должен включать индикатор загрузки при запросе ленты заказов', () => {
        const action = { type: fetchFeeds.pending.type };
        const state = feedReducer(initialState, action);

        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      test('должен очищать предыдущую ошибку перед новым запросом', () => {
        const stateWithError = {
          ...initialState,
          error: { message: 'Предыдущая ошибка' },
          isLoading: false
        };
        const action = { type: fetchFeeds.pending.type };
        const state = feedReducer(stateWithError, action);

        expect(state.error).toBeNull();
        expect(state.isLoading).toBe(true);
      });

      test('должен сохранять предыдущие данные во время загрузки', () => {
        const stateWithData = {
          ...initialState,
          data: mockFeedsData,
          isLoading: false
        };
        const action = { type: fetchFeeds.pending.type };
        const state = feedReducer(stateWithData, action);

        expect(state.data).toEqual(mockFeedsData);
        expect(state.isLoading).toBe(true);
      });
    });

    describe('успешное получение ленты заказов (fulfilled)', () => {
      test('должен завершать загрузку и сохранять данные ленты', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const action = {
          type: fetchFeeds.fulfilled.type,
          payload: mockFeedsData
        };
        const state = feedReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.data).toEqual(mockFeedsData);
        expect(state.error).toBeNull();
      });

      test('должен сохранять список заказов', () => {
        const action = {
          type: fetchFeeds.fulfilled.type,
          payload: mockFeedsData
        };
        const state = feedReducer(initialState, action);

        expect(state.data.orders).toHaveLength(2);
        expect(state.data.orders[0]).toEqual(mockOrder);
        expect(state.data.orders[1]).toEqual(mockOrder2);
      });

      test('должен сохранять общее количество заказов', () => {
        const action = {
          type: fetchFeeds.fulfilled.type,
          payload: mockFeedsData
        };
        const state = feedReducer(initialState, action);

        expect(state.data.total).toBe(102500);
      });

      test('должен сохранять количество заказов за сегодня', () => {
        const action = {
          type: fetchFeeds.fulfilled.type,
          payload: mockFeedsData
        };
        const state = feedReducer(initialState, action);

        expect(state.data.totalToday).toBe(250);
      });

      test('должен заменять предыдущие данные ленты новыми', () => {
        const oldData: TOrdersData = {
          orders: [mockOrder],
          total: 100000,
          totalToday: 100
        };
        const stateWithOldData = {
          ...initialState,
          isLoading: true,
          data: oldData
        };
        const action = {
          type: fetchFeeds.fulfilled.type,
          payload: mockFeedsData
        };
        const state = feedReducer(stateWithOldData, action);

        expect(state.data).toEqual(mockFeedsData);
        expect(state.data).not.toEqual(oldData);
      });

      test('должен корректно обрабатывать пустую ленту', () => {
        const action = {
          type: fetchFeeds.fulfilled.type,
          payload: mockEmptyFeedsData
        };
        const state = feedReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.data.orders).toEqual([]);
        expect(state.data.total).toBe(0);
        expect(state.data.totalToday).toBe(0);
      });
    });

    describe('ошибка при получении ленты заказов (rejected)', () => {
      test('должен завершать загрузку и сохранять сообщение об ошибке', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const errorMessage = 'Ошибка загрузки ленты заказов';
        const action = {
          type: fetchFeeds.rejected.type,
          error: { message: errorMessage }
        };
        const state = feedReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.error).toEqual({ message: errorMessage });
      });

      test('должен сохранять предыдущие данные при ошибке', () => {
        const stateWithData = {
          ...initialState,
          isLoading: true,
          data: mockFeedsData
        };
        const action = {
          type: fetchFeeds.rejected.type,
          error: { message: 'Ошибка сети' }
        };
        const state = feedReducer(stateWithData, action);

        expect(state.data).toEqual(mockFeedsData);
        expect(state.isLoading).toBe(false);
      });

      test('должен обрабатывать ошибку с пустым сообщением', () => {
        const action = {
          type: fetchFeeds.rejected.type,
          error: {}
        };
        const state = feedReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.error).toEqual({});
      });

      test('должен обрабатывать сетевые ошибки', () => {
        const networkError = {
          message: 'Network Error',
          name: 'NetworkError'
        };
        const action = {
          type: fetchFeeds.rejected.type,
          error: networkError
        };
        const state = feedReducer(initialState, action);

        expect(state.error).toEqual(networkError);
        expect(state.isLoading).toBe(false);
      });
    });
  });

  describe('интеграционные тесты', () => {
    test('полный цикл загрузки ленты: pending -> fulfilled', () => {
      let state = feedReducer(initialState, {
        type: fetchFeeds.pending.type
      });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();

      state = feedReducer(state, {
        type: fetchFeeds.fulfilled.type,
        payload: mockFeedsData
      });
      expect(state.isLoading).toBe(false);
      expect(state.data).toEqual(mockFeedsData);
      expect(state.error).toBeNull();
    });

    test('полный цикл загрузки ленты: pending -> rejected', () => {
      let state = feedReducer(initialState, {
        type: fetchFeeds.pending.type
      });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();

      const error = { message: 'Ошибка сервера' };
      state = feedReducer(state, {
        type: fetchFeeds.rejected.type,
        error
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toEqual(error);
    });

    test('последовательные обновления ленты', () => {
      // Первая загрузка
      let state = feedReducer(initialState, {
        type: fetchFeeds.fulfilled.type,
        payload: mockFeedsData
      });
      expect(state.data.orders).toHaveLength(2);
      expect(state.data.total).toBe(102500);

      // Обновление ленты
      const updatedData: TOrdersData = {
        orders: [mockOrder, mockOrder2, mockOrder],
        total: 103000,
        totalToday: 300
      };
      state = feedReducer(state, {
        type: fetchFeeds.fulfilled.type,
        payload: updatedData
      });
      expect(state.data.orders).toHaveLength(3);
      expect(state.data.total).toBe(103000);
      expect(state.data.totalToday).toBe(300);
    });

    test('восстановление после ошибки', () => {
      // Ошибка
      let state = feedReducer(initialState, {
        type: fetchFeeds.rejected.type,
        error: { message: 'Ошибка' }
      });
      expect(state.error).toBeTruthy();

      // Повторный запрос
      state = feedReducer(state, {
        type: fetchFeeds.pending.type
      });
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(true);

      // Успешная загрузка
      state = feedReducer(state, {
        type: fetchFeeds.fulfilled.type,
        payload: mockFeedsData
      });
      expect(state.error).toBeNull();
      expect(state.data).toEqual(mockFeedsData);
      expect(state.isLoading).toBe(false);
    });

    test('обработка больших данных', () => {
      const largeData: TOrdersData = {
        orders: Array(100).fill(mockOrder),
        total: 999999,
        totalToday: 5000
      };
      const state = feedReducer(initialState, {
        type: fetchFeeds.fulfilled.type,
        payload: largeData
      });

      expect(state.data.orders).toHaveLength(100);
      expect(state.data.total).toBe(999999);
      expect(state.data.totalToday).toBe(5000);
    });
  });
});

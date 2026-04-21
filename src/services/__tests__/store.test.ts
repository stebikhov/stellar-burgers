// Мокируем API перед импортом slices
jest.mock('../../utils/burger-api');

import { rootReducer } from '../store';
import { initialState as ingredientsInitialState } from '../slices/ingredientsSlice';
import { initialState as constructorInitialState } from '../slices/constructorSlice';
import { initialState as feedInitialState } from '../slices/feedSlice';
import { initialState as orderInitialState } from '../slices/orderSlice';
import { initialState as authInitialState } from '../slices/authSlice';

describe('обработка rootReducer', () => {
  describe('проверка начального состояния всего стора', () => {
    test('должен возвращать корректное начальное состояние при вызове с undefined state и неизвестным action', () => {
      const state = rootReducer(undefined, { type: 'unknown' });

      // Проверяем, что все ключи стора присутствуют
      expect(state).toHaveProperty('ingredients');
      expect(state).toHaveProperty('burgerConstructor');
      expect(state).toHaveProperty('feed');
      expect(state).toHaveProperty('order');
      expect(state).toHaveProperty('auth');
    });

    test('должен инициализировать ingredients с корректным начальным состоянием', () => {
      const state = rootReducer(undefined, { type: 'unknown' });

      expect(state.ingredients).toEqual(ingredientsInitialState);
      expect(state.ingredients.isLoading).toBe(true);
      expect(state.ingredients.error).toBeNull();
      expect(state.ingredients.data).toEqual([]);
    });

    test('должен инициализировать burgerConstructor с корректным начальным состоянием', () => {
      const state = rootReducer(undefined, { type: 'unknown' });

      expect(state.burgerConstructor).toEqual(constructorInitialState);
      expect(state.burgerConstructor.bun).toBeNull();
      expect(state.burgerConstructor.ingredients).toEqual([]);
    });

    test('должен инициализировать feed с корректным начальным состоянием', () => {
      const state = rootReducer(undefined, { type: 'unknown' });

      expect(state.feed).toEqual(feedInitialState);
      expect(state.feed.isLoading).toBe(true);
      expect(state.feed.error).toBeNull();
      expect(state.feed.data).toEqual({
        orders: [],
        total: 0,
        totalToday: 0
      });
    });

    test('должен инициализировать order с корректным начальным состоянием', () => {
      const state = rootReducer(undefined, { type: 'unknown' });

      expect(state.order).toEqual(orderInitialState);
      expect(state.order.isLoading).toBe(false);
      expect(state.order.orderRequest).toBe(false);
      expect(state.order.orderModalData).toBeNull();
      expect(state.order.isNewOrder).toBe(false);
      expect(state.order.error).toBeNull();
      expect(state.order.data).toEqual([]);
    });

    test('должен инициализировать auth с корректным начальным состоянием', () => {
      const state = rootReducer(undefined, { type: 'unknown' });

      expect(state.auth).toEqual(authInitialState);
      expect(state.auth.isAuthChecked).toBe(false);
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.isLoading).toBe(false);
      expect(state.auth.data).toEqual({ name: '', email: '' });
      expect(state.auth.loginError).toBeUndefined();
      expect(state.auth.registerError).toBeUndefined();
      expect(state.auth.userError).toBeUndefined();
    });

    test('должен возвращать полную структуру RootState', () => {
      const state = rootReducer(undefined, { type: 'unknown' });

      // Проверяем, что структура соответствует ожидаемой
      expect(Object.keys(state)).toEqual([
        'ingredients',
        'burgerConstructor',
        'feed',
        'order',
        'auth'
      ]);
    });

    test('должен корректно обрабатывать неизвестные actions без изменения состояния', () => {
      const state = rootReducer(undefined, { type: 'unknown' });
      const newState = rootReducer(state, { type: 'another-unknown-action' });

      // Состояние не должно измениться при неизвестном action
      expect(newState).toEqual(state);
    });

    test('должен сохранять иммутабельность при обработке неизвестных actions', () => {
      const state = rootReducer(undefined, { type: 'unknown' });
      const newState = rootReducer(state, { type: 'unknown-action-2' });

      // Проверяем, что ссылки на объекты не изменились
      expect(newState.ingredients).toBe(state.ingredients);
      expect(newState.burgerConstructor).toBe(state.burgerConstructor);
      expect(newState.feed).toBe(state.feed);
      expect(newState.order).toBe(state.order);
      expect(newState.auth).toBe(state.auth);
    });
  });

  describe('интеграционные тесты rootReducer', () => {
    test('должен корректно обрабатывать последовательность различных actions', () => {
      let state = rootReducer(undefined, { type: 'unknown' });

      // Проверяем начальное состояние
      expect(state.ingredients.data).toEqual([]);
      expect(state.burgerConstructor.bun).toBeNull();

      // Имитируем action для ingredients
      state = rootReducer(state, {
        type: 'ingredients/fetch/pending'
      });
      expect(state.ingredients.isLoading).toBe(true);

      // Имитируем action для constructor
      state = rootReducer(state, {
        type: 'burgerConstructor/resetConstructor'
      });
      expect(state.burgerConstructor.bun).toBeNull();
      expect(state.burgerConstructor.ingredients).toEqual([]);
    });

    test('должен изолировать изменения в разных slice-редьюсерах', () => {
      let state = rootReducer(undefined, { type: 'unknown' });

      // Изменяем только feed
      state = rootReducer(state, {
        type: 'feed/fetch/pending'
      });

      // Проверяем, что изменился только feed
      expect(state.feed.isLoading).toBe(true);
      expect(state.ingredients).toEqual(ingredientsInitialState);
      expect(state.burgerConstructor).toEqual(constructorInitialState);
      expect(state.order).toEqual(orderInitialState);
      expect(state.auth).toEqual(authInitialState);
    });

    test('должен корректно работать с частичным состоянием', () => {
      const partialState = rootReducer(undefined, { type: 'unknown' });

      // Проверяем, что можем работать с частичным состоянием
      const newState = rootReducer(partialState, { type: 'unknown' });

      expect(newState).toEqual(partialState);
    });
  });

  describe('проверка типобезопасности RootState', () => {
    test('должен возвращать состояние с корректными типами данных', () => {
      const state = rootReducer(undefined, { type: 'unknown' });

      // Проверяем типы данных
      expect(typeof state.ingredients.isLoading).toBe('boolean');
      expect(Array.isArray(state.ingredients.data)).toBe(true);
      expect(Array.isArray(state.burgerConstructor.ingredients)).toBe(true);
      expect(typeof state.feed.isLoading).toBe('boolean');
      expect(Array.isArray(state.feed.data.orders)).toBe(true);
      expect(typeof state.feed.data.total).toBe('number');
      expect(typeof state.feed.data.totalToday).toBe('number');
      expect(typeof state.order.isLoading).toBe('boolean');
      expect(typeof state.order.orderRequest).toBe('boolean');
      expect(typeof state.order.isNewOrder).toBe('boolean');
      expect(Array.isArray(state.order.data)).toBe(true);
      expect(typeof state.auth.isAuthChecked).toBe('boolean');
      expect(typeof state.auth.isAuthenticated).toBe('boolean');
      expect(typeof state.auth.isLoading).toBe('boolean');
      expect(typeof state.auth.data.name).toBe('string');
      expect(typeof state.auth.data.email).toBe('string');
    });

    test('должен иметь корректные значения по умолчанию для всех полей', () => {
      const state = rootReducer(undefined, { type: 'unknown' });

      // Проверяем значения по умолчанию
      expect(state.ingredients.data.length).toBe(0);
      expect(state.burgerConstructor.ingredients.length).toBe(0);
      expect(state.feed.data.orders.length).toBe(0);
      expect(state.feed.data.total).toBe(0);
      expect(state.feed.data.totalToday).toBe(0);
      expect(state.order.data.length).toBe(0);
      expect(state.auth.data.name).toBe('');
      expect(state.auth.data.email).toBe('');
    });
  });
});

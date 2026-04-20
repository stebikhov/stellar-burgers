// Мокируем API перед импортом slices
jest.mock('../../../utils/burger-api');

import { TUser } from '@utils-types';
import authReducer, {
  fetchUser,
  updateUser,
  register,
  login,
  logout,
  setAuthChecked,
  initialState
} from '../authSlice';

const mockUser: TUser = {
  email: 'test@example.com',
  name: 'Test User'
};

const mockUser2: TUser = {
  email: 'user2@example.com',
  name: 'User Two'
};

describe('обработка authSlice', () => {
  describe('проверка начального состояния', () => {
    test('должен возвращать начальное состояние при вызове с undefined', () => {
      const state = authReducer(undefined, { type: 'unknown' });

      expect(state).toEqual(initialState);
      expect(state.isAuthChecked).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.data).toEqual({ name: '', email: '' });
      expect(state.loginError).toBeUndefined();
      expect(state.registerError).toBeUndefined();
      expect(state.userError).toBeUndefined();
    });
  });

  describe('обработка setAuthChecked', () => {
    test('должен устанавливать флаг isAuthChecked в true', () => {
      const state = authReducer(initialState, setAuthChecked());

      expect(state.isAuthChecked).toBe(true);
    });

    test('должен сохранять остальные данные при установке флага', () => {
      const stateWithData = {
        ...initialState,
        isAuthenticated: true,
        data: mockUser
      };
      const state = authReducer(stateWithData, setAuthChecked());

      expect(state.isAuthChecked).toBe(true);
      expect(state.isAuthenticated).toBe(true);
      expect(state.data).toEqual(mockUser);
    });
  });

  describe('обработка fetchUser', () => {
    describe('начало запроса (pending)', () => {
      test('должен включать индикатор загрузки при запросе данных пользователя', () => {
        const action = { type: fetchUser.pending.type };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(true);
      });

      test('должен сохранять предыдущие данные во время загрузки', () => {
        const stateWithData = {
          ...initialState,
          data: mockUser,
          isAuthenticated: true
        };
        const action = { type: fetchUser.pending.type };
        const state = authReducer(stateWithData, action);

        expect(state.data).toEqual(mockUser);
        expect(state.isAuthenticated).toBe(true);
        expect(state.isLoading).toBe(true);
      });
    });

    describe('успешное получение пользователя (fulfilled)', () => {
      test('должен завершать загрузку и сохранять данные пользователя', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const action = {
          type: fetchUser.fulfilled.type,
          payload: mockUser
        };
        const state = authReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.isAuthChecked).toBe(true);
        expect(state.data).toEqual(mockUser);
      });

      test('должен устанавливать флаги аутентификации', () => {
        const action = {
          type: fetchUser.fulfilled.type,
          payload: mockUser
        };
        const state = authReducer(initialState, action);

        expect(state.isAuthenticated).toBe(true);
        expect(state.isAuthChecked).toBe(true);
      });
    });

    describe('ошибка при получении пользователя (rejected)', () => {
      test('должен завершать загрузку и сохранять сообщение об ошибке', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const errorMessage = 'Ошибка получения пользователя';
        const action = {
          type: fetchUser.rejected.type,
          error: { message: errorMessage },
          meta: { rejectedWithValue: false }
        };
        const state = authReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.isAuthChecked).toBe(true);
        expect(state.userError).toEqual({ message: errorMessage });
      });

      test('должен устанавливать isAuthChecked при ошибке', () => {
        const action = {
          type: fetchUser.rejected.type,
          error: { message: 'Ошибка' },
          meta: { rejectedWithValue: false }
        };
        const state = authReducer(initialState, action);

        expect(state.isAuthChecked).toBe(true);
      });

      test('должен обрабатывать ошибку с rejectedWithValue', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const errorPayload = { message: 'Ошибка авторизации' };
        const action = {
          type: fetchUser.rejected.type,
          payload: errorPayload,
          error: { message: 'fallback' },
          meta: { rejectedWithValue: true }
        };
        const state = authReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.userError).toEqual(errorPayload);
      });
    });
  });

  describe('обработка updateUser', () => {
    describe('начало запроса (pending)', () => {
      test('должен включать индикатор загрузки при обновлении данных', () => {
        const action = { type: updateUser.pending.type };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(true);
      });
    });

    describe('успешное обновление пользователя (fulfilled)', () => {
      test('должен завершать загрузку и обновлять данные пользователя', () => {
        const stateWithUser = {
          ...initialState,
          isLoading: true,
          data: mockUser
        };
        const updatedUser = { ...mockUser, name: 'Updated Name' };
        const action = {
          type: updateUser.fulfilled.type,
          payload: updatedUser
        };
        const state = authReducer(stateWithUser, action);

        expect(state.isLoading).toBe(false);
        expect(state.data).toEqual(updatedUser);
      });
    });

    describe('ошибка при обновлении пользователя (rejected)', () => {
      test('должен завершать загрузку и сохранять сообщение об ошибке', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true,
          data: mockUser
        };
        const errorMessage = 'Ошибка обновления';
        const action = {
          type: updateUser.rejected.type,
          error: { message: errorMessage },
          meta: { rejectedWithValue: false }
        };
        const state = authReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.userError).toEqual({ message: errorMessage });
        expect(state.data).toEqual(mockUser);
      });

      test('должен обрабатывать ошибку с rejectedWithValue', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true,
          data: mockUser
        };
        const errorPayload = { message: 'Ошибка обновления профиля' };
        const action = {
          type: updateUser.rejected.type,
          payload: errorPayload,
          error: { message: 'fallback' },
          meta: { rejectedWithValue: true }
        };
        const state = authReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.userError).toEqual(errorPayload);
      });
    });
  });

  describe('обработка register', () => {
    describe('начало запроса (pending)', () => {
      test('должен включать индикатор загрузки при регистрации', () => {
        const action = { type: register.pending.type };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(true);
        expect(state.registerError).toBeUndefined();
      });

      test('должен очищать предыдущую ошибку регистрации', () => {
        const stateWithError = {
          ...initialState,
          registerError: { message: 'Предыдущая ошибка' }
        };
        const action = { type: register.pending.type };
        const state = authReducer(stateWithError, action);

        expect(state.registerError).toBeUndefined();
      });
    });

    describe('успешная регистрация (fulfilled)', () => {
      test('должен завершать загрузку и сохранять данные пользователя', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const action = {
          type: register.fulfilled.type,
          payload: mockUser
        };
        const state = authReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.data).toEqual(mockUser);
        expect(state.registerError).toBeUndefined();
      });

      test('должен устанавливать флаг аутентификации при успешной регистрации', () => {
        const action = {
          type: register.fulfilled.type,
          payload: mockUser
        };
        const state = authReducer(initialState, action);

        expect(state.isAuthenticated).toBe(true);
      });
    });

    describe('ошибка при регистрации (rejected)', () => {
      test('должен завершать загрузку и сохранять ошибку регистрации', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const errorMessage = 'Пользователь уже существует';
        const action = {
          type: register.rejected.type,
          error: { message: errorMessage },
          meta: { rejectedWithValue: false }
        };
        const state = authReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.registerError).toEqual({ message: errorMessage });
      });

      test('должен обрабатывать ошибку с rejectedWithValue', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const errorPayload = { message: 'Email уже зарегистрирован' };
        const action = {
          type: register.rejected.type,
          payload: errorPayload,
          error: { message: 'fallback' },
          meta: { rejectedWithValue: true }
        };
        const state = authReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.registerError).toEqual(errorPayload);
      });
    });
  });

  describe('обработка login', () => {
    describe('начало запроса (pending)', () => {
      test('должен включать индикатор загрузки при входе', () => {
        const action = { type: login.pending.type };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(true);
        expect(state.loginError).toBeUndefined();
      });

      test('должен очищать предыдущую ошибку входа', () => {
        const stateWithError = {
          ...initialState,
          loginError: { message: 'Предыдущая ошибка' }
        };
        const action = { type: login.pending.type };
        const state = authReducer(stateWithError, action);

        expect(state.loginError).toBeUndefined();
      });
    });

    describe('успешный вход (fulfilled)', () => {
      test('должен завершать загрузку и сохранять данные пользователя', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const action = {
          type: login.fulfilled.type,
          payload: mockUser
        };
        const state = authReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.data).toEqual(mockUser);
        expect(state.loginError).toBeUndefined();
      });

      test('должен устанавливать флаг аутентификации при успешном входе', () => {
        const action = {
          type: login.fulfilled.type,
          payload: mockUser
        };
        const state = authReducer(initialState, action);

        expect(state.isAuthenticated).toBe(true);
      });
    });

    describe('ошибка при входе (rejected)', () => {
      test('должен завершать загрузку и сохранять ошибку входа', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const errorMessage = 'Неверный email или пароль';
        const action = {
          type: login.rejected.type,
          error: { message: errorMessage },
          meta: { rejectedWithValue: false }
        };
        const state = authReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.loginError).toEqual({ message: errorMessage });
      });

      test('должен обрабатывать ошибку с rejectedWithValue', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const errorPayload = { message: 'Неверные учетные данные' };
        const action = {
          type: login.rejected.type,
          payload: errorPayload,
          error: { message: 'fallback' },
          meta: { rejectedWithValue: true }
        };
        const state = authReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.loginError).toEqual(errorPayload);
      });
    });
  });

  describe('обработка logout', () => {
    describe('успешный выход (fulfilled)', () => {
      test('должен сбрасывать данные аутентификации', () => {
        const stateWithAuth = {
          ...initialState,
          isAuthenticated: true,
          data: mockUser,
          isLoading: true
        };
        const action = { type: logout.fulfilled.type };
        const state = authReducer(stateWithAuth, action);

        expect(state.isAuthenticated).toBe(false);
        expect(state.data).toEqual({ email: '', name: '' });
        expect(state.isLoading).toBe(false);
      });

      test('должен очищать данные пользователя при выходе', () => {
        const stateWithUser = {
          ...initialState,
          isAuthenticated: true,
          data: mockUser
        };
        const action = { type: logout.fulfilled.type };
        const state = authReducer(stateWithUser, action);

        expect(state.data.name).toBe('');
        expect(state.data.email).toBe('');
      });
    });
  });

  describe('интеграционные тесты', () => {
    test('полный цикл входа: pending -> fulfilled', () => {
      let state = authReducer(initialState, {
        type: login.pending.type
      });
      expect(state.isLoading).toBe(true);
      expect(state.loginError).toBeUndefined();

      state = authReducer(state, {
        type: login.fulfilled.type,
        payload: mockUser
      });
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.data).toEqual(mockUser);
    });

    test('полный цикл входа: pending -> rejected', () => {
      let state = authReducer(initialState, {
        type: login.pending.type
      });
      expect(state.isLoading).toBe(true);

      state = authReducer(state, {
        type: login.rejected.type,
        error: { message: 'Ошибка входа' },
        meta: { rejectedWithValue: false }
      });
      expect(state.isLoading).toBe(false);
      expect(state.loginError).toEqual({ message: 'Ошибка входа' });
      expect(state.isAuthenticated).toBe(false);
    });

    test('сценарий: вход -> обновление профиля -> выход', () => {
      // Вход
      let state = authReducer(initialState, {
        type: login.fulfilled.type,
        payload: mockUser
      });
      expect(state.isAuthenticated).toBe(true);
      expect(state.data).toEqual(mockUser);

      // Обновление профиля
      const updatedUser = { ...mockUser, name: 'New Name' };
      state = authReducer(state, {
        type: updateUser.fulfilled.type,
        payload: updatedUser
      });
      expect(state.data).toEqual(updatedUser);

      // Выход
      state = authReducer(state, {
        type: logout.fulfilled.type
      });
      expect(state.isAuthenticated).toBe(false);
      expect(state.data).toEqual({ email: '', name: '' });
    });

    test('сценарий: регистрация -> выход -> повторный вход', () => {
      // Регистрация
      let state = authReducer(initialState, {
        type: register.fulfilled.type,
        payload: mockUser
      });
      expect(state.isAuthenticated).toBe(true);
      expect(state.data).toEqual(mockUser);

      // Выход
      state = authReducer(state, {
        type: logout.fulfilled.type
      });
      expect(state.isAuthenticated).toBe(false);

      // Повторный вход
      state = authReducer(state, {
        type: login.fulfilled.type,
        payload: mockUser
      });
      expect(state.isAuthenticated).toBe(true);
      expect(state.data).toEqual(mockUser);
    });
  });
});

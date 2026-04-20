// Мокируем API перед импортом slices
jest.mock('../../../utils/burger-api');

import { TOrder } from '@utils-types';
import orderReducer, {
  createOrder,
  fetchOrder,
  fetchOrders,
  resetOrderModalData,
  initialState
} from '../orderSlice';
import { resetConstructor } from '../constructorSlice';

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

describe('обработка orderSlice', () => {
  describe('проверка начального состояния', () => {
    test('должен возвращать начальное состояние при вызове с undefined', () => {
      const state = orderReducer(undefined, { type: 'unknown' });

      expect(state).toEqual(initialState);
      expect(state.isLoading).toBe(false);
      expect(state.orderRequest).toBe(false);
      expect(state.orderModalData).toBeNull();
      expect(state.isNewOrder).toBe(false);
      expect(state.error).toBeNull();
      expect(state.data).toEqual([]);
    });
  });

  describe('обработка createOrder', () => {
    describe('начало запроса (pending)', () => {
      test('должен включать индикатор загрузки при отправке заказа', () => {
        const action = { type: createOrder.pending.type };
        const state = orderReducer(initialState, action);

        expect(state.orderRequest).toBe(true);
        expect(state.error).toBeNull();
      });

      test('должен сохранять предыдущие данные заказа при начале запроса', () => {
        const stateWithOrder = {
          ...initialState,
          orderModalData: mockOrder,
          isNewOrder: true
        };
        const action = { type: createOrder.pending.type };
        const state = orderReducer(stateWithOrder, action);

        expect(state.orderModalData).toBe(mockOrder);
        expect(state.isNewOrder).toBe(true);
        expect(state.orderRequest).toBe(true);
      });
    });

    describe('успешное создание заказа (fulfilled)', () => {
      test('должен завершать загрузку и сохранять данные созданного заказа', () => {
        const stateWithPending = {
          ...initialState,
          orderRequest: true
        };
        const action = {
          type: createOrder.fulfilled.type,
          payload: { order: mockOrder, name: mockOrder.name }
        };
        const state = orderReducer(stateWithPending, action);

        expect(state.orderRequest).toBe(false);
        expect(state.orderModalData).toBe(mockOrder);
        expect(state.isNewOrder).toBe(true);
        expect(state.error).toBeNull();
      });

      test('должен устанавливать флаг isNewOrder в true для нового заказа', () => {
        const action = {
          type: createOrder.fulfilled.type,
          payload: { order: mockOrder, name: mockOrder.name }
        };
        const state = orderReducer(initialState, action);

        expect(state.isNewOrder).toBe(true);
      });
    });

    describe('ошибка при создании заказа (rejected)', () => {
      test('должен завершать загрузку и сохранять сообщение об ошибке', () => {
        const stateWithPending = {
          ...initialState,
          orderRequest: true
        };
        const errorMessage = 'Ошибка создания заказа';
        const action = {
          type: createOrder.rejected.type,
          error: { message: errorMessage }
        };
        const state = orderReducer(stateWithPending, action);

        expect(state.orderRequest).toBe(false);
        expect(state.error).toEqual({ message: errorMessage });
      });

      test('должен сохранять предыдущие данные заказа при ошибке', () => {
        const stateWithOrder = {
          ...initialState,
          orderRequest: true,
          orderModalData: mockOrder
        };
        const action = {
          type: createOrder.rejected.type,
          error: { message: 'Ошибка' }
        };
        const state = orderReducer(stateWithOrder, action);

        expect(state.orderModalData).toBe(mockOrder);
      });
    });
  });

  describe('обработка fetchOrders', () => {
    describe('начало запроса (pending)', () => {
      test('должен включать индикатор загрузки при запросе списка заказов', () => {
        const action = { type: fetchOrders.pending.type };
        const state = orderReducer(initialState, action);

        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      test('должен очищать предыдущую ошибку перед новым запросом', () => {
        const stateWithError = {
          ...initialState,
          error: { message: 'Предыдущая ошибка' }
        };
        const action = { type: fetchOrders.pending.type };
        const state = orderReducer(stateWithError, action);

        expect(state.error).toBeNull();
        expect(state.isLoading).toBe(true);
      });
    });

    describe('успешное получение заказов (fulfilled)', () => {
      test('должен завершать загрузку и сохранять список заказов', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const orders = [mockOrder, mockOrder2];
        const action = {
          type: fetchOrders.fulfilled.type,
          payload: orders
        };
        const state = orderReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.data).toEqual(orders);
        expect(state.error).toBeNull();
      });

      test('должен заменять предыдущий список заказов новыми данными', () => {
        const stateWithOldOrders = {
          ...initialState,
          isLoading: true,
          data: [mockOrder]
        };
        const newOrders = [mockOrder2];
        const action = {
          type: fetchOrders.fulfilled.type,
          payload: newOrders
        };
        const state = orderReducer(stateWithOldOrders, action);

        expect(state.data).toEqual(newOrders);
        expect(state.data).toHaveLength(1);
      });
    });

    describe('ошибка при получении заказов (rejected)', () => {
      test('должен завершать загрузку и сохранять сообщение об ошибке', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const errorMessage = 'Ошибка получения заказов';
        const action = {
          type: fetchOrders.rejected.type,
          error: { message: errorMessage }
        };
        const state = orderReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.error).toEqual({ message: errorMessage });
      });

      test('должен сохранять существующий список заказов при ошибке', () => {
        const stateWithOrders = {
          ...initialState,
          isLoading: true,
          data: [mockOrder]
        };
        const action = {
          type: fetchOrders.rejected.type,
          error: { message: 'Ошибка' }
        };
        const state = orderReducer(stateWithOrders, action);

        expect(state.data).toEqual([mockOrder]);
      });
    });
  });

  describe('обработка fetchOrder', () => {
    describe('начало запроса (pending)', () => {
      test('должен включать индикатор загрузки при запросе заказа по номеру', () => {
        const action = { type: fetchOrder.pending.type };
        const state = orderReducer(initialState, action);

        expect(state.isLoading).toBe(true);
      });

      test('должен сохранять предыдущие данные во время загрузки', () => {
        const stateWithData = {
          ...initialState,
          orderModalData: mockOrder,
          data: [mockOrder2]
        };
        const action = { type: fetchOrder.pending.type };
        const state = orderReducer(stateWithData, action);

        expect(state.orderModalData).toBe(mockOrder);
        expect(state.data).toEqual([mockOrder2]);
        expect(state.isLoading).toBe(true);
      });
    });

    describe('успешное получение заказа (fulfilled)', () => {
      test('должен завершать загрузку и сохранять заказ в orderModalData', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const action = {
          type: fetchOrder.fulfilled.type,
          payload: mockOrder
        };
        const state = orderReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.orderModalData).toBe(mockOrder);
        expect(state.isNewOrder).toBe(false);
      });

      test('должен сохранять заказ только в orderModalData, не затрагивая data', () => {
        const existingOrders = [mockOrder2];
        const stateWithOrders = {
          ...initialState,
          isLoading: true,
          data: existingOrders
        };
        const action = {
          type: fetchOrder.fulfilled.type,
          payload: mockOrder
        };
        const state = orderReducer(stateWithOrders, action);

        expect(state.orderModalData).toBe(mockOrder);
        expect(state.data).toEqual(existingOrders);
      });

      test('должен устанавливать isNewOrder в false для существующего заказа', () => {
        const stateWithNewOrder = {
          ...initialState,
          isLoading: true,
          isNewOrder: true
        };
        const action = {
          type: fetchOrder.fulfilled.type,
          payload: mockOrder
        };
        const state = orderReducer(stateWithNewOrder, action);

        expect(state.isNewOrder).toBe(false);
      });
    });

    describe('ошибка при получении заказа (rejected)', () => {
      test('должен завершать загрузку и сохранять сообщение об ошибке', () => {
        const stateWithLoading = {
          ...initialState,
          isLoading: true
        };
        const errorMessage = 'Заказ не найден';
        const action = {
          type: fetchOrder.rejected.type,
          error: { message: errorMessage }
        };
        const state = orderReducer(stateWithLoading, action);

        expect(state.isLoading).toBe(false);
        expect(state.error).toEqual({ message: errorMessage });
      });

      test('должен сохранять существующие данные заказа при ошибке', () => {
        const stateWithOrder = {
          ...initialState,
          isLoading: true,
          orderModalData: mockOrder
        };
        const action = {
          type: fetchOrder.rejected.type,
          error: { message: 'Ошибка' }
        };
        const state = orderReducer(stateWithOrder, action);

        expect(state.orderModalData).toBe(mockOrder);
      });
    });
  });

  describe('обработка resetOrderModalData', () => {
    test('должен очищать данные модального окна заказа', () => {
      const stateWithModalData = {
        ...initialState,
        orderModalData: mockOrder,
        isNewOrder: true
      };
      const state = orderReducer(stateWithModalData, resetOrderModalData());

      expect(state.orderModalData).toBeNull();
      expect(state.isNewOrder).toBe(false);
    });

    test('должен сохранять остальные данные при очистке модального окна', () => {
      const stateWithData = {
        ...initialState,
        orderModalData: mockOrder,
        isNewOrder: true,
        data: [mockOrder, mockOrder2],
        error: { message: 'Тестовая ошибка' }
      };
      const state = orderReducer(stateWithData, resetOrderModalData());

      expect(state.data).toEqual([mockOrder, mockOrder2]);
      expect(state.error).toEqual({ message: 'Тестовая ошибка' });
    });

    test('должен работать корректно при уже пустом состоянии', () => {
      const state = orderReducer(initialState, resetOrderModalData());

      expect(state.orderModalData).toBeNull();
      expect(state.isNewOrder).toBe(false);
    });
  });

  describe('интеграционные тесты', () => {
    test('полный цикл создания заказа: pending -> fulfilled', () => {
      let state = orderReducer(initialState, {
        type: createOrder.pending.type
      });
      expect(state.orderRequest).toBe(true);

      state = orderReducer(state, {
        type: createOrder.fulfilled.type,
        payload: { order: mockOrder, name: mockOrder.name }
      });
      expect(state.orderRequest).toBe(false);
      expect(state.orderModalData).toBe(mockOrder);
      expect(state.isNewOrder).toBe(true);
    });

    test('полный цикл создания заказа: pending -> rejected', () => {
      let state = orderReducer(initialState, {
        type: createOrder.pending.type
      });
      expect(state.orderRequest).toBe(true);

      state = orderReducer(state, {
        type: createOrder.rejected.type,
        error: { message: 'Ошибка сети' }
      });
      expect(state.orderRequest).toBe(false);
      expect(state.error).toEqual({ message: 'Ошибка сети' });
      expect(state.orderModalData).toBeNull();
    });

    test('последовательное создание заказов', () => {
      // Первый заказ
      let state = orderReducer(initialState, {
        type: createOrder.fulfilled.type,
        payload: { order: mockOrder, name: mockOrder.name }
      });
      expect(state.orderModalData).toBe(mockOrder);

      // Закрытие модального окна
      state = orderReducer(state, resetOrderModalData());
      expect(state.orderModalData).toBeNull();

      // Второй заказ
      state = orderReducer(state, {
        type: createOrder.fulfilled.type,
        payload: { order: mockOrder2, name: mockOrder2.name }
      });
      expect(state.orderModalData).toBe(mockOrder2);
    });
  });
});

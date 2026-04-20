// Мокируем API перед импортом slices
jest.mock('../../../utils/burger-api');

import { TIngredient, TConstructorIngredient } from '@utils-types';
import constructorReducer, {
  setBun,
  addIngredient,
  removeIngredient,
  moveIngredient,
  resetConstructor,
  initialState
} from '../constructorSlice';

const mockBun: TIngredient = {
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

const mockBun2: TIngredient = {
  _id: 'bulka-bottom',
  name: 'Флюоресцентная булка R2-D3',
  type: 'bun',
  proteins: 44,
  fat: 26,
  carbohydrates: 85,
  calories: 643,
  price: 988,
  image: 'https://code.s3.yandex.net/react/code/bulka-top.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bulka-top-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/bulka-top-large.png'
};

const mockSauce: TIngredient = {
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

const mockMain: TIngredient = {
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

describe('обработка constructorSlice', () => {
  describe('проверка начального состояния', () => {
    test('должен возвращать начальное состояние при вызове с undefined', () => {
      const state = constructorReducer(undefined, { type: 'unknown' });

      expect(state).toEqual(initialState);
      expect(state.bun).toBeNull();
      expect(state.ingredients).toEqual([]);
    });
  });

  describe('обработка setBun', () => {
    test('должен устанавливать булку', () => {
      const state = constructorReducer(initialState, setBun(mockBun));

      expect(state.bun).toEqual(mockBun);
    });

    test('должен заменять предыдущую булку на новую', () => {
      const stateWithBun = {
        ...initialState,
        bun: mockBun
      };
      const state = constructorReducer(stateWithBun, setBun(mockBun2));

      expect(state.bun).toEqual(mockBun2);
    });

    test('должен сохранять ингредиенты при установке булки', () => {
      const mockIngredient: TConstructorIngredient = {
        ...mockSauce,
        id: 'test-id-1'
      };
      const stateWithIngredients = {
        ...initialState,
        ingredients: [mockIngredient]
      };
      const state = constructorReducer(stateWithIngredients, setBun(mockBun));

      expect(state.bun).toEqual(mockBun);
      expect(state.ingredients).toEqual([mockIngredient]);
    });

    test('должен очищать булку при передаче null', () => {
      const stateWithBun = {
        ...initialState,
        bun: mockBun
      };
      const state = constructorReducer(stateWithBun, setBun(null));

      expect(state.bun).toBeNull();
    });
  });

  describe('обработка addIngredient', () => {
    test('должен добавлять ингредиент с уникальным id', () => {
      const state = constructorReducer(initialState, addIngredient(mockSauce));

      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0]).toHaveProperty('id');
      expect(state.ingredients[0]._id).toBe(mockSauce._id);
      expect(state.ingredients[0].name).toBe(mockSauce.name);
    });

    test('должен добавлять несколько ингредиентов', () => {
      let state = constructorReducer(initialState, addIngredient(mockSauce));
      state = constructorReducer(state, addIngredient(mockMain));

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients[0]._id).toBe(mockSauce._id);
      expect(state.ingredients[1]._id).toBe(mockMain._id);
    });

    test('должен генерировать разные id для одинаковых ингредиентов', () => {
      let state = constructorReducer(initialState, addIngredient(mockSauce));
      state = constructorReducer(state, addIngredient(mockSauce));

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients[0].id).not.toBe(state.ingredients[1].id);
      expect(state.ingredients[0]._id).toBe(state.ingredients[1]._id);
    });

    test('должен устанавливать булку при добавлении ингредиента типа bun', () => {
      const state = constructorReducer(initialState, addIngredient(mockBun));

      expect(state.bun).toMatchObject(mockBun);
      expect(state.bun).toHaveProperty('id');
      expect(state.ingredients).toHaveLength(0);
    });

    test('должен заменять булку при добавлении нового ингредиента типа bun', () => {
      const stateWithBun = {
        ...initialState,
        bun: mockBun
      };
      const state = constructorReducer(stateWithBun, addIngredient(mockBun2));

      expect(state.bun).toMatchObject(mockBun2);
      expect(state.bun).toHaveProperty('id');
      expect(state.ingredients).toHaveLength(0);
    });

    test('должен добавлять ингредиенты в конец списка', () => {
      let state = constructorReducer(initialState, addIngredient(mockSauce));
      state = constructorReducer(state, addIngredient(mockMain));
      const lastIngredient = state.ingredients[state.ingredients.length - 1];

      expect(lastIngredient._id).toBe(mockMain._id);
    });
  });

  describe('обработка removeIngredient', () => {
    test('должен удалять ингредиент по id', () => {
      const mockIngredient: TConstructorIngredient = {
        ...mockSauce,
        id: 'test-id-1'
      };
      const stateWithIngredient = {
        ...initialState,
        ingredients: [mockIngredient]
      };
      const state = constructorReducer(
        stateWithIngredient,
        removeIngredient('test-id-1')
      );

      expect(state.ingredients).toHaveLength(0);
    });

    test('должен удалять только указанный ингредиент из списка', () => {
      const ingredient1: TConstructorIngredient = {
        ...mockSauce,
        id: 'test-id-1'
      };
      const ingredient2: TConstructorIngredient = {
        ...mockMain,
        id: 'test-id-2'
      };
      const stateWithIngredients = {
        ...initialState,
        ingredients: [ingredient1, ingredient2]
      };
      const state = constructorReducer(
        stateWithIngredients,
        removeIngredient('test-id-1')
      );

      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0].id).toBe('test-id-2');
    });

    test('должен сохранять порядок ингредиентов при удалении', () => {
      const ingredient1: TConstructorIngredient = {
        ...mockSauce,
        id: 'test-id-1'
      };
      const ingredient2: TConstructorIngredient = {
        ...mockMain,
        id: 'test-id-2'
      };
      const ingredient3: TConstructorIngredient = {
        ...mockSauce,
        id: 'test-id-3'
      };
      const stateWithIngredients = {
        ...initialState,
        ingredients: [ingredient1, ingredient2, ingredient3]
      };
      const state = constructorReducer(
        stateWithIngredients,
        removeIngredient('test-id-2')
      );

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients[0].id).toBe('test-id-1');
      expect(state.ingredients[1].id).toBe('test-id-3');
    });

    test('должен игнорировать удаление несуществующего id', () => {
      const mockIngredient: TConstructorIngredient = {
        ...mockSauce,
        id: 'test-id-1'
      };
      const stateWithIngredient = {
        ...initialState,
        ingredients: [mockIngredient]
      };
      const state = constructorReducer(
        stateWithIngredient,
        removeIngredient('non-existent-id')
      );

      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0].id).toBe('test-id-1');
    });
  });

  describe('обработка moveIngredient', () => {
    const ingredient1: TConstructorIngredient = {
      ...mockSauce,
      id: 'test-id-1'
    };
    const ingredient2: TConstructorIngredient = {
      ...mockMain,
      id: 'test-id-2'
    };
    const ingredient3: TConstructorIngredient = {
      ...mockSauce,
      id: 'test-id-3'
    };

    test('должен перемещать ингредиент вверх', () => {
      const stateWithIngredients = {
        ...initialState,
        ingredients: [ingredient1, ingredient2, ingredient3]
      };
      const state = constructorReducer(
        stateWithIngredients,
        moveIngredient({ index: 1, upwards: true })
      );

      expect(state.ingredients[0].id).toBe('test-id-2');
      expect(state.ingredients[1].id).toBe('test-id-1');
      expect(state.ingredients[2].id).toBe('test-id-3');
    });

    test('должен перемещать ингредиент вниз', () => {
      const stateWithIngredients = {
        ...initialState,
        ingredients: [ingredient1, ingredient2, ingredient3]
      };
      const state = constructorReducer(
        stateWithIngredients,
        moveIngredient({ index: 1, upwards: false })
      );

      expect(state.ingredients[0].id).toBe('test-id-1');
      expect(state.ingredients[1].id).toBe('test-id-3');
      expect(state.ingredients[2].id).toBe('test-id-2');
    });

    test('не должен перемещать первый элемент вверх', () => {
      const stateWithIngredients = {
        ...initialState,
        ingredients: [ingredient1, ingredient2, ingredient3]
      };
      const state = constructorReducer(
        stateWithIngredients,
        moveIngredient({ index: 0, upwards: true })
      );

      expect(state.ingredients[0].id).toBe('test-id-1');
      expect(state.ingredients[1].id).toBe('test-id-2');
      expect(state.ingredients[2].id).toBe('test-id-3');
    });

    test('не должен перемещать последний элемент вниз', () => {
      const stateWithIngredients = {
        ...initialState,
        ingredients: [ingredient1, ingredient2, ingredient3]
      };
      const state = constructorReducer(
        stateWithIngredients,
        moveIngredient({ index: 2, upwards: false })
      );

      expect(state.ingredients[0].id).toBe('test-id-1');
      expect(state.ingredients[1].id).toBe('test-id-2');
      expect(state.ingredients[2].id).toBe('test-id-3');
    });

    test('должен работать с двумя элементами', () => {
      const stateWithTwoIngredients = {
        ...initialState,
        ingredients: [ingredient1, ingredient2]
      };
      const state = constructorReducer(
        stateWithTwoIngredients,
        moveIngredient({ index: 1, upwards: true })
      );

      expect(state.ingredients[0].id).toBe('test-id-2');
      expect(state.ingredients[1].id).toBe('test-id-1');
    });
  });

  describe('обработка resetConstructor', () => {
    test('должен очищать все данные конструктора', () => {
      const stateWithData = {
        bun: mockBun,
        ingredients: [
          { ...mockSauce, id: 'test-id-1' },
          { ...mockMain, id: 'test-id-2' }
        ]
      };
      const state = constructorReducer(stateWithData, resetConstructor());

      expect(state.bun).toBeNull();
      expect(state.ingredients).toEqual([]);
    });

    test('должен работать с уже пустым состоянием', () => {
      const state = constructorReducer(initialState, resetConstructor());

      expect(state.bun).toBeNull();
      expect(state.ingredients).toEqual([]);
    });

    test('должен очищать только булку, если нет ингредиентов', () => {
      const stateWithBunOnly = {
        ...initialState,
        bun: mockBun
      };
      const state = constructorReducer(stateWithBunOnly, resetConstructor());

      expect(state.bun).toBeNull();
      expect(state.ingredients).toEqual([]);
    });

    test('должен очищать только ингредиенты, если нет булки', () => {
      const stateWithIngredientsOnly = {
        ...initialState,
        ingredients: [{ ...mockSauce, id: 'test-id-1' }]
      };
      const state = constructorReducer(
        stateWithIngredientsOnly,
        resetConstructor()
      );

      expect(state.bun).toBeNull();
      expect(state.ingredients).toEqual([]);
    });
  });

  describe('интеграционные тесты', () => {
    test('полный цикл создания бургера', () => {
      let state = constructorReducer(initialState, setBun(mockBun));
      expect(state.bun).toEqual(mockBun);

      state = constructorReducer(state, addIngredient(mockSauce));
      state = constructorReducer(state, addIngredient(mockMain));
      expect(state.ingredients).toHaveLength(2);

      state = constructorReducer(state, resetConstructor());
      expect(state.bun).toBeNull();
      expect(state.ingredients).toEqual([]);
    });

    test('сценарий: добавление, перемещение и удаление ингредиентов', () => {
      let state = constructorReducer(initialState, addIngredient(mockSauce));
      state = constructorReducer(state, addIngredient(mockMain));
      const firstId = state.ingredients[0].id;
      const secondId = state.ingredients[1].id;

      // Перемещение
      state = constructorReducer(
        state,
        moveIngredient({ index: 1, upwards: true })
      );
      expect(state.ingredients[0].id).toBe(secondId);
      expect(state.ingredients[1].id).toBe(firstId);

      // Удаление
      state = constructorReducer(state, removeIngredient(secondId));
      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0].id).toBe(firstId);
    });

    test('сценарий: замена булки и добавление ингредиентов', () => {
      let state = constructorReducer(initialState, setBun(mockBun));
      expect(state.bun).toEqual(mockBun);

      state = constructorReducer(state, addIngredient(mockSauce));
      expect(state.ingredients).toHaveLength(1);

      // Замена булки
      state = constructorReducer(state, setBun(mockBun2));
      expect(state.bun).toEqual(mockBun2);
      expect(state.ingredients).toHaveLength(1);
    });

    test('сценарий: добавление булки через addIngredient', () => {
      let state = constructorReducer(initialState, addIngredient(mockSauce));
      expect(state.ingredients).toHaveLength(1);
      expect(state.bun).toBeNull();

      state = constructorReducer(state, addIngredient(mockBun));
      expect(state.bun).toMatchObject(mockBun);
      expect(state.bun).toHaveProperty('id');
      expect(state.ingredients).toHaveLength(1);
    });
  });
});

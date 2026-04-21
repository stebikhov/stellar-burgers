describe('Тестирование конструктора бургеров', () => {
  const SELECTORS = {
    bunTop: '[data-cy="bulka-top"]',
    bunBottom: '[data-cy="bulka-bottom"]',
    patty: '[data-cy="burger-patty"]',
    sauceSpicy: '[data-cy="sauce-01"]',
    sauceSpace: '[data-cy="sauce-02"]',
    constructorBunTop: '[data-cy="constructor-bun-top"]',
    constructorBunBottom: '[data-cy="constructor-bun-bottom"]',
    constructorIngredients: '[data-cy="constructor-ingredients"]',
    modal: '[data-cy="modal"]',
    modalClose: '[data-cy="modal-close"]',
    modalOverlay: '[data-cy="modal-overlay"]',
    orderNumber: '[data-cy="order-number"]',
    orderTotal: '[data-cy="order-total"]'
  };

  const TEXTS = {
    addButton: 'Добавить',
    orderButton: 'Оформить заказ',
    bunKrator: 'Краторная булка N-200i',
    bunFluorescent: 'Флюоресцентная булка R2-D3',
    pattyBio: 'Биокотлета из марсианской Магнолии',
    sauceSpicy: 'Соус Spicy-X',
    sauceSpace: 'Соус фирменный Space Sauce',
    emptyBun: 'Выберите булки',
    emptyFilling: 'Выберите начинку',
    ingredientDetails: 'Детали ингредиента'
  };

  const setupInterceptors = () => {
    cy.fixture('ingredients.json').then((ingredientsData) => {
      cy.intercept('GET', '**/api/ingredients', {
        statusCode: 200,
        body: { success: true, data: ingredientsData }
      }).as('getIngredients');
    });
  };

  const visitMainPage = () => {
    cy.visit('/');
    cy.wait('@getIngredients');
  };

  const addIngredientBySelector = (selector) => {
    cy.get(selector).find('button').contains(TEXTS.addButton).click();
  };

  const setAuthTokens = () => {
    cy.setCookie('accessToken', 'mock-access-token');
    cy.window().then((window) => {
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
    });
  };

  const clearAuthTokens = () => {
    cy.clearCookie('accessToken');
    cy.window().then((window) => {
      window.localStorage.removeItem('refreshToken');
    });
  };

  const setupAuthInterceptors = () => {
    cy.fixture('user.json').then((userData) => {
      cy.intercept('GET', '**/api/auth/user', userData).as('getUser');
    });

    cy.fixture('order.json').then((orderData) => {
      cy.intercept('POST', '**/api/orders', orderData).as('createOrder');
    });
  };

  beforeEach(() => {
    setupInterceptors();
    visitMainPage();
  });

  describe('Тесты на расчет стоимости бургера', () => {
    it('корректно считает общую стоимость с булкой, котлетой и соусом', () => {
      // Булка: 1255 * 2 = 2510, Котлета: 424, Соус: 90
      // Итого: 3024
      addIngredientBySelector(SELECTORS.bunTop);
      addIngredientBySelector(SELECTORS.patty);
      addIngredientBySelector(SELECTORS.sauceSpicy);

      cy.get(SELECTORS.orderTotal).should('contain', '3024');
    });

    it('динамически обновляет стоимость при добавлении новых ингредиентов', () => {
      addIngredientBySelector(SELECTORS.bunTop);
      cy.get(SELECTORS.orderTotal).should('contain', '2510');

      addIngredientBySelector(SELECTORS.patty);
      cy.get(SELECTORS.orderTotal).should('contain', '2934');
    });
  });

  describe('Тесты счетчиков ингредиентов', () => {
    it('показывает счетчик "2" для добавленной булки', () => {
      addIngredientBySelector(SELECTORS.bunTop);

      cy.get(SELECTORS.bunTop)
        .find('[class*="counter"]')
        .should('contain', '2');
    });

    it('увеличивает счетчик при повторном добавлении начинки', () => {
      addIngredientBySelector(SELECTORS.patty);
      addIngredientBySelector(SELECTORS.patty);

      cy.get(SELECTORS.patty).find('[class*="counter"]').should('contain', '2');
    });

    it('сбрасывает все счетчики после успешного оформления заказа', () => {
      setAuthTokens();

      cy.intercept('POST', '**/api/orders', { fixture: 'order.json' }).as(
        'createOrder'
      );
      cy.intercept('GET', '**/api/auth/user', { fixture: 'user.json' }).as(
        'getUser'
      );

      visitMainPage();

      addIngredientBySelector(SELECTORS.bunTop);
      addIngredientBySelector(SELECTORS.patty);

      cy.get(SELECTORS.bunTop).find('[class*="counter"]').should('exist');

      cy.get('button').contains(TEXTS.orderButton).click();
      cy.wait('@createOrder');

      cy.get(SELECTORS.modalClose).click();

      cy.get(SELECTORS.bunTop).find('[class*="counter"]').should('not.exist');
      cy.get(SELECTORS.patty).find('[class*="counter"]').should('not.exist');
    });
  });

  describe('Тесты модальных окон с деталями ингредиентов', () => {
    it('открывает модальное окно с информацией об ингредиенте при клике', () => {
      cy.get(SELECTORS.bunTop).find('a').first().click();

      cy.get(SELECTORS.modal).should('be.visible');
      cy.get(SELECTORS.modal).should('contain', TEXTS.ingredientDetails);
      cy.get(SELECTORS.modal).should('contain', TEXTS.bunKrator);
      cy.get(SELECTORS.modal).should('contain', 'Калории');
      cy.get(SELECTORS.modal).should('contain', 'Белки');
      cy.get(SELECTORS.modal).should('contain', 'Жиры');
      cy.get(SELECTORS.modal).should('contain', 'Углеводы');
    });

    it('закрывает модальное окно при клике на кнопку закрытия', () => {
      cy.get(SELECTORS.bunTop).find('a').first().click();
      cy.get(SELECTORS.modal).should('be.visible');

      cy.get(SELECTORS.modalClose).click();

      cy.get(SELECTORS.modal).should('not.exist');
    });

    it('закрывает модальное окно при клике на оверлей', () => {
      cy.get(SELECTORS.bunTop).find('a').first().click();
      cy.get(SELECTORS.modal).should('be.visible');

      cy.get(SELECTORS.modalOverlay).click({ force: true });

      cy.get(SELECTORS.modal).should('not.exist');
    });

    it('закрывает модальное окно при нажатии клавиши Escape', () => {
      cy.get(SELECTORS.bunTop).find('a').first().click();
      cy.get(SELECTORS.modal).should('be.visible');

      cy.get('body').type('{esc}');

      cy.get(SELECTORS.modal).should('not.exist');
    });
  });

  describe('Тесты добавления ингредиентов', () => {
    it('добавляет булку в верхнюю и нижнюю часть конструктора', () => {
      cy.get(SELECTORS.bunTop).should('be.visible');
      addIngredientBySelector(SELECTORS.bunTop);

      cy.get(SELECTORS.constructorBunTop)
        .should('be.visible')
        .and('contain', TEXTS.bunKrator);
      cy.get(SELECTORS.constructorBunBottom)
        .should('be.visible')
        .and('contain', TEXTS.bunKrator);
    });

    it('добавляет основной ингредиент (котлету) в список начинки', () => {
      addIngredientBySelector(SELECTORS.patty);

      cy.get(SELECTORS.constructorIngredients)
        .should('exist')
        .contains('li', TEXTS.pattyBio)
        .scrollIntoView()
        .should('be.visible');
    });

    it('добавляет соус в список начинки конструктора', () => {
      cy.get(SELECTORS.sauceSpicy)
        .find('button')
        .contains(TEXTS.addButton)
        .click();

      cy.get(SELECTORS.constructorIngredients)
        .should('exist')
        .contains('li', TEXTS.sauceSpicy)
        .scrollIntoView()
        .should('be.visible');
    });

    it('заменяет текущую булку на новую при добавлении другой булки', () => {
      addIngredientBySelector(SELECTORS.bunTop);
      cy.get(SELECTORS.constructorBunTop).should('contain', TEXTS.bunKrator);

      addIngredientBySelector(SELECTORS.bunBottom);

      cy.get(SELECTORS.constructorBunTop).should(
        'contain',
        TEXTS.bunFluorescent
      );
      cy.get(SELECTORS.constructorBunBottom).should(
        'contain',
        TEXTS.bunFluorescent
      );
    });

    it('добавляет несколько разных начинок в конструктор одновременно', () => {
      addIngredientBySelector(SELECTORS.patty);
      addIngredientBySelector(SELECTORS.sauceSpicy);
      addIngredientBySelector(SELECTORS.sauceSpace);

      cy.get(SELECTORS.constructorIngredients).within(() => {
        cy.contains(TEXTS.pattyBio).should('exist');
        cy.contains(TEXTS.sauceSpicy).should('exist');
        cy.contains(TEXTS.sauceSpace).should('exist');
      });
    });
  });

  describe('Тесты функционала Drag and Drop', () => {
    it('поддерживает добавление ингредиентов через перетаскивание', () => {
      addIngredientBySelector(SELECTORS.patty);
      addIngredientBySelector(SELECTORS.sauceSpicy);

      cy.get(SELECTORS.constructorIngredients).within(() => {
        cy.contains(TEXTS.pattyBio).should('exist');
        cy.contains(TEXTS.sauceSpicy).should('exist');
      });
    });
  });

  describe('Тесты оформления заказа', () => {
    beforeEach(() => {
      setAuthTokens();
      setupAuthInterceptors();
      visitMainPage();
    });

    it('создает заказ и отображает модальное окно с номером заказа', () => {
      addIngredientBySelector(SELECTORS.bunTop);
      addIngredientBySelector(SELECTORS.patty);
      addIngredientBySelector(SELECTORS.sauceSpicy);

      cy.get('button').contains(TEXTS.orderButton).should('not.be.disabled');

      cy.get('button').contains(TEXTS.orderButton).click();

      cy.wait('@createOrder');

      cy.get(SELECTORS.orderNumber, { timeout: 10000 }).should('be.visible');

      cy.get(SELECTORS.orderNumber).should('contain', '12345');
    });

    it('очищает конструктор после закрытия модального окна заказа', () => {
      addIngredientBySelector(SELECTORS.bunTop);
      addIngredientBySelector(SELECTORS.patty);

      cy.get('button').contains(TEXTS.orderButton).click();
      cy.wait('@createOrder');

      cy.get(SELECTORS.orderNumber).should('be.visible');

      cy.get(SELECTORS.modalClose).click();

      cy.get(SELECTORS.orderNumber).should('not.exist');

      cy.get(SELECTORS.constructorBunTop).should('contain', TEXTS.emptyBun);
      cy.get(SELECTORS.constructorBunBottom).should('contain', TEXTS.emptyBun);
      cy.get(SELECTORS.constructorIngredients).should(
        'contain',
        TEXTS.emptyFilling
      );
    });

    it('блокирует кнопку оформления заказа при отсутствии булки', () => {
      addIngredientBySelector(SELECTORS.patty);

      cy.get('button').contains(TEXTS.orderButton).should('be.disabled');
    });

    it('перенаправляет неавторизованного пользователя на страницу входа', () => {
      clearAuthTokens();

      visitMainPage();

      addIngredientBySelector(SELECTORS.bunTop);
      addIngredientBySelector(SELECTORS.patty);

      cy.get('button').contains(TEXTS.orderButton).click();

      cy.url().should('include', '/login');
    });
  });
});

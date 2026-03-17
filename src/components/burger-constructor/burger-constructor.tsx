import { FC, useMemo, useEffect } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useDispatch, useSelector } from '../../services/store';
import { useNavigate } from 'react-router-dom';
import {
  createOrder,
  resetOrderModalData
} from '../../services/slices/orderSlice';
import { resetConstructor } from '../../services/slices/constructorSlice';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const constructorItems = useSelector((state) => state.burgerConstructor);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { orderRequest, orderModalData, isNewOrder } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    if (orderModalData && !isNewOrder) {
      dispatch(resetOrderModalData());
    }
  }, [orderModalData, isNewOrder, dispatch]);

  const onOrderClick = () => {
    if (!constructorItems.bun || orderRequest) return;

    if (!isAuthenticated) {
      return navigate('/login');
    }

    const data = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((ingredient) => ingredient._id),
      constructorItems.bun._id
    ];

    dispatch(createOrder(data));
  };

  const closeOrderModal = () => {
    dispatch(resetOrderModalData());
    dispatch(resetConstructor());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};

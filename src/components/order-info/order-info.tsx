import { FC, useEffect, useMemo } from 'react';

import { TIngredient } from '@utils-types';
import { useDispatch, useSelector } from '../../services/store';
import { OrderInfoUI, Preloader } from '@ui';
import { useParams } from 'react-router-dom';
import { fetchOrder } from '../../services/slices/orderSlice';

export const OrderInfo: FC = () => {
  const dispatch = useDispatch();

  const { number } = useParams<{ number: string }>();

  const { isLoading: isIngredientsLoading, data: ingredients } = useSelector(
    (state) => state.ingredients
  );

  const { isLoading, orderModalData: orderData } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    if (!number) return;
    dispatch(fetchOrder(Number(number)));
  }, [dispatch, number]);

  // Готовим данные для отображения
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, ingredientId) => {
        if (!acc[ingredientId]) {
          const ingredient = ingredients.find(
            (ing) => ing._id === ingredientId
          );
          if (!ingredient) return acc;

          acc[ingredientId] = {
            ...ingredient,
            count: 1
          };
        } else {
          acc[ingredientId].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (totalPrice, ingredient) =>
        totalPrice + ingredient.price * ingredient.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (isIngredientsLoading || isLoading) {
    return <Preloader />;
  }

  if (!orderInfo) {
    return null;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};

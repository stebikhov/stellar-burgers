import { FC, useMemo } from 'react';
import { TOrder } from '@utils-types';
import { FeedInfoUI } from '../ui/feed-info';
import { useSelector } from '../../services/store';

const getOrders = (orders: TOrder[], status: string): number[] => {
  const filtered = orders.filter((item) => item.status === status);
  const numbers = filtered.map((item) => item.number);
  return numbers.slice(0, 20);
};

export const FeedInfo: FC = () => {
  const feed = useSelector((state) => state.feed.data);
  const { orders } = feed;

  const readyOrders = useMemo(() => getOrders(orders, 'done'), [orders]);
  const pendingOrders = useMemo(() => getOrders(orders, 'pending'), [orders]);

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={feed}
    />
  );
};

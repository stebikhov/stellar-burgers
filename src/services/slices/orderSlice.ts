import { getOrderByNumberApi, getOrdersApi, orderBurgerApi } from '@api';
import {
  SerializedError,
  createAsyncThunk,
  createSlice
} from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';

type TOrdersState = {
  isLoading: boolean;
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: null | SerializedError;
  data: TOrder[];
};

export const initialState: TOrdersState = {
  isLoading: false,
  orderRequest: false,
  orderModalData: null,
  error: null,
  data: []
};

export const fetchOrders = createAsyncThunk<TOrder[]>(
  'order/fetchOrders',
  getOrdersApi
);

export const fetchOrder = createAsyncThunk<TOrder, number>(
  'order/fetchOrder',
  async (orderNumber, { rejectWithValue }) => {
    const response = await getOrderByNumberApi(orderNumber);
    return !response?.success ? rejectWithValue(response) : response.orders[0];
  }
);

export const createOrder = createAsyncThunk<
  { order: TOrder; name: string },
  string[]
>('order/create', async (ingredientIds, { rejectWithValue }) => {
  const response = await orderBurgerApi(ingredientIds);
  if (!response?.success) {
    return rejectWithValue(response);
  }
  return { order: response.order, name: response.name };
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderModalData(state) {
      state.orderModalData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.error = null;
        state.isLoading = true;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.error = action.error;
        state.isLoading = false;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.error = action.error;
        state.isLoading = false;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.orderModalData = action.payload;
        state.isLoading = false;
      })
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.error = action.error;
        state.orderRequest = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderModalData = action.payload.order;
        state.orderRequest = false;
      });
  }
});

export const { resetOrderModalData } = orderSlice.actions;

export default orderSlice.reducer;

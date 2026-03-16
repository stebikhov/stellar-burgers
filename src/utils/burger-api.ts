import { setCookie, getCookie } from './cookie';
import { TIngredient, TOrder, TOrdersData, TUser } from './types';

const URL = process.env.BURGER_API_URL;

const checkResponse = <T>(res: Response): Promise<T> => {
  if (res.ok) {
    return res.json();
  }
  return res.json().then((err) => Promise.reject(err));
};

type TServerResponse<T> = {
  success: boolean;
} & T;

type TRefreshResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
}>;

export const refreshToken = (): Promise<TRefreshResponse> => {
  const token = localStorage.getItem('refreshToken');

  return fetch(`${URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({ token })
  })
    .then((res) => checkResponse<TRefreshResponse>(res))
    .then((refreshData) => {
      if (!refreshData.success) {
        return Promise.reject(refreshData);
      }
      setCookie('accessToken', refreshData.accessToken);
      localStorage.setItem('refreshToken', refreshData.refreshToken);
      return refreshData;
    });
};

export const fetchWithRefresh = async <T>(
  url: RequestInfo,
  options: RequestInit
) => {
  try {
    const res = await fetch(url, options);
    return await checkResponse<T>(res);
  } catch (err) {
    const error = err as { message: string };
    if (error.message === 'jwt expired') {
      const refreshData = await refreshToken();
      if (options.headers) {
        (options.headers as { [key: string]: string }).authorization =
          refreshData.accessToken;
      }
      const res = await fetch(url, options);
      return await checkResponse<T>(res);
    }
    return Promise.reject(err);
  }
};

type TIngredientsResponse = TServerResponse<{
  data: TIngredient[];
}>;

type TFeedsResponse = TServerResponse<{
  orders: TOrder[];
  total: number;
  totalToday: number;
}>;

type TOrdersResponse = TServerResponse<{
  data: TOrder[];
}>;

export const getIngredientsApi = () =>
  fetch(`${URL}/ingredients`)
    .then((res) => checkResponse<TIngredientsResponse>(res))
    .then((response) => {
      if (!response?.success) {
        return Promise.reject(response);
      }
      return response.data;
    });

export const getFeedsApi = (): Promise<TOrdersData> =>
  fetch(`${URL}/orders/all`)
    .then((res) => checkResponse<TFeedsResponse>(res))
    .then((response) => {
      if (!response?.success) {
        return Promise.reject(response);
      }
      const { orders, total, totalToday } = response;
      return { orders, total, totalToday };
    });

export const getOrdersApi = () =>
  fetchWithRefresh<TFeedsResponse>(`${URL}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken')
    } as HeadersInit
  }).then((response) => {
    if (!response?.success) {
      return Promise.reject(response);
    }
    return response.orders;
  });

type TNewOrderResponse = TServerResponse<{
  order: TOrder;
  name: string;
}>;

export const orderBurgerApi = (ingredientIds: string[]) =>
  fetchWithRefresh<TNewOrderResponse>(`${URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken')
    } as HeadersInit,
    body: JSON.stringify({
      ingredients: ingredientIds
    })
  }).then((response) => {
    if (!response?.success) {
      return Promise.reject(response);
    }
    return response;
  });

type TOrderResponse = TServerResponse<{
  orders: TOrder[];
}>;

export const getOrderByNumberApi = (number: number) =>
  fetch(`${URL}/orders/${number}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => checkResponse<TOrderResponse>(res));

export type TRegisterData = {
  email: string;
  name: string;
  password: string;
};

type TAuthResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
  user: TUser;
}>;

export const registerUserApi = (userData: TRegisterData) =>
  fetch(`${URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(userData)
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((response) => {
      if (!response?.success) {
        return Promise.reject(response);
      }
      return response;
    });

export type TLoginData = {
  email: string;
  password: string;
};

export const loginUserApi = (loginData: TLoginData) =>
  fetch(`${URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(loginData)
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((response) => {
      if (!response?.success) {
        return Promise.reject(response);
      }
      return response;
    });

export const forgotPasswordApi = (emailData: { email: string }) =>
  fetch(`${URL}/password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(emailData)
  })
    .then((res) => checkResponse<TServerResponse<Record<string, never>>>(res))
    .then((response) => {
      if (!response?.success) {
        return Promise.reject(response);
      }
      return response;
    });

export const resetPasswordApi = (resetData: {
  password: string;
  token: string;
}) =>
  fetch(`${URL}/password-reset/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(resetData)
  })
    .then((res) => checkResponse<TServerResponse<Record<string, never>>>(res))
    .then((response) => {
      if (!response?.success) {
        return Promise.reject(response);
      }
      return response;
    });

type TUserResponse = TServerResponse<{ user: TUser }>;

export const getUserApi = () =>
  fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    headers: {
      authorization: getCookie('accessToken')
    } as HeadersInit
  });

export const updateUserApi = (user: Partial<TRegisterData>) =>
  fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken')
    } as HeadersInit,
    body: JSON.stringify(user)
  });

export const logoutApi = () => {
  const token = localStorage.getItem('refreshToken');

  return fetch(`${URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({ token })
  }).then((res) => checkResponse<TServerResponse<Record<string, never>>>(res));
};

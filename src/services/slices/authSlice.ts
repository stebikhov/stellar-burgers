import {
  createAsyncThunk,
  createSlice,
  SerializedError
} from '@reduxjs/toolkit';

import {
  TLoginData,
  TRegisterData,
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi
} from '@api';

import { TUser } from '@utils-types';

import { setCookie, deleteCookie } from '../../utils/cookie';

const clearTokens = () => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

const storeTokens = (refreshToken: string, accessToken: string) => {
  if (!refreshToken || !accessToken) {
    throw new Error('Invalid tokens');
  }
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

type TUserState = {
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  loginError?: SerializedError;
  registerError?: SerializedError;
  userError?: SerializedError;
  isLoading: boolean;
  data: TUser;
};

export const initialState: TUserState = {
  isAuthChecked: false,
  isAuthenticated: false,
  isLoading: false,
  data: {
    name: '',
    email: ''
  }
};

export const fetchUser = createAsyncThunk<TUser>(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    const response = await getUserApi();
    return !response?.success ? rejectWithValue(response) : response.user;
  }
);

export const updateUser = createAsyncThunk<TUser, Partial<TRegisterData>>(
  'auth/updateUser',
  async (userData, { rejectWithValue }) => {
    const response = await updateUserApi(userData);
    return !response?.success ? rejectWithValue(response) : response.user;
  }
);

export const register = createAsyncThunk<TUser, TRegisterData>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    const response = await registerUserApi(userData);
    if (!response?.success) {
      return rejectWithValue(response);
    }
    storeTokens(response.refreshToken, response.accessToken);
    return response.user;
  }
);

export const login = createAsyncThunk<TUser, TLoginData>(
  'auth/login',
  async (loginData, { rejectWithValue }) => {
    const response = await loginUserApi(loginData);
    if (!response?.success) {
      return rejectWithValue(response);
    }
    storeTokens(response.refreshToken, response.accessToken);
    return response.user;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    const response = await logoutApi();
    if (!response?.success) {
      return rejectWithValue(response);
    }
    clearTokens();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthChecked: (state) => {
      state.isAuthChecked = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.isAuthChecked = true;
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isAuthChecked = true;
        state.userError = action.meta.rejectedWithValue
          ? (action.payload as SerializedError)
          : action.error;
        state.isLoading = false;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.userError = action.meta.rejectedWithValue
          ? (action.payload as SerializedError)
          : action.error;
        state.isLoading = false;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.registerError = undefined;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.data = action.payload;
        state.registerError = undefined;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.registerError = action.meta.rejectedWithValue
          ? (action.payload as SerializedError)
          : action.error;
      })

      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.loginError = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.data = action.payload;
        state.loginError = undefined;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.loginError = action.meta.rejectedWithValue
          ? (action.payload as SerializedError)
          : action.error;
      })

      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.data = { email: '', name: '' };
        state.isLoading = false;
      });
  }
});

//  действие setAuthChecked для использования в других файлах
export const { setAuthChecked } = authSlice.actions;

export default authSlice.reducer;

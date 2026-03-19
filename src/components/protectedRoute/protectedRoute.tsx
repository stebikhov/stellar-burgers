import React, { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, RootState } from '../../services/store';

type TProtectedRoute = {
  children: JSX.Element;
  anonymous?: boolean;
};

const ProtectedRoute: FC<TProtectedRoute> = ({
  children,
  anonymous = false
}) => {
  const location = useLocation();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const from = location.state?.from?.pathname || '/';

  if (!anonymous && !isAuthenticated) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  if (anonymous && isAuthenticated) {
    return <Navigate to={from} />;
  }

  return children;
};

export default ProtectedRoute;

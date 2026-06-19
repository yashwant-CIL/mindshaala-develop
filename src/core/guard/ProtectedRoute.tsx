import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
    const { isAuthenticated } = useSelector((state: any) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to='/' replace />;
    }
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
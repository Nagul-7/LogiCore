import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';
import LoginScreen      from './pages/LoginScreen';
import Layout           from './components/Layout';
import Scanner          from './pages/Scanner';
import Result           from './pages/Result';
import Discrepancy      from './pages/Discrepancy';
import Entries          from './pages/Entries';
import './styles/global.css';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginScreen />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/scanner" replace />} />
                        <Route path="scanner"     element={<Scanner />} />
                        <Route path="result"      element={<Result />} />
                        <Route path="discrepancy" element={<Discrepancy />} />
                        <Route path="entries"     element={<Entries />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/scanner" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

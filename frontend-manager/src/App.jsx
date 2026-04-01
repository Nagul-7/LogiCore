import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Logistics from './pages/Logistics';
import './styles/global.css';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="logistics" element={<Logistics />} />
                    <Route path="settings" element={<div>Settings Component</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Scanner from './pages/Scanner';
import Result from './pages/Result';
import Discrepancy from './pages/Discrepancy';
import Entries from './pages/Entries';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/scanner" replace />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="result" element={<Result />} />
          <Route path="discrepancy" element={<Discrepancy />} />
          <Route path="entries" element={<Entries />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

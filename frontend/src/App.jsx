import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './context/ToastContext';
import './App.css';
import './AppResponsive.css';

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
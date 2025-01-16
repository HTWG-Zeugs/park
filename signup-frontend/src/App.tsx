import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import SignupSuccessPage from './pages/SignupSuccessPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup/:planId" element={<SignupPage />} />
        <Route path="/signup/success" element={<SignupSuccessPage />} />
      </Routes>
    </Router>
  );
};

export default App;

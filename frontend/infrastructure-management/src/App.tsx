import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlanDetailsPage from './pages/PlanDetailsPage';
import SignupPage from './pages/SignupPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/plan/:planId" element={<PlanDetailsPage />} />
        <Route path="/signup/:planId" element={<SignupPage />} />
      </Routes>
    </Router>
  );
};

export default App;

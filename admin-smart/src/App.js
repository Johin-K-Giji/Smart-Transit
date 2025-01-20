import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavigationBar from './pages/navigation';
import AddBusPage from './pages/addBus';
import ViewBusPage from './pages/viewBus';


const App = () => {
  return (
    <Router>
<NavigationBar/>
      <Routes>
        <Route path="/" element={<AddBusPage />} />
        <Route path="/view" element={<ViewBusPage />} />
      </Routes>
    </Router>
  );
};

export default App;

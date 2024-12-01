import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import EditPoll from './pages/EditPoll';
import ManageUsers from './pages/ManageUsers';
import ReviewSubmissions from './pages/ReviewSubmissions';
import ManageComments from './pages/ManageComments';
import CreatePoll from './pages/CreatePoll';
import EditSubmission from './pages/EditSubmission';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/polls/edit/:id" element={<EditPoll />} />
      <Route path="/submissions/edit/:id" element={<EditSubmission />} />
      <Route path="/users" element={<ManageUsers />} />
      <Route path="/submissions" element={<ReviewSubmissions />} />
      <Route path="/comments" element={<ManageComments />} />
      <Route path="/createPoll" element={<CreatePoll />} />
    </Routes>
  </Router>
);

export default App;

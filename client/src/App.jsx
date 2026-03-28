import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import PageWrapper from './components/layout/PageWrapper';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import SessionHistory from './pages/SessionHistory';
import BoardroomSetup from './pages/BoardroomSetup';
import Boardroom from './pages/Boardroom';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Analytics from './pages/Analytics';
import TeamManagement from './pages/TeamManagement';
import CoFounder from './pages/CoFounder';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<PageWrapper hideNavbar><Login /></PageWrapper>} />
                <Route path="/register" element={<PageWrapper hideNavbar><Register /></PageWrapper>} />

                <Route path="/sessions" element={
                    <ProtectedRoute>
                        <PageWrapper><SessionHistory /></PageWrapper>
                    </ProtectedRoute>
                } />

                <Route path="/start" element={
                    <ProtectedRoute>
                        <PageWrapper><BoardroomSetup /></PageWrapper>
                    </ProtectedRoute>
                } />

                <Route path="/boardroom/:id" element={
                    <ProtectedRoute>
                        <PageWrapper><Boardroom /></PageWrapper>
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/:id" element={
                    <ProtectedRoute>
                        <PageWrapper><AnalyticsDashboard /></PageWrapper>
                    </ProtectedRoute>
                } />

                <Route path="/analytics" element={
                    <ProtectedRoute>
                        <PageWrapper><Analytics /></PageWrapper>
                    </ProtectedRoute>
                } />

                <Route path="/team" element={
                    <ProtectedRoute>
                        <PageWrapper><TeamManagement /></PageWrapper>
                    </ProtectedRoute>
                } />

                <Route path="/co-founder" element={
                    <ProtectedRoute>
                        <PageWrapper><CoFounder /></PageWrapper>
                    </ProtectedRoute>
                } />

                {/* Public Share URL */}
                <Route path="/share/:token" element={
                    <PageWrapper><AnalyticsDashboard isShared={true} /></PageWrapper>
                } />

            </Routes>
        </Router>
    );
};

export default App;

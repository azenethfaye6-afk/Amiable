/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { MembershipApplication } from './pages/MembershipApplication';
import { Gallery } from './pages/Gallery';
import { Suggestions } from './pages/Suggestions';
import { ModeratorDashboard } from './pages/ModeratorDashboard';
import { Rules } from './pages/Rules';
import { AnnouncementsPage } from './pages/Announcements';
import { DailyActivities } from './pages/Activities';
import { BirthdayCorner } from './pages/BirthdayCorner';
import { ResourceBox } from './pages/ResourceBox';
import { MedicalHub } from './pages/MedicalHub';
import { KeywordManagement } from './pages/Keywords';
import { ProfileDashboard } from './pages/ProfileDashboard';
import { Timeline } from './pages/Timeline';
import { MembersList } from './pages/MembersList';
import { StaffLogin } from './pages/StaffLogin';
import { BadgeCenter } from './pages/BadgeCenter';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireMember?: boolean; requireAdmin?: boolean; requireModerator?: boolean }> = ({ 
  children, 
  requireMember, 
  requireAdmin,
  requireModerator
}) => {
  const { user, loading, isAdmin, isMember, isModerator } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-warm-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-warm-olive"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" />;
  if (requireModerator && !isModerator) return <Navigate to="/" />;
  if (requireMember && !isMember) return <Navigate to="/apply" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/" element={<Home />} />
            <Route path="/apply" element={
              <ProtectedRoute>
                <MembershipApplication />
              </ProtectedRoute>
            } />
            <Route path="/gallery" element={
              <ProtectedRoute requireMember>
                <Gallery />
              </ProtectedRoute>
            } />
            <Route path="/suggestions" element={
              <ProtectedRoute requireMember>
                <Suggestions />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/moderator" element={
              <ProtectedRoute requireModerator>
                <ModeratorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/rules" element={<Rules />} />
            <Route path="/announcements" element={
              <ProtectedRoute requireMember>
                <AnnouncementsPage />
              </ProtectedRoute>
            } />
            <Route path="/activities" element={
              <ProtectedRoute requireMember>
                <DailyActivities />
              </ProtectedRoute>
            } />
            <Route path="/birthdays" element={
              <ProtectedRoute requireMember>
                <BirthdayCorner />
              </ProtectedRoute>
            } />
            <Route path="/resources" element={
              <ProtectedRoute requireMember>
                <ResourceBox />
              </ProtectedRoute>
            } />
            <Route path="/medical" element={
              <ProtectedRoute requireMember>
                <MedicalHub />
              </ProtectedRoute>
            } />
            <Route path="/keywords" element={
              <ProtectedRoute requireAdmin>
                <KeywordManagement />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfileDashboard />
              </ProtectedRoute>
            } />
            <Route path="/timeline" element={
              <ProtectedRoute requireMember>
                <Timeline />
              </ProtectedRoute>
            } />
            <Route path="/members" element={
              <ProtectedRoute requireMember>
                <MembersList />
              </ProtectedRoute>
            } />
            <Route path="/badges" element={
              <ProtectedRoute requireMember>
                <BadgeCenter />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { RoleGuard } from './routes/RoleGuard';

// Placeholder Components
const LoginPage = () => <div style={{ padding: '20px' }}><h1>Login Page</h1></div>;
const LandingPage = () => <div style={{ padding: '20px' }}><h1>Welcome to Manga Publishing System</h1></div>;
const UnauthorizedPage = () => <div style={{ padding: '20px' }}><h1>403 - Unauthorized</h1></div>;
const MangakaDashboard = () => <div style={{ padding: '20px' }}><h1>Mangaka Dashboard</h1></div>;
const AssistantDashboard = () => <div style={{ padding: '20px' }}><h1>Assistant Dashboard</h1></div>;
const EditorDashboard = () => <div style={{ padding: '20px' }}><h1>Editor Dashboard</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Mangaka Routes */}
        <Route element={<RoleGuard allowedRoles={['Mangaka']} />}>
          <Route path="/mangaka" element={<MangakaDashboard />} />
        </Route>

        {/* Assistant Routes */}
        <Route element={<RoleGuard allowedRoles={['Assistant']} />}>
          <Route path="/assistant" element={<AssistantDashboard />} />
        </Route>

        {/* Editor Routes */}
        <Route element={<RoleGuard allowedRoles={['Editor']} />}>
          <Route path="/editor" element={<EditorDashboard />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

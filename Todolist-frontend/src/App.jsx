import './App.css';
import Login from './Components/LoginComponents/Login';
import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './routes/RequireAuth';
import { useSelector } from 'react-redux';
import NavBar from './Components/NavigationComponents/NavBar';
import DashboardComponent from './Components/DashboardComponents/DashboardComponent/DashboardComponent';
import ProfileComponent from './Components/ProfileComponents/ProfileComponent';

const App = () => {
  const auth = useSelector((state) => state.auth.auth);

  return (
    <div className="App">
      <Routes>
        <Route
          path="/login"
          element={auth ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <>
                <NavBar />
                <DashboardComponent />
              </>
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <>
                <NavBar />
                <ProfileComponent />
              </>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
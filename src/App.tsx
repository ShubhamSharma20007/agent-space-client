import React, { Suspense, use, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthService from './services/auth.service';
import Login from './pages/Login';
import { useUser } from './redux/hooks/useUser';
import ChatLayout from './pages/ChatLayout';


// Protect Route

const ProtectedRoute = ({ children }: { children: React.JSX.Element }) => {
  const userRedux = useUser();
  const user = userRedux.user;
 if (!user.name || !user.email) {
  return <Login></Login>
}
  return children;
}


const userPromise = AuthService.getUser();

const AppRoutes = () => {
  const userRedux = useUser();
  const user = use(userPromise);
  
  console.log('User State: ',user)

  useEffect(() => {
    if (user) {
      userRedux.setUser(user);
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/chat" element={<ProtectedRoute>
        <ChatLayout />
        </ProtectedRoute>} />
      <Route path="/*" element={<Login />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="loader">
  <div className="square" id="sq1"></div>
  <div className="square" id="sq2"></div>
  <div className="square" id="sq3"></div>
  <div className="square" id="sq4"></div>
  <div className="square" id="sq5"></div>
  <div className="square" id="sq6"></div>
  <div className="square" id="sq7"></div>
  <div className="square" id="sq8"></div>
  <div className="square" id="sq9"></div>
</div>}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
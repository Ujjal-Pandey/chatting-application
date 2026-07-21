import { useState } from "react";
import ClientAuth from "./components/ClientAuth";
import ChatApp from "./components/ChatApp";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const { user, token } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // If user is logged in, show chat app
  if (user && token) {
    return <ChatApp />;
  }

  return (
    <ClientAuth
      key={isLogin ? "login" : "register"}
      isLogin={isLogin}
      onSwitchMode={() => setIsLogin(!isLogin)}
      onAuthSuccess={() => {}}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

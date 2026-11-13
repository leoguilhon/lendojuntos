import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";

function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;

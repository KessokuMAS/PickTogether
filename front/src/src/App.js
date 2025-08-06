import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import root from "./router/root";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={root} />
    </AuthProvider>
  );
}

export default App;

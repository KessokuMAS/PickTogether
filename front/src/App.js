import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import root from "./router/root";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <RouterProvider router={root} />
      </Suspense>
    </AuthProvider>
  );
}

export default App;

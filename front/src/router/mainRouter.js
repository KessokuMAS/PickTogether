import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

// Lazy import for MainPage
const MainPage = lazy(() => import("../pages/main/MainPage"));

const mainRouter = () => [
  {
    path: "",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <MainPage />
      </Suspense>
    ),
  },
];

export default mainRouter;

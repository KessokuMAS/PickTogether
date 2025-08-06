import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

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

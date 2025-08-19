// routes/MemberLayout.tsx
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import LoadingSpinner from "../components/member/LoadingSpinner";

export default function MemberLayout() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Outlet />
    </Suspense>
  );
}

import { Suspense } from "react";
import AuthPageClient from "./auth-page-client";

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageClient />
    </Suspense>
  );
}

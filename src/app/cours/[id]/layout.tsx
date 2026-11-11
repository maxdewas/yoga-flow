import { Suspense } from "react";

// Route params are only known at request time; the page reads them client-side.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}

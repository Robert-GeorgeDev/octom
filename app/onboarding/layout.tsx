import { AuthProvider } from "@/components/auth-provider";

// Only the pages that need to know who is signed in load the session code.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

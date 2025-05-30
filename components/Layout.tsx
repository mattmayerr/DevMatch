import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, name, company, avatar_url")
        .eq("user_id", userId)
        .single();

      if (profile) {
        setUser({
          name: profile.role === "employer" ? profile.company : profile.name,
          role: profile.role,
          avatar_url: profile.avatar_url,
        });
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div>
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex gap-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>

          {user?.role === "developer" && (
            <>
              <Link href="/jobs" className="mr-4">
                View Jobs
              </Link>
              <Link href="/dashboard" className="mr-4">
                My Applications
              </Link>
            </>
          )}

          {user?.role === "employer" && (
            <>
              <Link href="/post-job" className="mr-4">
                Post a Job
              </Link>
              <Link href="/employer-dashboard" className="mr-4">
                My Job Posts
              </Link>
              <Link href="/developers" className="mr-4">
                Find Developers
              </Link>
            </>
          )}

          {role === "developer" && (
            <>
              <Link href="/dashboard" className="relative hover:underline">
                My Applications
                {hasNotifications && (
                  <span className="absolute -top-1 -right-3 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Link>
              <Link href="/jobs" className="hover:underline">
                Find Jobs
              </Link>
            </>
          )}

          {role === "employer" && (
            <>
              <Link href="/employer-dashboard" className="hover:underline">
                My Job Posts
              </Link>
              <Link href="/post-job" className="hover:underline">
                Post a Job
              </Link>
              <Link href="/jobs" className="hover:underline">
                Job Board
              </Link>
              <Link href="/developers" className="hover:underline">
                Find Developers
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <Link
              href="/profile"
              className="flex items-center gap-2 hover:opacity-80"
            >
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="text-sm text-white underline">
                {user.name || "User"}
              </span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
          >
            Log Out
          </button>
        </div>
      </nav>

      <main className="p-4">{children}</main>
    </div>
  );
}

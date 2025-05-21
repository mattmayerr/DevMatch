import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  tech_stack: string;
  description: string;
  created_at: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Removed top-level await; userId will be handled inside useEffect

  useEffect(() => {
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) {
        router.push("/login");
        return;
      }

      const { data: apps } = await supabase
        .from("applications")
        .select("status, job:job_id (title, company, location)")
        .eq("user_id", userId);

      setApplications(apps || []);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <p className="p-6">Loading your dashboard...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Applications</h1>

      {applications.length === 0 && <p>You haven’t applied to any jobs yet.</p>}

      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map((app) => (
          <Link href={`/job/${app.job.id}`} key={app.job.id}>
            <div className="border p-4 rounded-lg hover:shadow-md transition cursor-pointer">
              <h2 className="text-xl font-semibold">{app.job.title}</h2>
              <p className="text-sm text-gray-500">
                {app.job.company} — {app.job.location}
              </p>
              <p className="text-sm font-medium mt-1 text-yellow-500">
                Status:{" "}
                {app.status === "pending"
                  ? "Pending ⏳"
                  : app.status === "accepted"
                  ? "Accepted ✅"
                  : "Rejected ❌"}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <button
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
      >
        Log Out
      </button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Link from "next/link";

export default function EmployerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleDecision = async (
    applicationId: string,
    decision: "accepted" | "rejected"
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${decision} this applicant?`
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("applications")
      .update({
        status: decision,
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (error) {
      alert("Failed to update status: " + error.message);
    } else {
      alert(`Application ${decision}`);
      // Refresh the dashboard (or reload page / state)
      router.reload();
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.push("/login");
        return;
      }

      setUser(authData.user);

      try {
        const { data: jobsData, error } = await supabase
          .from("jobs")
          .select(
            `
  id, title, company, location, created_at,
  applications (
    id,
    user_id,
    status
  ),
  job_views (
    id
  )
`
          )
          .eq("user_id", authData.user.id);

        if (error) {
          console.error("Supabase error:", error.message);
        } else {
          console.log("Fetched jobs:", jobsData);
          setJobs(jobsData || []);
        }
      } catch (err) {
        console.error("Caught fetch error:", err);
      }

      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  if (loading) return <p className="p-6">Loading employer dashboard...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Job Posts & Applicants</h1>

      {jobs.length === 0 && <p>You haven’t posted any jobs yet.</p>}

      {jobs.map((job) => (
        <div key={job.id} className="mb-8 border p-4 rounded-lg">
          <h2 className="text-xl font-semibold">{job.title}</h2>
          <p className="text-sm text-gray-600 mb-2">
            {job.company} — {job.location}
          </p>
          <p className="text-sm text-gray-500">
            👁️ {job.job_views?.length || 0} views • 📥{" "}
            {job.applications?.length || 0} applications
          </p>

          <p className="text-gray-800 font-medium mb-1">Applicants:</p>
          {job.applications && job.applications.length > 0 ? (
            <ul className="list-disc ml-5">
              {job.applications.map((app: any) => (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Link
                    href={`/dev/${app.user_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View {app.profiles?.name || "Applicant"}'s Profile
                  </Link>

                  {app.profiles?.resume_url && (
                    <a
                      href={app.profiles.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      📄 Resume
                    </a>
                  )}

                  {app.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded"
                        onClick={() => handleDecision(app.id, "accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded"
                        onClick={() => handleDecision(app.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {app.status !== "pending" && (
                    <p
                      className={`font-medium ${
                        app.status === "accepted"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      Status: {app.status}
                    </p>
                  )}
                </div>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No applicants yet.</p>
          )}
        </div>
      ))}
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

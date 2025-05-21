import { useEffect, useState } from "react";
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setJobs(data);
      else console.error(error);
    };

    fetchJobs();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Open Developer Jobs</h1>

      {jobs.length === 0 && <p>No jobs posted yet.</p>}

      <input
        type="text"
        placeholder="Search jobs by title, company, or tech stack..."
        className="border p-2 mb-6 w-full sm:w-1/2"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
        {jobs
          .filter((job) =>
            `${job.title} ${job.company} ${job.tech_stack}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
          .map((job) => (
            <Link href={`/job/${job.id}`} key={job.id}>
              <div className="border p-4 rounded-lg hover:shadow-md transition cursor-pointer">
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <p className="text-sm text-gray-500 mb-1">
                  {job.company} — {job.location}
                </p>
                <p className="mb-2 text-gray-700">
                  <strong>Tech Stack:</strong> {job.tech_stack}
                </p>
                <p className="text-sm text-gray-600">
                  {job.description.slice(0, 120)}...
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

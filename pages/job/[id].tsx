import { GetServerSideProps } from "next";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Job = {
  title: string;
  company: string;
  location: string;
  tech_stack: string;
  description: string;
  created_at: string;
};

export default function JobDetail({
  job,
  jobId,
}: {
  job: Job | null;
  jobId: string;
}) {
  if (!job) return <p className="p-6">Job not found.</p>;

  const [user, setUser] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);

        // Check if already applied
        const { data: apps } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("job_id", jobId);

        if (apps && apps.length > 0) setHasApplied(true);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  useEffect(() => {
    const logJobView = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const viewerId = authData.user?.id || null;

      await supabase
        .from("job_views")
        .insert([{ job_id: jobId, viewer_id: viewerId }]);
    };

    if (jobId) {
      logJobView();
    }
  }, [jobId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
      <p className="text-gray-600 mb-1">
        {job.company} — {job.location}
      </p>
      <p className="mb-4 text-sm text-gray-500">
        Posted on {new Date(job.created_at).toLocaleDateString()}
      </p>
      <p className="mb-4">
        <strong>Tech Stack:</strong> {job.tech_stack}
      </p>
      <p className="whitespace-pre-line">{job.description}</p>
      {!loading && user && !hasApplied && (
        <button
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={async () => {
            const { error } = await supabase
              .from("applications")
              .insert([{ user_id: user.id, job_id: jobId }]);
            if (error) alert(error.message);
            else {
              alert("Application submitted!");
              setHasApplied(true);
            }
          }}
        >
          Apply Now
        </button>
      )}

      {!loading && user && hasApplied && (
        <p className="mt-6 text-green-600 font-semibold">
          ✅ You already applied to this job
        </p>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  return {
    props: {
      job: data || null,
      jobId: id,
    },
  };
};

import { GetServerSideProps } from "next";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

type Profile = {
  name: string;
  location: string;
  tech_stack: string;
  github: string;
  portfolio: string;
  bio: string;
  avatar_url?: string;
  resume_url?: string;
};

export default function DevProfile({ profile }: { profile: Profile | null }) {
  if (!profile) {
    return <div className="p-4">Profile not found.</div>;
  }

  return (
    <>
      <div className="p-6 max-w-2xl mx-auto">
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={`${profile.name}'s avatar`}
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
        )}
        <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
        <p className="text-gray-600 mb-4">{profile.location}</p>
        <p className="mb-4">
          <strong>Tech Stack:</strong> {profile.tech_stack}
        </p>
        <p className="mb-4">
          <strong>GitHub:</strong>{" "}
          <a className="text-blue-600" href={profile.github} target="_blank">
            {profile.github}
          </a>
        </p>
        <p className="mb-4">
          <strong>Portfolio:</strong>{" "}
          <a className="text-blue-600" href={profile.portfolio} target="_blank">
            {profile.portfolio}
          </a>
        </p>
        <p className="mb-4">
          <strong>Bio:</strong>
          <br />
          {profile.bio}
        </p>
        {profile.resume_url && (
          <p className="mt-4">
            <a
              href={profile.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              📄 View Resume
            </a>
          </p>
        )}
      </div>
      <Link href="/developers">
        <button className="mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
          ← Back to Developer Directory
        </button>
      </Link>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", id)
    .single();

  return {
    props: {
      profile: data || null,
    },
  };
};

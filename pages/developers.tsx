import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";

type Profile = {
  user_id: string;
  name: string;
  tech_stack: string;
  avatar_url?: string;
};

export default function Developers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name, tech_stack, avatar_url");

      if (data) {
        setProfiles(data);

        // Extract unique tags
        const tagSet = new Set<string>();
        data.forEach((profile) => {
          profile.tech_stack
            .split(",")
            .forEach((tag) => tagSet.add(tag.trim()));
        });
        setAllTags(Array.from(tagSet));
      } else {
        console.error(error);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Developer Directory</h1>
      <input
        type="text"
        placeholder="Search by name or tech stack..."
        className="border p-2 mb-6 w-full sm:w-1/2"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag === selectedTag ? "" : tag)}
            className={`px-3 py-1 rounded-full text-sm border ${
              selectedTag === tag
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-800 border-gray-300"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles
          .filter((profile) => {
            const matchesSearch = `${profile.name} ${profile.tech_stack}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
            const matchesTag =
              selectedTag === "" ||
              profile.tech_stack
                .toLowerCase()
                .includes(selectedTag.toLowerCase());
            return matchesSearch && matchesTag;
          })
          .map((profile) => (
            <Link key={profile.user_id} href={`/dev/${profile.user_id}`}>
              <div className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition">
                {profile.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt={`${profile.name}'s avatar`}
                    className="w-20 h-20 rounded-full object-cover mb-2"
                  />
                )}
                <h2 className="text-xl font-semibold">{profile.name}</h2>
                <p className="text-sm text-gray-600">{profile.tech_stack}</p>
              </div>
            </Link>
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
    </div>
  );
}

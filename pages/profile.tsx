import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    tech_stack: "",
    github: "",
    portfolio: "",
    bio: "",
    resume_url: "",
    avatar_url: "",
  });

  const router = useRouter();

  useEffect(() => {
    const getUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      // Fetch existing profile data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setForm({
          name: profile.name || "",
          location: profile.location || "",
          tech_stack: profile.tech_stack || "",
          github: profile.github || "",
          portfolio: profile.portfolio || "",
          bio: profile.bio || "",
          resume_url: profile.resume_url || "",
          avatar_url: profile.avatar_url || "",
        });
        setLastUpdated(profile.updated_at);
      }

      setLoading(false);
    };

    getUserAndProfile();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      resume_url: form.resume_url,
      ...form,
    });
    if (error) alert(error.message);
    else alert("Profile saved!");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Upload error: " + uploadError.message);
      return;
    }

    const publicUrl = supabase.storage.from("avatars").getPublicUrl(filePath)
      .data.publicUrl;
    setForm((prev) => ({ ...prev, avatar_url: publicUrl }));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const filePath = `resumes/${user.id}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("dev-resumes")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Resume upload failed: " + uploadError.message);
      return;
    }

    const publicUrl = supabase.storage
      .from("dev-resumes")
      .getPublicUrl(filePath).data.publicUrl;
    setForm((prev) => ({ ...prev, resume_url: publicUrl }));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Your Developer Profile</h1>
      {lastUpdated && (
        <p className="text-sm text-gray-500 mb-4">
          Last updated: {new Date(lastUpdated).toLocaleDateString()} at{" "}
          {new Date(lastUpdated).toLocaleTimeString()}
        </p>
      )}

      {["name", "location", "tech_stack", "github", "portfolio"].map(
        (field) => (
          <input
            key={field}
            name={field}
            placeholder={field.replace("_", " ").toUpperCase()}
            className="border p-2 w-full mb-2"
            onChange={handleChange}
          />
        )
      )}

      <textarea
        name="bio"
        placeholder="Bio"
        className="border p-2 w-full mb-4"
        rows={4}
        onChange={handleChange}
      />

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Avatar</label>
        {form.avatar_url && (
          <img
            src={form.avatar_url}
            alt="Avatar Preview"
            className="w-20 h-20 rounded-full object-cover mb-2"
          />
        )}
        <input type="file" accept="image/*" onChange={handleAvatarUpload} />
      </div>
      <input
        type="file"
        accept=".pdf"
        className="mb-4"
        onChange={handleResumeUpload}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2"
        onClick={handleSubmit}
      >
        Save Profile
      </button>

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

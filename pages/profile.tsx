import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const [form, setForm] = useState<any>({
    // Developer fields
    name: "",
    location: "",
    tech_stack: "",
    github: "",
    portfolio: "",
    bio: "",
    resume_url: "",
    avatar_url: "",

    // Employer fields
    company: "",
    website: "",
    description: "",
  });

  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setRole(profile.role);
        setForm((prev: any) => ({ ...prev, ...profile }));
      }

      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    setForm((prev: any) => ({ ...prev, avatar_url: publicUrl }));
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
    setForm((prev: any) => ({ ...prev, resume_url: publicUrl }));
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      role,
      ...form,
    });

    if (error) alert(error.message);
    else alert("Profile saved!");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      {role === "developer" && (
        <>
          <h1 className="text-2xl font-bold mb-4">
            Create Your Developer Profile
          </h1>
          {["name", "location", "tech_stack", "github", "portfolio"].map(
            (field) => (
              <input
                key={field}
                name={field}
                value={form[field]}
                placeholder={field.replace("_", " ").toUpperCase()}
                className="border p-2 w-full mb-2"
                onChange={handleChange}
              />
            )
          )}
          <textarea
            name="bio"
            placeholder="Bio"
            value={form.bio}
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
          
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              Upload Resume (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              className="mb-2"
              onChange={handleResumeUpload}
            />

            {form.resume_url ? (
              <div className="mt-2 border p-2 rounded">
                <label className="block font-semibold mb-1">
                  Resume Preview
                </label>
                <iframe
                  src={form.resume_url}
                  width="100%"
                  height="500"
                  className="border rounded"
                />
                <a
                  href={form.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline mt-2 block"
                >
                  📄 Open in New Tab
                </a>
              </div>
            ) : (
              <p className="text-gray-500 italic mt-2">
                No resume uploaded yet.
              </p>
            )}
          </div>
        </>
      )}

      {role === "employer" && (
        <>
          <h1 className="text-2xl font-bold mb-4">Your Company Profile</h1>
          <input
            name="company"
            value={form.company}
            placeholder="Company Name"
            className="border p-2 w-full mb-2"
            onChange={handleChange}
          />
          <input
            name="website"
            value={form.website}
            placeholder="Company Website"
            className="border p-2 w-full mb-2"
            onChange={handleChange}
          />
          <textarea
            name="description"
            value={form.description}
            placeholder="Short company description"
            className="border p-2 w-full mb-4"
            rows={4}
            onChange={handleChange}
          />
        </>
      )}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
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

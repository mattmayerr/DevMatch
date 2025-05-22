import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function PostJob() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    location: "",
    tech_stack: "",
    description: "",
    qualifications: "",
    company: "",
    website: "",
  });

  // Removed invalid top-level await. Job insertion is handled in handleSubmit.

  const router = useRouter();

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("company, website, description")
        .eq("user_id", userId)
        .single();

      if (error || !profile) {
        alert("Unable to load company profile.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        company: profile.company,
        website: profile.website,
        description: profile.description,
      }));
    };

    fetchCompanyInfo();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      alert("User not authenticated.");
      return;
    }

    const { error } = await supabase.from("jobs").insert([
      {
        user_id: userId,
        title: form.title,
        location: form.location,
        tech_stack: form.tech_stack,
        description: form.description,
        qualifications: form.qualifications,
        company: form.company,
        website: form.website,
      },
    ]);

    if (error) {
      alert("Job submission failed: " + error.message);
    } else {
      alert("Job posted successfully!");
      // Optional: reset form or redirect
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Post a New Job</h1>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Position Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-2 w-full"
          placeholder="e.g., Junior Frontend Developer"
        />
      </div>

      {["title", "company", "location", "tech_stack"].map((field) => (
        <input
          name="company"
          value={form.company}
          readOnly
          className="border p-2 w-full mb-2 bg-gray-100 text-gray-600 cursor-not-allowed"
        />
      ))}

      <div className="mb-4">
        <label className="block font-semibold mb-1">Company</label>
        <input
          value={form.company}
          readOnly
          className="bg-gray-100 border p-2 w-full text-gray-600 cursor-not-allowed"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Website</label>
        <input
          value={form.website}
          readOnly
          className="bg-gray-100 border p-2 w-full text-gray-600 cursor-not-allowed"
        />
      </div>

      <textarea
        name="description"
        placeholder="Job Description"
        className="border p-2 w-full mb-4"
        rows={4}
        onChange={handleChange}
      />

      <div className="mb-4">
        <label className="block font-semibold mb-1">
          Required Qualifications
        </label>
        <textarea
          name="qualifications"
          value={form.qualifications}
          onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
          className="border p-2 w-full"
          rows={4}
          placeholder="List required skills, experience, or certifications..."
        />
      </div>

      <button
        className="bg-green-600 text-white px-4 py-2"
        onClick={handleSubmit}
      >
        Submit Job
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

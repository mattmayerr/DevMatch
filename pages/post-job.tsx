import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function PostJob() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    tech_stack: "",
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
      } else {
        setUser(user);
      }
    };

    getUser();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from("jobs").insert([
      {
        user_id: user.id,
        ...form,
      },
    ]);
    if (error) {
      alert(error.message);
    } else {
      alert("Job posted!");
      router.push("/jobs"); // change if you want to go somewhere else
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Post a New Job</h1>

      {["title", "company", "location", "tech_stack"].map((field) => (
        <input
          key={field}
          name={field}
          placeholder={field.replace("_", " ").toUpperCase()}
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        />
      ))}

      <textarea
        name="description"
        placeholder="Job Description"
        className="border p-2 w-full mb-4"
        rows={4}
        onChange={handleChange}
      />

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

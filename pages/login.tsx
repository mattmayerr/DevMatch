import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("developer");

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      // Fetch the user's profile to get their role
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (userId) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", userId)
          .single();

        if (profileError || !profile) {
          alert("Could not determine role");
        } else {
          const role = profile.role;
          if (role === "employer") {
            window.location.href = "/employer-dashboard";
          } else {
            window.location.href = "/dashboard";
          }
        }
      }
    }
  };

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      // Save role to profile
      const userId = data.user?.id;
      if (userId) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          user_id: userId,
          email: email,
          role: role,
        });
        if (profileError) {
          alert("Error saving role: " + profileError.message);
        } else {
          alert("Signed up!");
        }
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Login / Sign Up</h1>
      <input
        className="border p-2 w-full mb-2"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-2"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <select
        className="border p-2 w-full mb-2"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="developer">Developer</option>
        <option value="employer">Employer</option>
      </select>
      <button
        className="bg-blue-500 text-white px-4 py-2 mr-2"
        onClick={handleLogin}
      >
        Login
      </button>
      <button
        className="bg-green-500 text-white px-4 py-2"
        onClick={handleSignUp}
      >
        Sign Up
      </button>
    </div>
  );
}

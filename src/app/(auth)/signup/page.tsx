"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [ageConfirmed, setAgeConfirmed] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          gender,
          password,
        }),
      });
  
      // const data = await res.json();
      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null; // response had no body
      }
  
      if (!res.ok) {
        setError(data?.error || "Signup failed");
        return;
      }
  
      // Auto login after successful signup
      const login = await signIn("credentials", {
        phone,
        password,
        redirect: false,
      });
  
      if (login?.error) {
        setError("Account created, but login failed");
        return;
      }
  
      router.push("/chat");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b1020] via-[#0d1326] to-black px-4">
      {!ageConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b1020] p-6 text-center shadow-2xl">
            <h2 className="mb-3 text-xl font-semibold text-white">
              Age Restriction
            </h2>

            <p className="mb-6 text-sm text-gray-300">
              This platform is intended for users who are <span className="text-white font-medium">18 years or older</span>.
              Please confirm your age to continue.
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => setAgeConfirmed(true)}
                className="w-1/2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                I am 18+
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl"
      >
        <h1 className="mb-6 text-center text-2xl font-semibold text-white">
          Create Account
        </h1>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* First Name */}
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          required
          className="mb-4 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500"
        />

        {/* Last Name */}
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last name"
          required
          className="mb-4 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500"
        />

        {/* Phone (numbers only) */}
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) {
              setPhone(e.target.value);
            }
          }}
          placeholder="Phone number"
          required
          inputMode="numeric"
          className="mb-4 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500"
        />

        {/* Gender */}
        <div className="mb-4 w-full">
          {/* <p className="mb-2 text-sm text-gray-300">Gender</p> */}

          <div className="flex gap-6 w-full mx-auto">
            <label className="flex cursor-pointer items-center gap-2 text-white">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === "male"}
                onChange={(e) => setGender(e.target.value)}
                required
                className="h-4 w-4 accent-indigo-500"
              />
              Male
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-white">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === "female"}
                onChange={(e) => setGender(e.target.value)}
                className="h-4 w-4 accent-indigo-500"
              />
              Female
            </label>
          </div>
        </div>


        {/* Password */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="mb-6 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="cursor-pointer text-indigo-400 hover:text-indigo-300"
          >
            Sign in
          </span>
        </p>
      </form>
    </div>
  );
};

export default Page;

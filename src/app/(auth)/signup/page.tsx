"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [DOB, setDOB] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [ageConfirmed, setAgeConfirmed] = useState(false);

  function calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Age validation
    if (!DOB) {
      setError("Please enter your date of birth.");
      setLoading(false);
      return;
    }

    const age = calculateAge(DOB);

    if (age < 18) {
      setError("You must be at least 18 years old to create an account.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          password,
          age, // ✅ send age as number
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch { }

      if (!res.ok) {
        setError(data?.error || "Signup failed");
        return;
      }

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
        <input
          type="date"
          value={DOB}
          onChange={(e) => setDOB(e.target.value)}
          required
          max={new Date(
            new Date().setFullYear(new Date().getFullYear() - 18)
          ).toISOString().split("T")[0]}
          className="
            mb-4 w-full rounded-lg
            border border-white/10
            bg-black/30
            px-4 py-2
            text-white
            focus:ring-1 focus:ring-indigo-500
            [color-scheme:dark]
          "
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

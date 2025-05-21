import Link from 'next/link'
import { Typewriter } from 'react-simple-typewriter'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Build Your Tech Career. Hire the Right Dev.
        </h1>
        <p className="text-lg text-slate-300 mb-6">
          A job board built for modern developers and forward-thinking teams.
        </p>

        {/* Animated code snippet */}
        <pre className="text-left text-green-400 font-mono bg-slate-900 p-4 rounded-md shadow-lg mb-8 text-sm sm:text-base">
          <Typewriter
            words={[
              "const job = await supabase.from(\"jobs\").select(\"*\");",
              "const devs = await supabase.from(\"profiles\").select(\"*\");",
              "postJob({ title: 'Frontend Engineer', tech_stack: 'React, Tailwind' });"
            ]}
            loop={true}
            cursor
            cursorStyle="|"
            typeSpeed={50}
            deleteSpeed={30}
            delaySpeed={2000}
          />
        </pre>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/login">
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-semibold">
              Sign Up / Log In
            </button>
          </Link>
          <Link href="/jobs">
            <button className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg text-white font-semibold">
              Browse Jobs
            </button>
          </Link>
          <Link href="/developers">
            <button className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg text-white font-semibold">
              Find Developers
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
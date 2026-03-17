export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Welcome Card */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gradient mb-4">Welcome!</h2>
        <p className="text-slate-600 mb-6">
          Create and take AI-powered quizzes on any topic. Perfect for learning
          and skill assessment.
        </p>
        <button className="btn-primary w-full">
          Start New Quiz
        </button>
      </div>

      {/* Features Card */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gradient mb-4">Features</h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-center gap-2">
            <span className="text-success text-xl">✓</span>
            AI-generated questions
          </li>
          <li className="flex items-center gap-2">
            <span className="text-success text-xl">✓</span>
            Real-time feedback
          </li>
          <li className="flex items-center gap-2">
            <span className="text-success text-xl">✓</span>
            Detailed results
          </li>
          <li className="flex items-center gap-2">
            <span className="text-success text-xl">✓</span>
            Progress tracking
          </li>
        </ul>
      </div>
    </div>
  )
}

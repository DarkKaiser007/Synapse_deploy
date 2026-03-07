import { Link } from 'react-router-dom'
import { Brain, BookOpen, Mic, Camera, BarChart3, Timer, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'

function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Brain className="h-10 w-10 text-[var(--color-primary)]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SYNAPSE
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-300 hover:text-white transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/5"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-[var(--color-primary)] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
              <Sparkles className="h-4 w-4 text-[var(--color-primary)] mr-2" />
              <span className="text-sm text-gray-300">The Future of Learning</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                Cognitive
              </span>
              <br />
              <span className="bg-gradient-to-r from-[var(--color-primary)] via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Operating System
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your learning with AI-powered note ingestion, adaptive study planning,
              and intelligent quiz generation. Study smarter, not harder.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              to="/register"
              className="group bg-[var(--color-primary)] hover:bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105 flex items-center justify-center min-w-[200px]"
            >
              Start Learning Today
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="group border border-white/20 hover:border-white/30 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200 backdrop-blur-sm bg-white/5 hover:bg-white/10 flex items-center justify-center min-w-[200px]">
              <Zap className="mr-2 h-5 w-5" />
              Watch Demo
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-[var(--color-primary)]" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-purple-400" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything you need to
              <span className="block bg-gradient-to-r from-[var(--color-primary)] to-purple-400 bg-clip-text text-transparent">
                excel in your studies
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed by students, for students
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)] to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-[var(--color-primary)]/20 rounded-xl mr-4">
                    <Camera className="h-8 w-8 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Multimodal Notes</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Upload handwritten notes, record audio explanations, or type directly.
                  Our AI extracts and organizes your content automatically.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-xl mr-4">
                    <Brain className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">AI Concept Engine</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Get instant explanations, summaries, and custom quizzes generated
                  from your notes using Google Gemini AI.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-green-500/20 rounded-xl mr-4">
                    <BookOpen className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Adaptive Planning</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Personalized study schedules that adapt based on your performance
                  and exam dates. Never cram again.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-orange-500/20 rounded-xl mr-4">
                    <Timer className="h-8 w-8 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Pomodoro Timer</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Built-in focus timer with session tracking and productivity analytics.
                  Stay focused and motivated.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-cyan-500/20 rounded-xl mr-4">
                    <BarChart3 className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Performance Dashboard</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Track your progress with detailed analytics, weak area identification,
                  and study time insights.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-indigo-500/20 rounded-xl mr-4">
                    <Mic className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Multilingual Support</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Learn in your preferred language with Azure-powered translation
                  and text-to-speech capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[var(--color-primary)]/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-12 backdrop-blur-xl border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your learning?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already studying smarter with SYNAPSE.
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-[var(--color-primary)] hover:bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105 inline-flex items-center justify-center"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <span className="text-gray-400 text-sm self-center">No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Brain className="h-8 w-8 text-[var(--color-primary)]" />
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SYNAPSE
            </span>
          </div>
          <p className="text-gray-500 mb-4">
            © 2026 SYNAPSE. The Cognitive Operating System for Students.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
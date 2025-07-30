import React, { useState } from 'react';
import {
  Mic,
  Zap,
  Brain,
  Globe,
  Shield,
  Users,
  GraduationCap,
  Briefcase,
  Play,
  PenTool,
  Check,
  Star,
  Menu,
  X,
  Clock,
  FileText,
  Search,
  Share2,
  Download,
  Award,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react';
import Masonry from 'react-masonry-css';

const FAQItem: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="border border-gray-200 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      <div
        className={`overflow-hidden ${isOpen ? 'h-auto' : 'h-0'}`}
      >
        <div className="px-6 pb-4 text-gray-600 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div
                className="flex items-center space-x-2"
              >
                <Mic className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold text-gray-900">Talkflo</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors duration-200">Features</a>
              <a href="#use-cases" className="text-gray-600 hover:text-primary transition-colors duration-200">Use Cases</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors duration-200">Pricing</a>
              <a
                href="/signin"
                className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
              >
                Get Started
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-primary transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div
              className="md:hidden py-4 border-t border-gray-200"
            >
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-primary transition-colors duration-200">Features</a>
                <a href="#use-cases" className="text-gray-600 hover:text-primary transition-colors duration-200">Use Cases</a>
                <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors duration-200">Pricing</a>
                <a href="/signin" className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 text-left">
                  Get Started
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-orange-50 px-4 sm:px-6 lg:px-8 pt-16">
        <div className="max-w-5xl mx-auto text-center">
          <div
            className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Award className="w-4 h-4" />
            <span>Trusted by 10,000+ professionals worldwide</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
          >
            Transform Your Voice Into
            <span className="text-primary block">Powerful Notes</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Stop typing. Start talking. Talkflo's AI instantly converts your voice into organized, searchable notes that you can share, edit, and act on immediately.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <a
              href="/signin"
              className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording for Free</span>
            </a>


          </div>


        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute top-1/4 left-10 opacity-20">
          <div
            className="w-16 h-16 bg-primary/20 rounded-full"
          />
        </div>
        <div className="absolute bottom-1/4 right-10 opacity-20">
          <div
            className="w-12 h-12 bg-orange-300/30 rounded-full"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-white text-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-12"
          >
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-100 p-8 rounded-2xl">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Mic className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Record</h3>
                <p className="text-gray-600">Simply press record and speak naturally. No scripts, no preparation needed.</p>
              </div>
            </div>
            <div className="bg-gray-100 p-8 rounded-2xl">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Transcribe</h3>
                <p className="text-gray-600">Our advanced AI instantly converts your speech to text with perfect accuracy.</p>
              </div>
            </div>
            <div className="bg-gray-100 p-8 rounded-2xl">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Summarize</h3>
                <p className="text-gray-600">Receive clean, structured notes ready to share, edit, or act upon immediately.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10,000+", label: "Active Users" },
              { number: "500K+", label: "Notes Created" },
              { number: "99.9%", label: "Accuracy Rate" },
              { number: "50+", label: "Languages" }
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Talkflo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Talkflo?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of note-taking with AI-powered voice transcription that understands context and delivers results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Save 5+ Hours Weekly",
                description: "Stop typing and start talking. Our users save an average of 5 hours per week on note-taking.",
                metric: "5x faster than typing"
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "AI-Powered Intelligence",
                description: "Advanced AI doesn't just transcribe—it understands context, extracts key points, and organizes your thoughts.",
                metric: "99.9% accuracy rate"
              },
              {
                icon: <Search className="w-8 h-8" />,
                title: "Instant Search & Recall",
                description: "Find any note, idea, or conversation instantly with our powerful search that understands meaning, not just keywords.",
                metric: "Search 1000s of notes in <1s"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                <div className="text-primary mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>
                <div className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                  {item.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Capture Ideas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From voice recording to organized notes, Talkflo provides all the tools you need to never lose a thought again.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Mic className="w-8 h-8" />,
                title: "Voice Recording",
                desc: "High-quality audio capture with noise cancellation",
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Instant Transcription",
                desc: "Real-time speech-to-text with 99.9% accuracy",
                color: "bg-yellow-50 text-yellow-600"
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "AI Summarization",
                desc: "Automatically extract key points and insights",
                color: "bg-purple-50 text-purple-600"
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: "Smart Organization",
                desc: "Auto-categorize and tag your notes intelligently",
                color: "bg-green-50 text-green-600"
              },
              {
                icon: <Search className="w-8 h-8" />,
                title: "Powerful Search",
                desc: "Find any note instantly with semantic search",
                color: "bg-red-50 text-red-600"
              },
              {
                icon: <Share2 className="w-8 h-8" />,
                title: "Easy Sharing",
                desc: "Share notes with teams or publish publicly",
                color: "bg-indigo-50 text-indigo-600"
              },
              {
                icon: <Download className="w-8 h-8" />,
                title: "Export Options",
                desc: "Download as PDF, Word, or plain text",
                color: "bg-pink-50 text-pink-600"
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "50+ Languages",
                desc: "Transcribe and translate in multiple languages",
                color: "bg-teal-50 text-teal-600"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Enterprise Security",
                desc: "Bank-level encryption and privacy protection",
                color: "bg-gray-50 text-gray-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12"
          >
            Who It's For
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Briefcase className="w-8 h-8" />,
                title: "Entrepreneurs & Founders",
                description: "Capture business ideas on the go"
              },
              {
                icon: <PenTool className="w-8 h-8" />,
                title: "Writers & Creators",
                description: "Turn spoken thoughts into written content"
              },
              {
                icon: <GraduationCap className="w-8 h-8" />,
                title: "Students & Researchers",
                description: "Record lectures and research notes"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Teams & Podcasters",
                description: "Transcribe meetings and interviews"
              }
            ].map((useCase, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 text-center"
              >
                <div className="text-primary mb-4 flex justify-center">{useCase.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4"
          >
            Simple, Transparent Pricing
          </h2>

          <p
            className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
          >
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                description: "Perfect for trying out Talkflo",
                features: [
                  "5 recordings per month",
                  "Basic transcription",
                  "Simple notes",
                  "Email support"
                ],
                cta: "Get Started Free",
                popular: false
              },
              {
                name: "Pro",
                price: "$9",
                period: "per month",
                description: "For individuals and professionals",
                features: [
                  "Unlimited recordings",
                  "AI-powered summaries",
                  "Advanced organization",
                  "Priority support",
                  "Export to all formats",
                  "Custom templates"
                ],
                cta: "Start Free Trial",
                popular: false
              },
              {
                name: "Annual",
                price: "$80",
                period: "per user/year",
                description: "For teams and organizations",
                features: [
                  "Everything in Pro",
                  "Team collaboration",
                  "Admin dashboard",
                  "SSO integration",
                  "Advanced analytics",
                  "Dedicated support"
                ],
                cta: "Contact Sales",
                popular: true
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${plan.popular ? 'ring-2 ring-primary scale-105' : 'border border-gray-200'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.name === 'Team' ? '#contact' : '/signin'}
                  className={`inline-block w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 text-center ${plan.popular
                    ? 'bg-primary hover:bg-primary-hover text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Professionals Worldwide
            </h2>
            <p className="text-xl text-gray-600 mb-8">Join thousands who've transformed their note-taking workflow</p>
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-7 h-7 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-2xl font-bold text-gray-900">4.9/5 from 2,000+ reviews</p>
          </div>

          <Masonry
            breakpointCols={{
              default: 4,
              1100: 3,
              700: 2,
              500: 1
            }}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {[
              {
                name: 'Sarah Chen',
                title: 'Product Manager at TechCorp',
                rating: 5,
                quote: 'Talkflo has completely transformed how I capture and organize my thoughts. The AI summaries are incredibly accurate and save me hours every week. This is the future of note-taking.',
                avatar: 'https://i.pravatar.cc/150?u=sarahchen',
              },
              {
                name: 'Marcus Rodriguez',
                handle: '@marcusbuilds',
                rating: 5,
                quote: "Game-changer for content creators! I can now capture ideas while walking, driving, or anywhere inspiration strikes. Talkflo turns my scattered thoughts into polished notes instantly. Absolutely brilliant!",
                avatar: 'https://i.pravatar.cc/150?u=marcusrodriguez',
              },
              {
                name: 'Dr. Emily Watson',
                title: 'Research Scientist',
                rating: 5,
                quote: "As someone who conducts interviews and field research, Talkflo is invaluable. The transcription accuracy is phenomenal, and the AI organization helps me identify patterns I might have missed. Essential tool for any researcher.",
                avatar: 'https://i.pravatar.cc/150?u=emilywatson',
              },
              {
                name: 'James Park',
                handle: '@jamesparkceo',
                rating: 5,
                quote: 'Talkflo has revolutionized my meeting workflow. I can focus entirely on the conversation while knowing every important detail is being captured and organized. The search functionality is incredibly powerful.',
                avatar: 'https://i.pravatar.cc/150?u=jamespark',
              },
              {
                name: 'Lisa Thompson',
                title: 'Freelance Writer',
                rating: 5,
                quote: "Writing has never been easier! I speak my first drafts into Talkflo and get back structured, coherent text that's ready for editing. It's like having a writing assistant that never sleeps.",
                avatar: 'https://i.pravatar.cc/150?u=lisathompson',
              },
              {
                name: 'David Kim',
                title: 'Accessibility Advocate',
                rating: 0,
                quote: "As someone with dyslexia, Talkflo has been life-changing. I can finally capture my ideas without the struggle of typing. The voice-to-text accuracy is outstanding, and the AI makes my thoughts clearer than I could write them myself.",
                avatar: 'https://i.pravatar.cc/150?u=davidkim',
              },
              {
                name: 'Rachel Green',
                title: 'Startup Founder',
                rating: 5,
                quote: 'Talkflo is my secret weapon for capturing business ideas on the go. Whether I\'m in the shower, on a run, or stuck in traffic, I never lose a valuable thought. The organization features help me turn ideas into actionable plans.',
                avatar: 'https://i.pravatar.cc/150?u=rachelgreen',
              },
              {
                name: 'Professor Michael Brown',
                title: 'University Lecturer',
                rating: 5,
                quote: "My students love that I can provide them with accurate transcripts of lectures within minutes. Talkflo has made my teaching more accessible and helped students who struggle with traditional note-taking methods.",
                avatar: 'https://i.pravatar.cc/150?u=michaelbrown',
              },
              {
                name: 'Anna Kowalski',
                title: 'Journalist',
                rating: 5,
                quote: "Talkflo has transformed my interview process. I can maintain eye contact and build rapport while knowing every quote is being captured perfectly. The AI summaries help me identify the key story angles immediately.",
                avatar: 'https://i.pravatar.cc/150?u=annakowalski',
              },
              {
                name: 'Tom Wilson',
                handle: '@tomwilsontech',
                rating: 0,
                quote: "The multilingual support is incredible! I work with international teams and Talkflo seamlessly handles conversations in multiple languages. It's like having a universal translator and note-taker in one.",
                avatar: 'https://i.pravatar.cc/150?u=tomwilson',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.handle || testimonial.title}</p>
                    </div>
                  </div>
                </div>
                {testimonial.rating > 0 && (
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                )}
                <p className="text-gray-700 leading-relaxed">{testimonial.quote}</p>
              </div>
            ))}
          </Masonry>

          {/* Company Logos */}
          <div
            className="text-center mt-16"
          >
            <p className="text-gray-500 mb-8">Trusted by teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60">
              {['Google', 'Microsoft', 'Apple', 'Meta', 'Netflix', 'Spotify'].map((company, index) => (
                <div key={index} className="text-2xl font-bold text-gray-400">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Talkflo
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How accurate is the transcription?",
                answer: "Talkflo achieves 99.9% accuracy in optimal conditions. Our AI is trained on diverse accents and speaking styles, and continuously improves with use. For noisy environments, we recommend using a quality microphone."
              },
              {
                question: "What languages are supported?",
                answer: "We support 50+ languages including English, Spanish, French, German, Chinese, Japanese, and many more. The AI can also translate your notes between languages automatically."
              },
              {
                question: "Is my data secure and private?",
                answer: "Absolutely. We use bank-level encryption (AES-256) for all data. Your recordings and notes are encrypted both in transit and at rest. We never share your data with third parties, and you can delete your account and all data at any time."
              },
              {
                question: "Can I use Talkflo offline?",
                answer: "Currently, Talkflo requires an internet connection for AI processing and transcription. However, you can record audio offline, and it will be processed once you're back online."
              },
              {
                question: "How does the free trial work?",
                answer: "Your 7-day free trial includes full access to all Pro features with no limitations. No credit card required to start. You can cancel anytime during the trial with no charges."
              },
              {
                question: "Can I export my notes?",
                answer: "Yes! You can export your notes in multiple formats including PDF, Word, plain text, and Markdown. You can also share notes via public links or integrate with tools like Notion, Google Docs, and more."
              },
              {
                question: "What's the difference between plans?",
                answer: "The Free plan includes 5 recordings per month with basic transcription. Pro offers unlimited recordings, AI summaries, advanced organization, and priority support. Team adds collaboration features and admin controls."
              },
              {
                question: "Do you offer refunds?",
                answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with Talkflo for any reason, contact our support team for a full refund."
              }
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>



      {/* Final CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-6"
          >
            Get Started—Risk Free
          </h2>

          <a
            href="/signin"
            className="inline-block bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
          >
            Start Your 7-Day Free Trial
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Mic className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold">Talkflo</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Transform your voice into powerful, organized notes with AI-powered transcription and intelligent summarization.
              </p>
              <div className="flex space-x-4">
                <a href="mailto:hello@talkflo.com" className="flex items-center space-x-2 text-gray-400 hover:text-primary transition-colors duration-200">
                  <Mail className="w-4 h-4" />
                  <span>hello@talkflo.com</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <nav className="space-y-3">
                <a href="#features" className="block text-gray-400 hover:text-primary transition-colors duration-200">Features</a>
                <a href="#pricing" className="block text-gray-400 hover:text-primary transition-colors duration-200">Pricing</a>
                <a href="#use-cases" className="block text-gray-400 hover:text-primary transition-colors duration-200">Use Cases</a>
                <a href="/signin" className="block text-gray-400 hover:text-primary transition-colors duration-200">Get Started</a>
              </nav>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <nav className="space-y-3">
                <a href="#about" className="block text-gray-400 hover:text-primary transition-colors duration-200">About</a>
                <a href="#blog" className="block text-gray-400 hover:text-primary transition-colors duration-200">Blog</a>
                <a href="#careers" className="block text-gray-400 hover:text-primary transition-colors duration-200">Careers</a>
                <a href="#contact" className="block text-gray-400 hover:text-primary transition-colors duration-200">Contact</a>
              </nav>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap gap-6 mb-4 md:mb-0">
              <a href="#privacy" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Privacy Policy</a>
              <a href="#terms" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Terms of Service</a>
              <a href="#security" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Security</a>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 Talkflo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

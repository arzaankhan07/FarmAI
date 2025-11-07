import { useState } from 'react';
import { 
  Sprout, 
  TrendingUp, 
  Droplets, 
  Sun, 
  BarChart3, 
  Brain,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  Sparkles
} from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Animated Section Component
function AnimatedSection({ 
  children, 
  delay = 0,
  direction = 'up'
}: { 
  children: React.ReactNode; 
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const { ref, isVisible } = useScrollAnimation();

  const directionClasses = {
    up: 'translate-y-10',
    down: '-translate-y-10',
    left: 'translate-x-10',
    right: '-translate-x-10',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 translate-x-0'
          : `opacity-0 ${directionClasses[direction]}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning algorithms analyze soil data to predict optimal crops and yields',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Droplets,
      title: 'Smart Fertilizer Recommendations',
      description: 'Get personalized fertilizer suggestions based on your soil composition and crop needs',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      title: 'Yield Forecasting',
      description: 'Accurate yield predictions help you plan better and maximize your harvest potential',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Data Analytics',
      description: 'Track your farming history and analyze trends to make informed decisions',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const benefits = [
    'Increase crop yield by up to 30%',
    'Reduce fertilizer costs with precise recommendations',
    'Make data-driven farming decisions',
    'Track and analyze your farming history',
    'Get real-time soil analysis',
    'Access AI-powered crop predictions',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl delay-2000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Sprout className="w-10 h-10 text-green-400 animate-pulse" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-spin" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              FarmAI
            </span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/50 flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20 mt-10">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection delay={0}>
            <div className="inline-block mb-6 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/30">
              <span className="text-green-400 text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI-Powered Precision Farming
              </span>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={100}>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent animate-gradient">
                Revolutionize
              </span>
              <br />
              Your Farming
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                with AI
              </span>
            </h1>
          </AnimatedSection>
          
          <AnimatedSection delay={200}>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Make smarter farming decisions with our AI-powered platform. 
              Get crop recommendations, fertilizer suggestions, and yield predictions 
              based on real-time soil analysis.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-110 shadow-2xl shadow-green-500/50 flex items-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                Watch Demo
              </button>
            </div>
          </AnimatedSection>

          {/* Stats */}
          <AnimatedSection delay={400}>
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">30%</div>
                <div className="text-gray-400">Yield Increase</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
                <div className="text-gray-400">Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">95%</div>
                <div className="text-gray-400">Accuracy</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-20 mt-20">
        <AnimatedSection delay={0}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features for
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> Modern Farmers</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to optimize your farming operations
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedSection key={index} delay={index * 100} direction={index % 2 === 0 ? 'left' : 'right'}>
                <div
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`relative p-8 rounded-2xl bg-gradient-to-br ${feature.color} transition-all duration-500 transform ${
                    hoveredFeature === index ? 'scale-105 shadow-2xl' : 'scale-100'
                  }`}
                >
                  <div className="absolute inset-0 bg-black/20 rounded-2xl backdrop-blur-sm" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-200 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 container mx-auto px-6 py-20 mt-20">
        <AnimatedSection delay={0}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Works</span>
            </h2>
          </div>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Input Soil Data', desc: 'Enter your soil parameters including N, P, K, pH, temperature, and rainfall' },
              { step: '2', title: 'AI Analysis', desc: 'Our AI analyzes your data and generates personalized recommendations' },
              { step: '3', title: 'Get Results', desc: 'Receive crop recommendations, fertilizer suggestions, and yield predictions' },
            ].map((item, index) => (
              <AnimatedSection key={index} delay={index * 150}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-3xl font-bold mb-6 mx-auto shadow-lg shadow-green-500/50">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 container mx-auto px-6 py-20 mt-20">
        <AnimatedSection delay={0}>
          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl font-bold mb-8 text-center">
              Why Choose <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">FarmAI</span>?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <AnimatedSection key={index} delay={index * 50}>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-lg">{benefit}</span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-20 mt-20">
        <AnimatedSection delay={0}>
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-3xl p-16 border border-green-500/30">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of farmers who are already using AI to maximize their yields
            </p>
            <button
              onClick={onGetStarted}
              className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-110 shadow-2xl shadow-green-500/50 flex items-center gap-3 mx-auto group"
            >
              Get Started Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-12 mt-20 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Sprout className="w-8 h-8 text-green-400" />
            <span className="text-xl font-bold">FarmAI</span>
          </div>
          <div className="flex items-center gap-6 text-gray-400">
            <Shield className="w-5 h-5" />
            <Globe className="w-5 h-5" />
            <span>© 2024 FarmAI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


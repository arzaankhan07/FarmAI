import { useState } from 'react';
import { 
  Sprout, 
  TrendingUp, 
  Droplets, 
  BarChart3, 
  Brain,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  ChevronDown
} from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Interactive3DBackground } from './Interactive3DBackground';

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

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* 3D Interactive Background */}
      <Interactive3DBackground />

      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sprout className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-bold text-gray-900">
                FarmAI
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatedSection delay={0}>
            <div className="inline-block mb-6 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="text-emerald-700 text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI-Powered Precision Farming
              </span>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={100}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-gray-900">
              Revolutionize Your Farming
              <br />
              <span className="text-emerald-600">with AI Technology</span>
            </h1>
          </AnimatedSection>
          
          <AnimatedSection delay={200}>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Make smarter farming decisions with our AI-powered platform. 
              Get crop recommendations, fertilizer suggestions, and yield predictions 
              based on real-time soil analysis and weather data.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={scrollToFeatures}
                className="px-8 py-3.5 bg-white border-2 border-gray-300 hover:border-emerald-600 text-gray-700 hover:text-emerald-600 rounded-lg font-semibold text-base transition-all duration-200 flex items-center gap-2"
              >
                Learn More
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </AnimatedSection>

          {/* Stats */}
          <AnimatedSection delay={400}>
            <div className="grid grid-cols-3 gap-8 mt-16 md:mt-24 max-w-2xl mx-auto pt-12 border-t border-gray-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">30%</div>
                <div className="text-gray-600 text-sm">Yield Increase</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600 text-sm">Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">95%</div>
                <div className="text-gray-600 text-sm">Accuracy</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="relative z-10 bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <AnimatedSection delay={0}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Powerful Features for
                <span className="text-emerald-600"> Modern Farmers</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to optimize your farming operations
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <AnimatedSection key={index} delay={index * 100} direction={index % 2 === 0 ? 'left' : 'right'}>
                  <div
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    className={`bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 ${
                      hoveredFeature === index ? 'border-emerald-300 shadow-md' : ''
                    }`}
                  >
                    <div className="w-14 h-14 bg-emerald-50 rounded-lg flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <AnimatedSection delay={0}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              How It <span className="text-emerald-600">Works</span>
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
                  <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto shadow-md">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <AnimatedSection delay={0}>
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-12 border border-gray-200 shadow-sm">
              <h2 className="text-4xl font-bold mb-8 text-center text-gray-900">
                Why Choose <span className="text-emerald-600">FarmAI</span>?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <AnimatedSection key={index} delay={index * 50}>
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 text-base">{benefit}</span>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <AnimatedSection delay={0}>
          <div className="max-w-4xl mx-auto text-center bg-emerald-600 rounded-2xl p-12 md:p-16 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-lg text-emerald-50 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers who are already using AI to maximize their yields
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white text-emerald-600 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg flex items-center gap-3 mx-auto"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Sprout className="w-8 h-8 text-emerald-500" />
              <span className="text-xl font-bold text-white">FarmAI</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <Shield className="w-5 h-5" />
              <Globe className="w-5 h-5" />
              <span>© 2024 FarmAI. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState({
    features: false,
    stats: false
  })

  // Sample stats data
  const stats = [
    { number: '500+', label: 'Equipment Items' },
    { number: '1,200+', label: 'Happy Customers' },
    { number: '50+', label: 'Cities Covered' },
    { number: '24/7', label: 'Support Available' }
  ]

  // Features data
  const features = [
    {
      icon: '🚀',
      title: 'Quick Booking',
      description: 'Book equipment instantly with our streamlined process',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: '📱',
      title: 'Real-time Tracking',
      description: 'Track your equipment status and location in real-time',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: '🛡️',
      title: 'Insured Equipment',
      description: 'All equipment comes with comprehensive insurance coverage',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: '⚡',
      title: 'Fast Delivery',
      description: 'Same-day delivery available for urgent requirements',
      color: 'from-orange-400 to-orange-600'
    }
  ]

  // Testimonials data
  const testimonials = [
    {
      name: 'John Smith',
      role: 'Construction Manager at BuildCorp',
      content: 'Reservelt has transformed how we handle equipment rentals. The platform is intuitive and the equipment quality is outstanding.',
      avatar: '👨‍💼',
      rating: 5
    },
    {
      name: 'Sarah Johnson',
      role: 'Project Director at InfraTech',
      content: 'Exceptional service and reliability. We\'ve been using Reservelt for 2 years and have never been disappointed.',
      avatar: '👩‍💼',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Operations Lead at PowerBuild',
      content: 'The real-time tracking and quick booking features have saved us countless hours. Highly recommended!',
      avatar: '👨‍🔧',
      rating: 5
    }
  ]

  // Auto-slide testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            setIsVisible(prev => ({ ...prev, [id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('[id]')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-purple-50 via-beige-50 to-navy-50 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 left-20 w-72 h-72 bg-beige-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-navy-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-midnight-800 via-navy-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                  Premium Equipment
                  <span className="block">Rental Solutions</span>
                </h1>
                <p className="text-xl text-navy-600 leading-relaxed">
                  Experience the most comprehensive equipment rental platform with premium machinery, 
                  professional service, and nationwide coverage for all your project needs.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <SignedOut>
                  <Link
                    to="/sign-up"
                    className="bg-gradient-to-r from-purple-500 to-navy-600 text-white px-8 py-4 rounded-full hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 group"
                  >
                    <span>Get Started Today</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    to="/dashboard"
                    className="bg-gradient-to-r from-purple-500 to-navy-600 text-white px-8 py-4 rounded-full hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 group"
                  >
                    <span>Go to Dashboard</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </SignedIn>
                <button className="border-2 border-purple-300 text-navy-700 px-8 py-4 rounded-full hover:bg-purple-50 transition-all duration-300 font-semibold text-lg">
                  View Catalog
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-navy-600 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200 overflow-hidden">
                <div className="p-8">
                  <div className="bg-gradient-to-br from-purple-500 to-navy-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">Equipment Dashboard</h3>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span>Available Equipment</span>
                          <span className="font-bold">485</span>
                        </div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span>Active Rentals</span>
                          <span className="font-bold">142</span>
                        </div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span>Revenue Today</span>
                          <span className="font-bold">₹12,450</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">🏗️</span>
                      </div>
                      <div>
                        <div className="font-semibold text-navy-700">Excavator CAT 320</div>
                        <div className="text-sm text-navy-500">Available • ₹1,200/day</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-beige-50 rounded-lg">
                      <div className="w-10 h-10 bg-beige-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">🚛</span>
                      </div>
                      <div>
                        <div className="font-semibold text-navy-700">Crane Liebherr</div>
                        <div className="text-sm text-navy-500">Rented • ₹2,500/day</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-midnight-800 to-navy-600 bg-clip-text text-transparent mb-4">
              Why Choose Reservelt?
            </h2>
            <p className="text-xl text-navy-600 max-w-3xl mx-auto">
              We provide comprehensive equipment rental solutions with cutting-edge technology and exceptional service standards.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 group ${
                  isVisible.features ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-midnight-800 mb-3">{feature.title}</h3>
                  <p className="text-navy-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gradient-to-br from-purple-50 to-beige-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-midnight-800 to-navy-600 bg-clip-text text-transparent mb-6">
                  Trusted by Industry Leaders
                </h2>
                <p className="text-xl text-navy-600 leading-relaxed mb-6">
                  With over a decade of experience in equipment rental, we've built our reputation on reliability, 
                  quality, and exceptional customer service. Our state-of-the-art platform makes equipment rental 
                  simple, efficient, and cost-effective.
                </p>
                <p className="text-lg text-navy-500">
                  From small construction projects to large-scale industrial operations, we provide the equipment 
                  and expertise you need to get the job done right.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <SignedOut>
                  <Link
                    to="/sign-up"
                    className="bg-gradient-to-r from-purple-500 to-navy-600 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
                  >
                    <span>Start Your Journey</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </SignedOut>
                <button className="border-2 border-purple-300 text-navy-700 px-8 py-3 rounded-full hover:bg-purple-50 transition-all duration-300 font-semibold">
                  Learn More
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200 p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-midnight-800">Quality Assured</h4>
                      <p className="text-sm text-navy-600">All equipment regularly maintained and certified</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-midnight-800">24/7 Support</h4>
                      <p className="text-sm text-navy-600">Round-the-clock customer assistance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-midnight-800">Fast Delivery</h4>
                      <p className="text-sm text-navy-600">Same-day delivery for urgent requirements</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-midnight-800 to-navy-600 bg-clip-text text-transparent mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-navy-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our satisfied customers have to say about our services.
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200 p-8 md:p-12">
              <div className="text-center">
                <div className="text-6xl mb-6">{testimonials[currentSlide].avatar}</div>
                <p className="text-2xl text-navy-700 leading-relaxed mb-8 italic">
                  "{testimonials[currentSlide].content}"
                </p>
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <h4 className="text-xl font-semibold text-midnight-800">{testimonials[currentSlide].name}</h4>
                <p className="text-navy-600">{testimonials[currentSlide].role}</p>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-purple-500' : 'bg-purple-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-navy-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-10 animate-blob"></div>
            <div className="absolute bottom-10 left-10 w-72 h-72 bg-beige-300 rounded-full mix-blend-overlay filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Projects?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust Reservelt for their equipment needs. 
            Get started today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <Link
                to="/sign-up"
                className="bg-white text-purple-600 px-8 py-4 rounded-full hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 group"
              >
                <span>Start Free Trial</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/dashboard"
                className="bg-white text-purple-600 px-8 py-4 rounded-full hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 group"
              >
                <span>Go to Dashboard</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </SignedIn>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-purple-600 transition-all duration-300 font-semibold text-lg">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-midnight-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-navy-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-2xl font-bold">Reservelt</span>
              </div>
              <p className="text-purple-200 mb-6 max-w-md">
                Your trusted partner for premium equipment rental solutions. 
                Quality equipment, professional service, and nationwide coverage.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                  <span className="text-white font-bold">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                  <span className="text-white font-bold">t</span>
                </a>
                <a href="#" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                  <span className="text-white font-bold">in</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-purple-200 hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="text-purple-200 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#testimonials" className="text-purple-200 hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-purple-700 mt-12 pt-8 text-center">
            <p className="text-purple-200">
              © 2024 Reservelt. All rights reserved. | Built with ❤️ for the rental industry.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

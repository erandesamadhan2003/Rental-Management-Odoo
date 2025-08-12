import React, { useState, useRef, useEffect } from 'react'
import Navbar from './Navbar'

const Settings = () => {
  const [activeSection, setActiveSection] = useState(null)
  const [showChatbot, setShowChatbot] = useState(false)
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef(null)

  // Focus input when chatbot opens
  useEffect(() => {
    if (showChatbot && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus()
      }, 100)
    }
  }, [showChatbot])

  // Common issues and responses for the chatbot
  const botResponses = {
    'login': 'To reset your password, go to the login page and click "Forgot Password". You\'ll receive an email with reset instructions.',
    'password': 'To reset your password, go to the login page and click "Forgot Password". You\'ll receive an email with reset instructions.',
    'booking': 'For booking issues, you can check your reservations in the "Orders" section. If you need to modify or cancel, look for the booking ID.',
    'payment': 'Payment issues can be resolved by checking your payment method in "Your Account". Make sure your card details are up to date.',
    'cancel': 'To cancel a booking, go to "Orders", find your reservation, and click "Cancel Booking". Refund policy applies.',
    'refund': 'Refunds typically take 3-5 business days to process. You can track refund status in your account under "Orders".',
    'property': 'For property-related questions, check the property details page or contact the property owner directly.',
    'account': 'Account settings can be managed in "Your Account" section where you can update personal information.',
    'default': 'I couldn\'t find a specific answer to your question. Let me connect you with a human agent who can better assist you.'
  }

  const handleYourAccount = () => {
    alert('Opening Your Account settings...')
  }

  const handleCustomerService = () => {
    setShowChatbot(true)
    if (messages.length === 0) {
      setMessages([
        {
          type: 'bot',
          text: 'Hi! I\'m your virtual assistant. I can help with login issues, bookings, payments, cancellations, and more. What can I help you with today?',
          timestamp: new Date()
        }
      ])
    }
  }

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      alert('Signing out...')
      // Add sign out logic here
    }
  }

  const sendMessage = () => {
    if (!userInput.trim() || isTyping) return

    const newUserMessage = {
      type: 'user',
      text: userInput,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMessage])
    setUserInput('')
    setIsTyping(true)

    // Keep focus on input after sending
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 50)

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(userInput.toLowerCase())
      const newBotMessage = {
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newBotMessage])
      setIsTyping(false)
      
      // Refocus input after bot response
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }, 1500)
  }

  const generateBotResponse = (input) => {
    // Check for keywords in user input
    for (const [keyword, response] of Object.entries(botResponses)) {
      if (keyword !== 'default' && input.includes(keyword)) {
        return response
      }
    }
    
    // If no keyword matches, return default response to connect to agent
    return botResponses.default
  }

  const connectToAgent = () => {
    const agentMessage = {
      type: 'system',
      text: '🔄 Connecting you to a human agent... Please wait while we find an available agent to assist you.',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, agentMessage])
    
    setTimeout(() => {
      const agentConnectedMessage = {
        type: 'agent',
        text: 'Hello! I\'m Sarah, a customer service agent. I\'ve reviewed your conversation and I\'m here to help. How can I assist you today?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, agentConnectedMessage])
    }, 3000)
  }

  const ChatbotModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 h-96 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🤖</span>
            <h3 className="font-semibold">Customer Support</h3>
          </div>
          <button 
            onClick={() => setShowChatbot(false)}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-3 py-2 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : message.type === 'agent'
                  ? 'bg-green-100 text-gray-800 border border-green-200'
                  : message.type === 'system'
                  ? 'bg-yellow-100 text-gray-800 border border-yellow-200'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {message.type === 'bot' && <span className="text-sm">🤖 </span>}
                {message.type === 'agent' && <span className="text-sm">👨‍💻 </span>}
                <span className="text-sm">{message.text}</span>
                {message.text === botResponses.default && (
                  <button 
                    onClick={connectToAgent}
                    className="block mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Connect to Agent
                  </button>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                <span className="text-sm">🤖 Typing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !userInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Help & Settings</h1>
          </div>

          {/* Menu Items */}
          <div className="divide-y divide-gray-200">
            
            {/* Your Account */}
            <div 
              onClick={handleYourAccount}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">👤</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 group-hover:text-blue-600">Your Account</h3>
                  <p className="text-sm text-gray-500">Manage your personal information and preferences</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>

            {/* Customer Service */}
            <div 
              onClick={handleCustomerService}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">💬</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 group-hover:text-green-600">Customer Service</h3>
                  <p className="text-sm text-gray-500">Chat with our AI assistant or connect to a human agent</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>

            {/* Sign Out */}
            <div 
              onClick={handleSignOut}
              className="p-6 hover:bg-red-50 cursor-pointer transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-lg">🚪</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 group-hover:text-red-600">Sign Out</h3>
                  <p className="text-sm text-gray-500">Sign out of your account</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>

          </div>
        </div>
      </div>

      {/* Chatbot Modal */}
      {showChatbot && <ChatbotModal />}
    </div>
  )
}

export default Settings
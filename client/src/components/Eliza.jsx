import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConnectButton } from './ConnectButton'
import { FaRobot, FaPaperPlane, FaChartLine, FaPlus, FaUser } from 'react-icons/fa'
import { GoogleGenerativeAI } from "@google/generative-ai"

function Eliza() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    { text: "Hi! I'm looking for help with predictions.", isBot: false }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input
    setMessages(prev => [...prev, { text: userMessage, isBot: false }])
    setInput('')
    setIsLoading(true)

    try {
      // Create a new chat instance
      const chat = model.startChat({
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        },
      })

      // Send the message with context
      const prompt = `You are Eliza, a knowledgeable prediction market and cryptocurrency assistant. 
                     Previous context: ${messages.map(m => m.text).join('\n')}
                     User question: ${userMessage}
                     Please provide a helpful response:`

      const result = await chat.sendMessage([prompt])
      const response = await result.response
      const botResponse = response.text()

      setMessages(prev => [...prev, { text: botResponse, isBot: true }])
    } catch (error) {
      console.error('Gemini API Error:', error)
      setMessages(prev => [...prev, { 
        text: "I apologize, but I'm experiencing a technical issue. Please try asking your question again.", 
        isBot: true 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pink-200 flex flex-col items-center p-8">
      {/* Header */}
      <div className="w-full max-w-3xl mb-16">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 
              onClick={() => navigate('/')}
              className="text-3xl font-bold text-pink-600 cursor-pointer hover:text-pink-500 transition-colors"
            >
              PrediEdu
            </h1>
          </div>
          <ConnectButton />
        </div>
        <div className="h-px bg-pink-800/60 w-full"></div>
      </div>

      {/* Chat Container */}
      <div className="w-full max-w-xl mb-20 bg-pink-300 rounded-2xl border-2 border-pink-500 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 flex items-center gap-3">
          <FaRobot className="text-white text-2xl" />
          <h2 className="text-lg font-bold text-white">Eliza AI  powered by Polymarket</h2>
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.isBot
                    ? 'bg-white text-black rounded-tl-none'
                    : 'bg-pink-500 text-white rounded-tr-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-black rounded-2xl rounded-tl-none px-4 py-2">
                Typing...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-pink-400 bg-pink-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-xl border-2 border-pink-400 focus:outline-none focus:border-pink-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`bg-pink-500 text-white p-3 rounded-xl transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-600'
              }`}
              disabled={isLoading}
            >
              <FaPaperPlane />
            </button>
          </div>
        </form>
      </div>

      {/* Navigation Icons */}
      <div className="w-full max-w-3xl">
        <div className="bg-pink-300 rounded-2xl p-6 border-2 border-pink-500 flex justify-between items-center px-16">
          <button 
            onClick={() => navigate('/live-bets')}
            className="flex flex-col items-center gap-2 text-black"
          >
            <FaChartLine size={32} />
            <span className="text-sm">Live Bets</span>
          </button>
          <button 
            onClick={() => navigate('/create')}
            className="bg-pink-600 hover:bg-pink-500 text-white p-5 rounded-full transition-colors border-2 border-pink-500"
          >
            <FaPlus size={36} />
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-2 text-black"
          >
            <FaUser size={32} />
            <span className="text-sm">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Eliza
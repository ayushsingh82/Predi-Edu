import React, { useState, useEffect } from 'react'
import { ConnectButton } from './ConnectButton'
import { FaChartLine, FaPlus, FaUser, FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { publicClient } from '../config'
import { wagmiAbi } from '../abi'

function LiveBet() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState([
    { text: "Hi! I'm looking for help with predictions.", isBot: false }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const yesOpacity = useTransform(x, [-200, 0, 100], [0, 0, 1])
  const noOpacity = useTransform(x, [-100, 0, 200], [1, 0, 0])
  const controls = useAnimation()

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  // Fetch questions from contract
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const contractQuestions = await publicClient.readContract({
          address: "0xf12F7584143D17169905D7954D3DEab8942a310d",
          abi: wagmiAbi,
          functionName: "getAllQuestions"
        });
        console.log('Fetched questions:', contractQuestions)
        setQuestions(contractQuestions)
      } catch (err) {
        console.error('Error fetching questions:', err)
        setError('Failed to load predictions')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleDragEnd = async (_, info) => {
    const swipeThreshold = 100

    if (Math.abs(info.offset.x) > swipeThreshold) {
      await controls.start({
        x: info.offset.x > 0 ? 1000 : -1000,
        transition: { duration: 0.3 },
      })

      if (info.offset.x > 0) {
        navigate('/buy-bet')
        return
      }

      if (currentIndex >= questions.length - 1) {
        navigate('/profile')
        return
      }

      setCurrentIndex(prev => prev + 1)
      x.set(0)
      y.set(0)
      controls.set({ x: 0, y: 0 })
    } else {
      controls.start({
        x: 0,
        y: 0,
        transition: { type: "spring", duration: 0.5 },
      })
    }
  }

  const handleTickClick = () => {
    navigate('/buy-bet')
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input
    setMessages(prev => [...prev, { text: userMessage, isBot: false }])
    setInput('')
    setIsLoading(true)

    try {
      const chat = model.startChat({
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        },
      })

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

  const handleElizaClick = () => {
    console.log('Opening chat...')
    setShowChat(prev => {
      console.log('Setting showChat to:', !prev)
      return !prev
    })
  }

  return (
    <div className="min-h-screen bg-pink-200 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="w-full max-w-3xl mb-16 z-10">
        <div className="flex flex-col items-center mb-4">
          <h1 
            onClick={() => navigate('/')}
            className="text-3xl font-bold text-pink-600 cursor-pointer hover:text-pink-500 transition-colors mb-4"
          >
            PrediEdu
          </h1>
          <div className="bg-blue-500 rounded-2xl p-2">
            <ConnectButton />
          </div>
        </div>
        <div className="h-px bg-pink-800/60 w-full mt-4"></div>
      </div>

      {/* Swipeable Card */}
      <div className="w-full max-w-xl mb-8 relative z-20">
        {loading ? (
          <div className="text-center text-xl font-bold text-pink-600">Loading predictions...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : questions.length === 0 ? (
          <div className="text-center text-xl font-bold text-pink-600">No predictions available</div>
        ) : (
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x, y, rotate }}
            animate={controls}
            onDragEnd={handleDragEnd}
            className="w-full cursor-grab active:cursor-grabbing"
          >
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl overflow-hidden shadow-xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiLz48L2c+PC9zdmc+')]"></div>

              {/* Card Content */}
              <div className="p-6">
                {/* Question Number */}
                <div className="text-white/80 text-sm mb-4">
                  Question {currentIndex + 1} of {questions.length}
                </div>

                {/* Question */}
                <div className="min-h-[100px] flex items-center mb-6">
                  <h3 className="text-xl font-bold text-white text-center w-full">
                    {questions[currentIndex]}
                  </h3>
                </div>

                {/* Bottom Buttons */}
                <div className="flex justify-between items-center mt-8">
                  <button 
                    onClick={() => handleDragEnd(null, { offset: { x: -150 } })}
                    className="bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all transform hover:scale-105 active:scale-95"
                  >
                    <span className="text-4xl">❌</span>
                  </button>
                  <button 
                    onClick={handleTickClick}
                    className="bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all transform hover:scale-105 active:scale-95"
                  >
                    <span className="text-4xl">✅</span>
                  </button>
                </div>

                {/* Swipe Indicators */}
                <motion.div 
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 pointer-events-none"
                  style={{ opacity: noOpacity }}
                >
                  <span className="text-6xl">❌</span>
                </motion.div>
                <motion.div 
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none"
                  style={{ opacity: yesOpacity }}
                >
                  <span className="text-6xl">✅</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Eliza AI Button */}
      <div className="w-full max-w-xl mb-16 flex justify-center z-20">
        <button
          onClick={handleElizaClick}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:from-purple-500 hover:to-blue-500 transition-colors"
        >
          Ask Eliza AI
        </button>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-pink-200 rounded-2xl w-full max-w-xl relative">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaRobot className="text-white text-2xl" />
                <h2 className="text-lg font-bold text-white">Eliza AI powered by Polymarket</h2>
              </div>
              <button 
                onClick={() => setShowChat(false)}
                className="text-white hover:text-pink-200 transition-colors"
              >
                <FaTimes size={24} />
              </button>
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
            <form onSubmit={handleSend} className="p-4 border-t border-pink-400">
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
        </div>
      )}

      {/* Navigation Icons */}
      <div className="w-full max-w-3xl z-30">
        <div className="bg-pink-300 rounded-2xl p-6 border-2 border-pink-500 flex justify-between items-center px-16">
          <button 
            onClick={() => navigate('/live-bets')}
            className="flex flex-col items-center gap-2 text-black cursor-pointer"
          >
            <FaChartLine size={32} />
            <span className="text-sm">Live Bets</span>
          </button>
          <button 
            onClick={() => navigate('/create')}
            className="bg-pink-600 hover:bg-pink-500 text-white p-5 rounded-full transition-colors border-2 border-pink-500 cursor-pointer"
          >
            <FaPlus size={36} />
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-2 text-black cursor-pointer"
          >
            <FaUser size={32} />
            <span className="text-sm">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LiveBet
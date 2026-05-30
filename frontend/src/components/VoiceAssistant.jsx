import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, MessageSquare, X, Send, Volume2, VolumeX, Paperclip, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../context/LanguageContext';

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm EcoVision AI. How can I help you with recycling today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [attachedImage, setAttachedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const { language } = useContext(LanguageContext);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (recognition) {
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const cleanText = transcript.toLowerCase().trim();

        // Voice Command Navigation Triggers
        if (cleanText.includes('scan waste') || cleanText.includes('open camera') || cleanText.includes('start scan')) {
          setIsOpen(false);
          setIsListening(false);
          speakText("Initializing autonomous waste classification camera now.");
          navigate('/classify', { state: { autoStartAR: true } });
          return;
        }

        if (cleanText.includes('find recycling center') || cleanText.includes('recycling center') || cleanText.includes('find center')) {
          setIsOpen(false);
          setIsListening(false);
          speakText("Mapping municipality proximity nodes for active recycling centers.");
          navigate('/fleet');
          return;
        }

        handleSendMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, [recognition]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
  };

  const speakText = (text) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Slightly higher pitch for friendly AI voice
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleImageAttach = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setAttachedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || textInput;
    if (!textToSend.trim() && !attachedImage) return;

    // Add user message to chat
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: textToSend,
      image: imagePreview 
    }]);
    
    setTextInput('');
    setAttachedImage(null);
    setImagePreview(null);
    setLoading(true);

    try {
      let bodyData;
      let headers = {};
      
      if (attachedImage) {
        bodyData = new FormData();
        bodyData.append('message', textToSend);
        bodyData.append('language', language);
        bodyData.append('image', attachedImage);
      } else {
        bodyData = JSON.stringify({ message: textToSend, language: language });
        headers = { 'Content-Type': 'application/json' };
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: headers,
        body: bodyData
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
      speakText(data.response);
      
    } catch (error) {
      console.error(error);
      const errorMsg = "Sorry, I'm having trouble connecting to the server.";
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
      speakText(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-80 md:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
            style={{ height: '500px' }}
          >
            {/* Header */}
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-full">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">EcoVision AI</h3>
                  <div className="text-xs text-emerald-100 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)} 
                  className="p-1 hover:bg-white/20 rounded-md transition"
                >
                  {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 opacity-50" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1 hover:bg-white/20 rounded-md transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm flex flex-col gap-2 ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-sm'}`}>
                    {msg.image && (
                      <img src={msg.image} alt="User Upload" className="w-full h-auto max-h-32 object-cover rounded-xl" />
                    )}
                    {msg.text && <span>{msg.text}</span>}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-2xl rounded-tl-sm flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Preview & Input Area */}
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex flex-col">
              {imagePreview && (
                <div className="p-3 border-b border-gray-100 dark:border-gray-800 relative">
                  <button 
                    onClick={() => { setAttachedImage(null); setImagePreview(null); }}
                    className="absolute top-1 right-1 bg-gray-900/50 text-white rounded-full p-1 hover:bg-red-500 transition z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg shadow-sm border" />
                </div>
              )}
              
              <div className="p-3 flex gap-2 items-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageAttach} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-full flex-shrink-0 transition-all bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-primary hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                  title="Attach Image"
                >
                  <Paperclip className="h-5 w-5" />
                </button>

                <button 
                  onClick={toggleListening}
                  className={`p-3 rounded-full flex-shrink-0 transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-primary hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
                  title="Voice Input"
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                
                <input 
                  type="text" 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening..." : "Ask me anything..."}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isListening}
                />
                
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!textInput.trim() && !attachedImage}
                  className={`p-3 rounded-full flex-shrink-0 transition-all ${(textInput.trim() || attachedImage) ? 'bg-primary text-white hover:bg-emerald-600 shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl shadow-emerald-500/50 flex items-center justify-center relative group"
        >
          {isSpeaking && (
            <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping"></span>
          )}
          <MessageSquare className="h-8 w-8" />
        </motion.button>
      )}
    </div>
  );
}

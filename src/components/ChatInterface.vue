<template>
  <div class="w-full max-w-4xl mx-auto px-8 flex flex-col gap-8">
    <!-- Chat History -->
    <div class="chat-history bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[250px] max-h-[250px] overflow-y-auto backdrop-blur-md">
      <div v-if="chatHistory.length === 0" class="text-gray-500 italic text-center mt-20">
        Chat geschiedenis verschijnt hier...
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="(message, index) in chatHistory"
          :key="index"
          class="message"
          :class="message.type"
        >
          <div v-if="message.type === 'user'" class="user-message">
            <div class="message-header">
              <span class="message-label">Jij</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-content user-content">
              {{ message.content }}
            </div>
          </div>

          <div v-else class="ai-message">
            <div class="message-header">
              <span class="message-label">AI Assistent</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-content ai-content">
              <span class="whitespace-pre-wrap">{{ message.content }}</span>
              <span v-if="message.isStreaming" class="text-red-600 ml-0.5 animate-pulse">|</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Auto-scroll anchor -->
      <div ref="chatBottom"></div>
    </div>

    <!-- Input Section -->
    <div class="flex gap-4 items-end">
      <div class="flex-1 relative">
        <textarea
          v-model="userInput"
          placeholder="Stel je vraag..."
          class="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white text-base resize-y min-h-[60px] max-h-[200px] backdrop-blur-md transition-all duration-300 focus:outline-none focus:border-white/40 focus:shadow-lg focus:shadow-white/10 placeholder-gray-400"
          @keydown.ctrl.enter="sendMessage"
          @keydown.enter.prevent="handleEnterKey"
          :disabled="isLoading"
          :class="{ 'opacity-60 cursor-not-allowed': isLoading }"
        ></textarea>

      </div>

      <button
        @click="sendMessage"
        :disabled="isLoading || !userInput.trim()"
        class="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-0 rounded-xl px-8 py-4 text-white text-base font-semibold cursor-pointer transition-all duration-300 min-w-[120px] disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg hover:enabled:shadow-red-600/30"
      >
        {{ isLoading ? 'Verwerken...' : 'Versturen' }}
      </button>
    </div>

    <!-- Chat Controls -->
    <div class="flex gap-4 justify-between items-center">
      <button
        @click="clearChat"
        :disabled="chatHistory.length === 0"
        class="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-white text-sm font-medium cursor-pointer transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Chat Wissen
      </button>

      <!-- Status Info -->
      <div class="flex gap-8">
        <div class="flex gap-2 items-center text-sm">
          <span class="text-gray-400 font-medium">Model:</span>
          <span class="text-white font-semibold">{{ currentModel }}</span>
        </div>
        <div class="flex gap-2 items-center text-sm">
          <span class="text-gray-400 font-medium">Status:</span>
          <span
            class="font-semibold"
            :class="{
              'text-green-400': connectionStatus === 'verbonden',
              'text-red-400': connectionStatus === 'niet verbonden',
              'text-yellow-400': connectionStatus === 'fout'
            }"
          >
            {{ connectionStatus }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, watch } from 'vue'

export default {
  name: 'ChatInterface',
  emits: ['streaming-change'],
  setup(props, { emit }) {
    const userInput = ref('')
    const chatHistory = ref([])
    const isLoading = ref(false)
    const currentModel = ref('llama2')
    const connectionStatus = ref('niet verbonden')
    const chatBottom = ref(null)

    // Ollama API configuration
    const OLLAMA_URL = 'http://localhost:11434'

    // System prompt placeholder - you can modify this
    const SYSTEM_PROMPT = `Je bent een behulpzame AI-assistent die in het Nederlands antwoordt. Je staat mevrouw Boelema te woord, zij is een gedeputeerde van de Provincie Noord-Brabant.
Geef korte, duidelijke en accurate antwoorden. Wees vriendelijk en professioneel.`

    const checkOllamaConnection = async () => {
      try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`)
        if (response.ok) {
          connectionStatus.value = 'verbonden'
          const data = await response.json()
          if (data.models && data.models.length > 0) {
            currentModel.value = data.models[0].name
          }
        } else {
          connectionStatus.value = 'fout'
        }
      } catch (error) {
        connectionStatus.value = 'niet verbonden'
        console.error('Kan geen verbinding maken met Ollama:', error)
      }
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const scrollToBottom = () => {
      nextTick(() => {
        if (chatBottom.value) {
          chatBottom.value.scrollIntoView({ behavior: 'smooth' })
        }
      })
    }

    const addMessage = (type, content, isStreaming = false) => {
      const message = {
        type,
        content,
        timestamp: Date.now(),
        isStreaming
      }

      if (type === 'ai' && chatHistory.value.length > 0 &&
          chatHistory.value[chatHistory.value.length - 1].type === 'ai' &&
          chatHistory.value[chatHistory.value.length - 1].isStreaming) {
        // Update the last AI message if it's still streaming
        chatHistory.value[chatHistory.value.length - 1] = message
      } else {
        chatHistory.value.push(message)
      }

      scrollToBottom()
    }

    const buildConversationContext = () => {
      // Build context from chat history for better conversations
      let context = SYSTEM_PROMPT + '\n\n'

      // Add recent conversation history (last 10 messages)
      const recentHistory = chatHistory.value.slice(-10)
      recentHistory.forEach(msg => {
        if (msg.type === 'user') {
          context += `Gebruiker: ${msg.content}\n`
        } else if (msg.type === 'ai' && !msg.isStreaming) {
          context += `Assistent: ${msg.content}\n`
        }
      })

      return context
    }

    const sendMessage = async () => {
      if (!userInput.value.trim() || isLoading.value) return

      const userMessage = userInput.value.trim()

      // Add user message to history
      addMessage('user', userMessage)

      // Clear input
      userInput.value = ''

      isLoading.value = true
      emit('streaming-change', true)

      // Add initial AI message
      addMessage('ai', '', true)

      try {
        // Build the prompt with conversation context
        const conversationContext = buildConversationContext()
        const fullPrompt = `${conversationContext}\nGebruiker: ${userMessage}\nAssistent:`

        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: currentModel.value,
            prompt: fullPrompt,
            stream: true,
            options: {
              temperature: 0.7,
              top_p: 0.9,
              stop: ['Gebruiker:', 'User:']
            }
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP fout! status: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let aiResponse = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line)
                if (data.response) {
                  aiResponse += data.response
                  addMessage('ai', aiResponse, true)
                }
              } catch (e) {
                console.warn('Kan JSON niet verwerken:', line)
              }
            }
          }
        }

        // Mark final message as complete
        if (aiResponse) {
          addMessage('ai', aiResponse, false)
        }

      } catch (error) {
        const errorMessage = `Fout: ${error.message}. Zorg ervoor dat Ollama draait op localhost:11434`
        addMessage('ai', errorMessage, false)
        console.error('Fout bij aanroepen Ollama:', error)
      } finally {
        isLoading.value = false
        emit('streaming-change', false)
      }
    }

    const handleEnterKey = (e) => {
      if (!e.shiftKey) {
        // Enter without Shift sends the message
        sendMessage()
      } else {
        // Shift+Enter adds a new line (default behavior)
        return true
      }
    }

    const clearChat = () => {
      chatHistory.value = []
    }

    // Watch for new messages to auto-scroll
    watch(() => chatHistory.value.length, () => {
      scrollToBottom()
    })

    onMounted(() => {
      checkOllamaConnection()


    })

    return {
      userInput,
      chatHistory,
      isLoading,
      currentModel,
      connectionStatus,
      chatBottom,
      sendMessage,
      handleEnterKey,
      clearChat,
      formatTime
    }
  }
}
</script>

<style scoped>
/* Chat History Styles */
.chat-history {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.chat-history::-webkit-scrollbar {
  width: 6px;
}

.chat-history::-webkit-scrollbar-track {
  background: transparent;
}

.chat-history::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

/* Message Styles */
.message {
  margin-bottom: 1.5rem;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.message-label {
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.8;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.6;
}

.message-content {
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* User Messages */
.user-message .message-label {
  color: #60a5fa;
}

.user-content {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  margin-left: 2rem;
  border-bottom-right-radius: 0.25rem;
}

/* AI Messages */
.ai-message .message-label {
  color: #f87171;
}

.ai-content {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  margin-right: 2rem;
  border-bottom-left-radius: 0.25rem;
}

/* Animation for new messages */
.message {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading animation for AI responses */
.animate-pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 80%, 100% {
    opacity: 0.5;
  }
  40% {
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-content {
    margin-left: 1rem;
  }

  .ai-content {
    margin-right: 1rem;
  }

  .message-content {
    padding: 0.75rem 1rem;
  }
}
</style>
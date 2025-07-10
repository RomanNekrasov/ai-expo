<template>
  <div class="w-full max-w-4xl mx-auto px-8 flex flex-col gap-8">
    <!-- Input Section -->
    <div class="flex gap-4 items-end">
      <textarea
        v-model="userInput"
        placeholder="Ask me anything..."
        class="flex-1 bg-white/10 border border-white/20 rounded-xl p-4 text-white text-base resize-y min-h-[60px] max-h-[200px] backdrop-blur-md transition-all duration-300 focus:outline-none focus:border-white/40 focus:shadow-lg focus:shadow-white/10 placeholder-gray-400"
        @keydown.ctrl.enter="sendMessage"
        :disabled="isLoading"
        :class="{ 'opacity-60 cursor-not-allowed': isLoading }"
      ></textarea>
      <button
        @click="sendMessage"
        :disabled="isLoading || !userInput.trim()"
        class="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-0 rounded-xl px-8 py-4 text-white text-base font-semibold cursor-pointer transition-all duration-300 min-w-[120px] disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg hover:enabled:shadow-red-600/30"
      >
        {{ isLoading ? 'Processing...' : 'Send' }}
      </button>
    </div>

    <!-- Output Section -->
    <div class="min-h-[300px]">
      <div class="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[300px] backdrop-blur-md relative">
        <div v-if="isLoading && !aiResponse" class="flex justify-center items-center h-full">
          <div class="flex gap-2">
            <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse" style="animation-delay: 0.2s"></span>
            <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse" style="animation-delay: 0.4s"></span>
          </div>
        </div>
        <div v-else-if="aiResponse" class="text-white text-lg leading-relaxed whitespace-pre-wrap relative">
          {{ aiResponse }}
          <span v-if="isLoading" class="text-red-600 ml-0.5 animate-pulse">|</span>
        </div>
        <div v-else class="text-gray-500 italic text-center mt-20">
          AI response will appear here...
        </div>
      </div>
    </div>

    <!-- Status Info -->
    <div class="flex gap-8 justify-center">
      <div class="flex gap-2 items-center text-sm">
        <span class="text-gray-400 font-medium">Model:</span>
        <span class="text-white font-semibold">{{ currentModel }}</span>
      </div>
      <div class="flex gap-2 items-center text-sm">
        <span class="text-gray-400 font-medium">Status:</span>
        <span
          class="font-semibold"
          :class="{
            'text-green-400': connectionStatus === 'connected',
            'text-red-400': connectionStatus === 'disconnected',
            'text-yellow-400': connectionStatus === 'error'
          }"
        >
          {{ connectionStatus }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'ChatInterface',
  emits: ['streaming-change'],
  setup(props, { emit }) {
    const userInput = ref('')
    const aiResponse = ref('')
    const isLoading = ref(false)
    const currentModel = ref('llama2')
    const connectionStatus = ref('disconnected')

    // Ollama API configuration
    const OLLAMA_URL = 'http://localhost:11434'

    const checkOllamaConnection = async () => {
      try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`)
        if (response.ok) {
          connectionStatus.value = 'connected'
          const data = await response.json()
          if (data.models && data.models.length > 0) {
            currentModel.value = data.models[0].name
          }
        } else {
          connectionStatus.value = 'error'
        }
      } catch (error) {
        connectionStatus.value = 'disconnected'
        console.error('Failed to connect to Ollama:', error)
      }
    }

    const sendMessage = async () => {
      if (!userInput.value.trim() || isLoading.value) return

      isLoading.value = true
      aiResponse.value = ''
      emit('streaming-change', true)

      try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: currentModel.value,
            prompt: userInput.value,
            stream: true
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

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
                  aiResponse.value += data.response
                }
              } catch (e) {
                console.warn('Failed to parse JSON:', line)
              }
            }
          }
        }

      } catch (error) {
        aiResponse.value = `Error: ${error.message}. Make sure Ollama is running on localhost:11434`
        console.error('Error calling Ollama:', error)
      } finally {
        isLoading.value = false
        emit('streaming-change', false)
      }
    }

    onMounted(() => {
      checkOllamaConnection()
    })

    return {
      userInput,
      aiResponse,
      isLoading,
      currentModel,
      connectionStatus,
      sendMessage
    }
  }
}
</script>

<style scoped>
@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Custom pulse animation for loading dots */
.animate-pulse {
  animation: pulse 1.5s infinite;
}
</style>
// SystemSetupInterface.vue
<template>
  <div class="w-full max-w-4xl mx-auto px-8 flex flex-col gap-8">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-white mb-4">🚀 System Initialization</h2>
      <p class="text-white/80 text-lg">
        Load and configure the AI models before starting the experience
      </p>
    </div>

    <!-- Model Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- WhisperLive Status -->
      <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-4 h-4 rounded-full"
            :class="{
              'bg-green-400': whisperStatus === 'connected',
              'bg-yellow-400 animate-pulse': whisperStatus === 'connecting',
              'bg-red-400': whisperStatus === 'error',
              'bg-gray-400': whisperStatus === 'disconnected'
            }"
          ></div>
          <h3 class="text-xl font-semibold text-white">WhisperLive Server</h3>
        </div>

        <div class="space-y-4">
          <div class="flex gap-4">
            <select
              v-model="selectedWhisperModel"
              :disabled="whisperStatus === 'connecting' || whisperStatus === 'connected'"
              class="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-md focus:outline-none focus:border-white/40 disabled:opacity-60"
            >
              <option value="tiny">Tiny (Fast, Less Accurate)</option>
              <option value="base">Base (Balanced)</option>
              <option value="small">Small (Good Quality)</option>
              <option value="medium">Medium (High Quality, GPU Needed)</option>
            </select>

            <select
              v-model="selectedLanguage"
              :disabled="whisperStatus === 'connecting' || whisperStatus === 'connected'"
              class="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-md focus:outline-none focus:border-white/40 disabled:opacity-60"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="nl">Dutch</option>
            </select>
          </div>

          <button
            @click="connectWhisperLive"
            :disabled="whisperStatus === 'connecting' || whisperStatus === 'connected'"
            class="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 border-0 rounded-xl px-4 py-3 text-white text-sm font-semibold cursor-pointer transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ getWhisperButtonText() }}
          </button>

          <div class="text-sm text-white/60">
            <p><strong>Status:</strong> {{ whisperStatusText }}</p>
            <p v-if="whisperStatus === 'error'"><strong>Error:</strong> {{ whisperError }}</p>
          </div>
        </div>
      </div>

      <!-- Ollama Status -->
      <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-4 h-4 rounded-full"
            :class="{
              'bg-green-400': ollamaStatus === 'ready',
              'bg-yellow-400 animate-pulse': ollamaStatus === 'loading',
              'bg-red-400': ollamaStatus === 'error',
              'bg-gray-400': ollamaStatus === 'disconnected'
            }"
          ></div>
          <h3 class="text-xl font-semibold text-white">Ollama Chat Model</h3>
        </div>

        <div class="space-y-4">
          <select
            v-model="selectedChatModel"
            :disabled="availableModels.length === 0 || ollamaStatus === 'loading'"
            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-md focus:outline-none focus:border-white/40 disabled:opacity-60"
          >
            <option v-for="model in availableModels" :key="model.name" :value="model.name">
              {{ model.name }} ({{ formatModelSize(model.size) }})
            </option>
          </select>

          <button
            @click="loadChatModel"
            :disabled="!selectedChatModel || ollamaStatus === 'loading' || ollamaStatus === 'ready'"
            class="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 border-0 rounded-xl px-4 py-3 text-white text-sm font-semibold cursor-pointer transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ getChatButtonText() }}
          </button>

          <div class="text-sm text-white/60">
            <p><strong>Status:</strong> {{ ollamaStatusText }}</p>
            <p v-if="selectedChatModel && ollamaStatus === 'ready'">
              <strong>Loaded:</strong> {{ selectedChatModel }}
            </p>
            <p v-if="ollamaStatus === 'error'"><strong>Error:</strong> {{ ollamaError }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- System Requirements Info -->
    <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
      <h3 class="text-lg font-semibold text-white mb-3">📋 System Requirements</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
        <div>
          <h4 class="font-medium text-white mb-2">WhisperLive Server:</h4>
          <ul class="space-y-1">
            <li>• Server running on localhost:9090</li>
            <li>• Model loaded and ready</li>
            <li>• GPU recommended for medium+</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-white mb-2">Ollama Service:</h4>
          <ul class="space-y-1">
            <li>• Service running on localhost:11434</li>
            <li>• Model pre-loaded and warmed up</li>
            <li>• Persistent in memory</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Progress and Continue -->
    <div class="text-center">
      <div v-if="!allSystemsReady" class="mb-6">
        <div class="bg-white/5 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-center gap-2 text-yellow-400">
            <div class="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Initializing AI systems...</span>
          </div>
          <div class="mt-2 text-sm text-white/60">
            {{ getInitializationMessage() }}
          </div>
        </div>
      </div>

      <div v-else class="mb-6">
        <div class="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-center gap-2 text-green-400">
            <div class="w-4 h-4 bg-green-400 rounded-full"></div>
            <span class="font-semibold">🎉 All Systems Ready!</span>
          </div>
          <div class="mt-2 text-sm text-white/70">
            WhisperLive and Ollama are loaded and ready for the experience.
          </div>
        </div>
      </div>

      <button
        @click="continueToExperience"
        :disabled="!allSystemsReady"
        class="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-0 rounded-xl px-8 py-4 text-white text-lg font-semibold cursor-pointer transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg hover:enabled:shadow-red-600/30"
      >
        {{ allSystemsReady ? 'Begin AI Experience →' : 'Waiting for Systems...' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'SystemSetupInterface',
  emits: ['systems-ready', 'setup-complete'],
  setup(props, { emit }) {
    // WhisperLive state
    const whisperStatus = ref('disconnected')
    const whisperError = ref('')
    const selectedWhisperModel = ref('small')
    const selectedLanguage = ref('en')
    const whisperWebSocket = ref(null)

    // Ollama state
    const ollamaStatus = ref('disconnected')
    const ollamaError = ref('')
    const availableModels = ref([])
    const selectedChatModel = ref('')

    // Computed
    const allSystemsReady = computed(() => {
      return whisperStatus.value === 'connected' && ollamaStatus.value === 'ready'
    })

    const whisperStatusText = computed(() => {
      switch (whisperStatus.value) {
        case 'connected': return 'Connected and Ready'
        case 'connecting': return 'Connecting to server...'
        case 'error': return 'Connection Failed'
        default: return 'Not Connected'
      }
    })

    const ollamaStatusText = computed(() => {
      switch (ollamaStatus.value) {
        case 'ready': return 'Model Loaded and Ready'
        case 'loading': return 'Loading model...'
        case 'error': return 'Connection Failed'
        default: return 'Not Connected'
      }
    })

    // Methods
    const getWhisperButtonText = () => {
      switch (whisperStatus.value) {
        case 'connected': return '✓ Connected'
        case 'connecting': return 'Connecting...'
        case 'error': return 'Retry Connection'
        default: return 'Connect to WhisperLive'
      }
    }

    const getChatButtonText = () => {
      switch (ollamaStatus.value) {
        case 'ready': return '✓ Model Loaded'
        case 'loading': return 'Loading Model...'
        case 'error': return 'Retry Loading'
        default: return 'Load Chat Model'
      }
    }

    const getInitializationMessage = () => {
      if (whisperStatus.value !== 'connected') {
        return 'Waiting for WhisperLive connection...'
      }
      if (ollamaStatus.value !== 'ready') {
        return 'Loading chat model into memory...'
      }
      return 'Finalizing setup...'
    }

    const formatModelSize = (bytes) => {
      if (!bytes) return ''
      const gb = bytes / (1024 * 1024 * 1024)
      return `${gb.toFixed(1)}GB`
    }

    // WhisperLive connection
    const connectWhisperLive = () => {
      if (whisperStatus.value === 'connected') return

      whisperStatus.value = 'connecting'
      whisperError.value = ''

      const wsUrl = 'ws://localhost:9090'
      const uid = generateUID()

      if (whisperWebSocket.value) {
        whisperWebSocket.value.close()
      }

      whisperWebSocket.value = new WebSocket(wsUrl)

      whisperWebSocket.value.onopen = () => {
        console.log('WhisperLive connected for setup')

        // Send configuration
        const config = {
          uid: uid,
          language: selectedLanguage.value,
          task: 'transcribe',
          model: selectedWhisperModel.value,
          use_vad: true,
          max_clients: 4,
          max_connection_time: 1200, // 20 minutes
          send_last_n_segments: 10,
          no_speech_thresh: 0.45,
          clip_audio: false,
          same_output_threshold: 10,
        }

        whisperWebSocket.value.send(JSON.stringify(config))
      }

      whisperWebSocket.value.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.message === 'SERVER_READY') {
            whisperStatus.value = 'connected'
            console.log('WhisperLive ready with backend:', message.backend)

            // Keep connection alive but close the test connection
            setTimeout(() => {
              if (whisperWebSocket.value) {
                whisperWebSocket.value.close()
                whisperWebSocket.value = null
              }
            }, 1000)
          }
        } catch (error) {
          console.error('Error parsing WhisperLive message:', error)
        }
      }

      whisperWebSocket.value.onerror = () => {
        whisperStatus.value = 'error'
        whisperError.value = 'Failed to connect to WhisperLive server on localhost:9090'
      }

      whisperWebSocket.value.onclose = (event) => {
        if (whisperStatus.value === 'connecting') {
          whisperStatus.value = 'error'
          whisperError.value = 'Connection closed unexpectedly'
        }
      }

      // Timeout after 10 seconds
      setTimeout(() => {
        if (whisperStatus.value === 'connecting') {
          whisperStatus.value = 'error'
          whisperError.value = 'Connection timeout. Is WhisperLive server running?'
          if (whisperWebSocket.value) {
            whisperWebSocket.value.close()
          }
        }
      }, 10000)
    }

    // Ollama functions
    const checkOllamaConnection = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags')
        if (response.ok) {
          const data = await response.json()
          availableModels.value = data.models || []

          if (availableModels.value.length > 0) {
            // Select first available model by default
            selectedChatModel.value = availableModels.value[0].name
            ollamaStatus.value = 'disconnected' // Ready to load
          }
        } else {
          throw new Error('Ollama not responding')
        }
      } catch (error) {
        ollamaStatus.value = 'error'
        ollamaError.value = 'Failed to connect to Ollama on localhost:11434'
        console.error('Failed to connect to Ollama:', error)
      }
    }

    const loadChatModel = async () => {
      if (!selectedChatModel.value || ollamaStatus.value === 'loading') return

      ollamaStatus.value = 'loading'
      ollamaError.value = ''

      try {
        // Pre-load the model by making a small request
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedChatModel.value,
            prompt: 'Hello',
            stream: false,
            keep_alive: -1 // Keep model in memory indefinitely
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.response) {
          ollamaStatus.value = 'ready'
          console.log('Ollama model loaded and ready:', selectedChatModel.value)
        } else {
          throw new Error('No response from model')
        }

      } catch (error) {
        ollamaStatus.value = 'error'
        ollamaError.value = `Failed to load model: ${error.message}`
        console.error('Error loading Ollama model:', error)
      }
    }

    const generateUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }

    const continueToExperience = () => {
      if (allSystemsReady.value) {
        emit('setup-complete', {
          whisper: {
            model: selectedWhisperModel.value,
            language: selectedLanguage.value
          },
          chat: {
            model: selectedChatModel.value
          }
        })
      }
    }

    // Auto-initialize on mount
    onMounted(async () => {
      await checkOllamaConnection()

      // Auto-connect if systems are available
      setTimeout(() => {
        if (ollamaStatus.value !== 'error') {
          loadChatModel()
        }
      }, 1000)
    })

    return {
      // WhisperLive
      whisperStatus,
      whisperError,
      selectedWhisperModel,
      selectedLanguage,
      whisperStatusText,
      connectWhisperLive,
      getWhisperButtonText,

      // Ollama
      ollamaStatus,
      ollamaError,
      availableModels,
      selectedChatModel,
      ollamaStatusText,
      loadChatModel,
      getChatButtonText,
      formatModelSize,

      // General
      allSystemsReady,
      getInitializationMessage,
      continueToExperience
    }
  }
}
</script>

<style scoped>
select option {
  background-color: #1f2937;
  color: white;
}
</style>
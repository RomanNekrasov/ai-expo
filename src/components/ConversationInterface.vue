<template>
  <div class="w-full max-w-4xl mx-auto px-8 flex flex-col gap-8">
    <!-- Control Section -->
    <div class="flex gap-4 items-center justify-between">
      <div class="flex gap-4 items-center">
        <!-- Connect/Start Conversation Button -->
        <button
          v-if="!isConnected && !isConnecting"
          @click="startConversation"
          class="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 border-0 rounded-xl px-8 py-4 text-white text-base font-semibold cursor-pointer transition-all duration-300 min-w-[180px] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-600/30"
        >
          Start Gesprek
        </button>

        <!-- Connecting State -->
        <button
          v-else-if="isConnecting"
          disabled
          class="bg-gradient-to-r from-yellow-600 to-yellow-800 border-0 rounded-xl px-8 py-4 text-white text-base font-semibold cursor-not-allowed min-w-[180px] opacity-80"
        >
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Verbinden...
          </div>
        </button>

        <!-- Conversation Active -->
        <button
          v-else
          @click="stopConversation"
          class="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-0 rounded-xl px-8 py-4 text-white text-base font-semibold cursor-pointer transition-all duration-300 min-w-[180px] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30"
        >
          Stop Gesprek
        </button>

        <div class="flex gap-2 items-center">
          <div
            class="w-3 h-3 rounded-full"
            :class="{
              'bg-gray-400': !isConnected && !isConnecting,
              'bg-yellow-400 animate-pulse': isConnecting,
              'bg-green-400': isConnected && conversationState === 'listening',
              'bg-blue-400 animate-pulse': conversationState === 'processing',
              'bg-purple-400 animate-pulse': conversationState === 'responding',
              'bg-orange-400': conversationState === 'paused'
            }"
          ></div>
          <span class="text-white text-sm font-medium">
            {{ getStatusText() }}
          </span>
        </div>
      </div>

      <!-- Settings -->
      <div class="flex gap-4 items-center">
        <div class="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-md">
          <span class="text-gray-400 mr-2">Taal:</span>
          <span class="font-semibold">Nederlands</span>
        </div>
        <div class="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-md">
          <span class="text-gray-400 mr-2">Model:</span>
          <span class="font-semibold">Medium</span>
        </div>
      </div>
    </div>

    <!-- Conversation Display -->
    <div class="min-h-[300px]">
      <div class="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[300px] backdrop-blur-md relative overflow-y-auto max-h-[300px]">
        <div v-if="serverError" class="text-center text-red-400 mt-20">
          <p>{{ errorMessage }}</p>
          <button @click="reconnect" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">
            Probeer Opnieuw
          </button>
        </div>
        <div v-else-if="!isConnected && !isConnecting && conversationHistory.length === 0" class="text-center text-gray-500 italic mt-20">
          <div class="mb-4">
            <div class="text-4xl mb-2">🎙️ 🤖</div>
            <p>Klik "Start Gesprek" om te beginnen praten met de AI</p>
<!--            <p class="text-sm mt-2 opacity-75">Zorg ervoor dat zowel WhisperLive als Ollama draaien</p>-->
          </div>
        </div>
        <div v-else-if="isConnecting && conversationHistory.length === 0" class="text-center text-yellow-400 mt-20">
          <div class="flex justify-center items-center mb-4">
            <div class="w-8 h-8 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p>Verbinden met services...</p>
        </div>
        <div v-else class="space-y-4">
          <!-- Conversation messages -->
          <div
            v-for="(message, index) in conversationHistory"
            :key="index"
            class="flex gap-3"
            :class="{ 'justify-end': message.role === 'user' }"
          >
            <div
              class="max-w-[80%] p-4 rounded-2xl"
              :class="{
                'bg-blue-600/20 border border-blue-600/30': message.role === 'user',
                'bg-purple-600/20 border border-purple-600/30': message.role === 'assistant'
              }"
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider"
                  :class="{
                    'text-blue-400': message.role === 'user',
                    'text-purple-400': message.role === 'assistant'
                  }">
                  {{ message.role === 'user' ? 'Jij' : 'AI' }}
                </span>
                <span class="text-xs text-gray-500">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="text-white">
                {{ message.content }}
                <span v-if="message.isStreaming" class="text-purple-400 ml-1 animate-pulse">|</span>
              </div>
            </div>
          </div>

          <!-- Current transcription -->
          <div v-if="currentTranscription" class="flex gap-3 justify-end">
            <div class="max-w-[80%] p-4 rounded-2xl bg-blue-600/10 border border-blue-600/20 opacity-70">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider text-blue-300">Jij (spreekt...)</span>
              </div>
              <div class="text-gray-300">
                {{ currentTranscription }}
                <span class="text-blue-400 ml-1 animate-pulse">|</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Info -->
    <div class="flex gap-8 justify-center">
      <div class="flex gap-2 items-center text-sm">
        <span class="text-gray-400 font-medium">Whisper:</span>
        <span class="text-white font-semibold">Medium (NL)</span>
      </div>
      <div class="flex gap-2 items-center text-sm">
        <span class="text-gray-400 font-medium">LLM:</span>
        <span class="text-white font-semibold">{{ currentModel }}</span>
      </div>
      <div class="flex gap-2 items-center text-sm">
        <span class="text-gray-400 font-medium">Berichten:</span>
        <span class="text-white font-semibold">{{ conversationHistory.length }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

export default {
  name: 'ConversationInterface',
  emits: ['streaming-change', 'conversation-state-change'],
  setup(props, { emit }) {
    // Configuration
    const language = ref('nl')  // Always use Dutch
    const whisperModel = ref('medium')  // Always use medium model
    const currentModel = ref('llama2')
    const WHISPER_URL = 'ws://localhost:9090'
    const OLLAMA_URL = 'http://localhost:11434'

    // System prompt placeholder - you can customize this
    const SYSTEM_PROMPT = `Je bent een behulpzame AI-assistent die natuurlijke gesprekken voert in het Nederlands.
Je staat mevrouw Boelema te woord, zij is een gedeputeerde van de Provincie Noord-Brabant.
Je hebt een vriendelijke en professionele persoonlijkheid. Geef korte, duidelijke antwoorden die geschikt zijn voor spraakconversaties.
Vermijd lange uitleg tenzij specifiek gevraagd. Wees geduldig en begripvol.`

    // State
    const websocket = ref(null)
    const isConnected = ref(false)
    const isConnecting = ref(false)
    const isReconnecting = ref(false)  // New state for reconnections
    const serverError = ref(false)
    const errorMessage = ref('')
    const conversationState = ref('idle') // idle, listening, processing, responding, paused
    const conversationHistory = ref([])
    const currentTranscription = ref('')
    const silenceTimer = ref(null)
    const uid = ref(null)

    // Audio
    const audioContext = ref(null)
    const microphone = ref(null)
    const processor = ref(null)
    const stream = ref(null)
    const sampleRate = 16000
    const chunk = 4096
    const SILENCE_THRESHOLD = 2500 // Increase to 2.5 seconds for longer pauses
    const MIN_TRANSCRIPTION_LENGTH = 20 // Minimum characters before considering processing

    // Text change tracking
    const lastTranscriptionText = ref('')
    const lastTextChangeTime = ref(Date.now())

    // Computed
    const getStatusText = () => {
      if (serverError.value) return 'Fout'
      if (isConnecting.value) return 'Verbinden...'
      if (!isConnected.value) return 'Niet Verbonden'

      switch (conversationState.value) {
        case 'listening': return 'Luisteren...'
        case 'processing': return 'Verwerken...'
        case 'responding': return 'AI spreekt...'
        case 'paused': return 'Gepauzeerd'
        default: return 'Klaar'
      }
    }

    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    }

    // Generate unique ID
    const generateUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }

    // Check Ollama and get current model
    const checkOllamaConnection = async () => {
      try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`)
        if (!response.ok) {
          throw new Error('Ollama draait niet')
        }
        const data = await response.json()
        if (data.models && data.models.length > 0) {
          // Use the first available model
          currentModel.value = data.models[0].name
          console.log('Gebruik Ollama model:', currentModel.value)
        }
        return true
      } catch (error) {
        throw new Error('Ollama draait niet op localhost:11434')
      }
    }

    // Start conversation
    const startConversation = async () => {
      isConnecting.value = true
      serverError.value = false
      conversationHistory.value = []
      currentTranscription.value = ''

      try {
        // Check Ollama connection and get model
        await checkOllamaConnection()

        // Connect to WhisperLive
        await connectToWhisper()
      } catch (error) {
        serverError.value = true
        errorMessage.value = error.message
        isConnecting.value = false
      }
    }

    // Connect to WhisperLive
    const connectToWhisper = () => {
      return new Promise((resolve, reject) => {
        uid.value = generateUID()
        websocket.value = new WebSocket(WHISPER_URL)

        websocket.value.onopen = () => {
          console.log('WhisperLive verbonden')
          sendWhisperConfiguration()
          resolve()
        }

        websocket.value.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            handleWhisperMessage(message)
          } catch (error) {
            console.error('Fout bij verwerken bericht:', error)
          }
        }

        websocket.value.onerror = (error) => {
          console.error('WebSocket fout:', error)
          reject(new Error('Verbinding met WhisperLive mislukt'))
        }

        websocket.value.onclose = () => {
          console.log('WebSocket verbinding verbroken')
          stopConversation()
        }
      })
    }

    // Send WhisperLive configuration
    const sendWhisperConfiguration = () => {
      const config = {
        uid: uid.value,
        language: language.value,
        task: 'transcribe',
        model: whisperModel.value,
        use_vad: false,  // Disable VAD to prevent premature cutoffs
        max_clients: 4,
        max_connection_time: 600,
        send_last_n_segments: 10,  // Get more segments for better context
        no_speech_thresh: 0.6,  // Increase threshold to be less sensitive
        clip_audio: false,
        same_output_threshold: 10,
      }

      if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
        websocket.value.send(JSON.stringify(config))
        // Clear transcription when sending new config
        currentTranscription.value = ''
      }
    }

    // Handle WhisperLive messages
    const handleWhisperMessage = (message) => {
      // Log ALL messages from WhisperLive
      console.log('WhisperLive Bericht:', JSON.stringify(message, null, 2))

      if (message.uid && message.uid !== uid.value) return

      if (message.message === 'SERVER_READY') {
        isConnected.value = true
        isConnecting.value = false
        startListening()
        return
      }

      // Only process segments when we're actively listening
      if (message.segments && conversationState.value === 'listening') {
        console.log(`Verwerken ${message.segments.length} segmenten in '${conversationState.value}' status`)
        processTranscriptionSegments(message.segments)
      } else if (message.segments) {
        console.log(`Negeren ${message.segments.length} segmenten - niet in luister modus (huidig: ${conversationState.value})`)
      }
    }

    // Process transcription segments
    const processTranscriptionSegments = (segments) => {
      console.log('=== SEGMENTEN VERWERKEN ===')
      console.log('Aantal segmenten:', segments.length)

      // Log each segment in detail
      segments.forEach((segment, index) => {
        console.log(`Segment ${index}:`, {
          text: segment.text,
          start: segment.start,
          end: segment.end,
          completed: segment.completed,
          words: segment.words,
          // Log any other properties the segment might have
          ...segment
        })
      })

      // Build complete transcription from all segments
      let fullTranscription = ''

      for (const segment of segments) {
        if (segment.text && segment.text.trim()) {
          fullTranscription = segment.text.trim()
          // Keep updating with the latest full text
        }
      }

      console.log('Volledige transcriptie:', fullTranscription)
      console.log('Vorige transcriptie:', lastTranscriptionText.value)
      console.log('Tekst veranderd?', fullTranscription !== lastTranscriptionText.value)

      if (fullTranscription) {
        currentTranscription.value = fullTranscription

        // Only reset timer if text actually changed
        if (fullTranscription !== lastTranscriptionText.value && conversationState.value === 'listening') {
          console.log('Tekst veranderd - stilte timer resetten')
          lastTranscriptionText.value = fullTranscription
          lastTextChangeTime.value = Date.now()
          resetSilenceTimer()
        } else {
          console.log('Tekst onveranderd - stilte timer loopt door')
        }
      }
      console.log('=== EINDE VERWERKEN ===\n')
    }

    // Reset silence timer
    const resetSilenceTimer = () => {
      if (silenceTimer.value) {
        clearTimeout(silenceTimer.value)
        console.log('Bestaande stilte timer gewist')
      }

      console.log(`Nieuwe stilte timer starten voor ${SILENCE_THRESHOLD}ms`)
      silenceTimer.value = setTimeout(() => {
        console.log('STILTE TIMER AFGEGAAN - Invoer verwerken')
        if (currentTranscription.value && conversationState.value === 'listening') {
          processUserInput()
        }
      }, SILENCE_THRESHOLD)
    }

    // Process user input
    const processUserInput = async () => {
      if (!currentTranscription.value.trim() || conversationState.value !== 'listening') return

      const userText = currentTranscription.value.trim()

      // Don't process very short transcriptions that might be incomplete
      if (userText.length < MIN_TRANSCRIPTION_LENGTH) {
        console.log('Transcriptie te kort, wachten op meer:', userText.length, 'karakters')
        return
      }

      // Check if text ends mid-word (might indicate incomplete transcription)
      const lastChar = userText[userText.length - 1]
      const endsWithPunctuation = ['.', '!', '?', ','].includes(lastChar)
      const lastWord = userText.split(' ').pop()

      // If it doesn't end with punctuation and the last word seems incomplete, wait
      if (!endsWithPunctuation && lastWord && lastWord.length < 3) {
        console.log('Transcriptie lijkt onvolledig, wachten...')
        resetSilenceTimer() // Give it more time
        return
      }

      // Immediately clear the transcription and tracking
      currentTranscription.value = ''
      lastTranscriptionText.value = ''
      conversationState.value = 'processing'
      stopListening()

      // Clear any remaining silence timer
      if (silenceTimer.value) {
        clearTimeout(silenceTimer.value)
        silenceTimer.value = null
      }

      console.log('Gebruikersinvoer verwerken na stilte:', userText)

      // Add user message to history
      const userMessage = {
        role: 'user',
        content: userText,
        timestamp: Date.now()
      }
      conversationHistory.value.push(userMessage)

      // Get AI response (which will handle resuming listening)
      await getAIResponse(userMessage.content)
    }

    // Build conversation context with system prompt
    const buildConversationContext = (userInput) => {
      const messages = [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        }
      ]

      // Add conversation history (last 6 messages for context)
      const recentHistory = conversationHistory.value
        .filter(msg => !msg.isStreaming)
        .slice(-6)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))

      messages.push(...recentHistory)
      messages.push({ role: 'user', content: userInput })

      return messages
    }

    // Get AI response
    const getAIResponse = async (userInput) => {
      conversationState.value = 'responding'
      emit('conversation-state-change', 'responding')  // Notify parent that AI is responding

      // Add placeholder for AI response
      const aiMessage = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true
      }
      conversationHistory.value.push(aiMessage)
      const aiMessageIndex = conversationHistory.value.length - 1

      try {
        // Build conversation context with system prompt
        const messages = buildConversationContext(userInput)

        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: currentModel.value,
            messages: messages,
            stream: true,
            options: {
              temperature: 0.7,
              top_p: 0.9
            }
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP fout! status: ${response.status}`)
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
                if (data.message && data.message.content) {
                  conversationHistory.value[aiMessageIndex].content += data.message.content
                  scrollToBottom()
                }
              } catch (e) {
                console.warn('Kan JSON niet verwerken:', line)
              }
            }
          }
        }

      } catch (error) {
        conversationHistory.value[aiMessageIndex].content = `Fout: ${error.message}`
        console.error('Fout bij aanroepen Ollama:', error)
      } finally {
        conversationHistory.value[aiMessageIndex].isStreaming = false
        emit('conversation-state-change', 'idle')  // AI done responding
        conversationState.value = 'paused'

        // Reconnect to WhisperLive for a fresh start
        if (isConnected.value) {
          setTimeout(() => {
            reconnectWhisper()
          }, 1000)
        }
      }
    }

    // Reconnect to WhisperLive
    const reconnectWhisper = async () => {
      console.log('Herverbinden met WhisperLive voor nieuwe sessie...')

      isReconnecting.value = true  // Set reconnecting state

      // Close existing connection
      if (websocket.value) {
        websocket.value.close()
        websocket.value = null
      }

      // Stop any ongoing recording
      stopListening()

      // Clear transcription
      currentTranscription.value = ''

      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 500))

      // Reconnect
      try {
        await connectToWhisper()
        isReconnecting.value = false
      } catch (error) {
        console.error('Herverbinden mislukt:', error)
        isReconnecting.value = false
      }
    }

    // Start listening
    const startListening = async () => {
      if (conversationState.value === 'listening') return

      // Clear any existing transcription and reset tracking
      currentTranscription.value = ''
      lastTranscriptionText.value = ''
      lastTextChangeTime.value = Date.now()

      try {
        // Request microphone access
        stream.value = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 48000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false
          }
        })

        // Create audio context
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 48000
        })

        if (audioContext.value.state === 'suspended') {
          await audioContext.value.resume()
        }

        microphone.value = audioContext.value.createMediaStreamSource(stream.value)
        processor.value = audioContext.value.createScriptProcessor(chunk, 1, 1)

        processor.value.onaudioprocess = (event) => {
          if (conversationState.value !== 'listening') return

          const inputBuffer = event.inputBuffer
          const inputData = inputBuffer.getChannelData(0)

          // Resample to 16kHz
          const resampledData = downsampleBuffer(inputData, audioContext.value.sampleRate, sampleRate)
          const float32Buffer = new Float32Array(resampledData)

          if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
            websocket.value.send(float32Buffer.buffer)
          }
        }

        microphone.value.connect(processor.value)
        processor.value.connect(audioContext.value.destination)

        conversationState.value = 'listening'
        emit('conversation-state-change', 'listening')  // Notify parent that we're transcribing
        console.log('Luisteren gestart')

      } catch (error) {
        console.error('Fout bij starten opname:', error)
        serverError.value = true
        errorMessage.value = 'Fout bij toegang tot microfoon'
      }
    }

    // Stop listening
    const stopListening = () => {
      if (processor.value) {
        processor.value.disconnect()
        processor.value.onaudioprocess = null
        processor.value = null
      }

      if (microphone.value) {
        microphone.value.disconnect()
        microphone.value = null
      }

      if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop())
        stream.value = null
      }

      if (audioContext.value && audioContext.value.state !== 'closed') {
        audioContext.value.close()
        audioContext.value = null
      }

      if (silenceTimer.value) {
        clearTimeout(silenceTimer.value)
        silenceTimer.value = null
      }

      conversationState.value = 'paused'
      emit('conversation-state-change', 'idle')  // Notify parent we're idle
    }

    // Stop conversation
    const stopConversation = () => {
      stopListening()

      if (websocket.value) {
        websocket.value.close()
        websocket.value = null
      }

      isConnected.value = false
      isConnecting.value = false
      conversationState.value = 'idle'
      currentTranscription.value = ''
      emit('streaming-change', false)
    }

    // Downsample buffer
    const downsampleBuffer = (buffer, fromSampleRate, toSampleRate) => {
      if (fromSampleRate === toSampleRate) {
        return buffer
      }

      const sampleRateRatio = fromSampleRate / toSampleRate
      const newLength = Math.round(buffer.length / sampleRateRatio)
      const result = new Float32Array(newLength)

      let offsetResult = 0
      let offsetBuffer = 0

      while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio)
        let accum = 0
        let count = 0

        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
          accum += buffer[i]
          count++
        }

        result[offsetResult] = accum / count
        offsetResult++
        offsetBuffer = nextOffsetBuffer
      }

      return result
    }

    // Scroll to bottom of conversation
    const scrollToBottom = async () => {
      await nextTick()
      const container = document.querySelector('.overflow-y-auto')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }

    // Reconnect
    const reconnect = () => {
      serverError.value = false
      startConversation()
    }

    // Cleanup
    const cleanup = () => {
      stopConversation()
    }

    // Watch for conversation updates
    watch(conversationHistory, () => {
      scrollToBottom()
    }, { deep: true })

    onUnmounted(() => {
      cleanup()
    })

    return {
      // Data
      language,
      whisperModel,
      currentModel,
      isConnected,
      isConnecting,
      isReconnecting,
      serverError,
      errorMessage,
      conversationState,
      conversationHistory,
      currentTranscription,

      // Methods
      startConversation,
      stopConversation,
      reconnect,
      getStatusText,
      formatTime
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar for conversation */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Select styling */
select option {
  background-color: #1f2937;
  color: white;
}
</style>
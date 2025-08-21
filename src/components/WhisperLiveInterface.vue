// WhisperLiveInterface.vue - Dutch version with corrected audio handling
<template>
  <div class="w-full max-w-4xl mx-auto px-8 flex flex-col gap-8">
    <!-- Control Section -->
    <div class="flex gap-4 items-center justify-between">
      <div class="flex gap-4 items-center">
        <!-- Connect/Load Model Button -->
        <button
          v-if="!isConnected && !isConnecting"
          @click="connectToServer"
          class="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 border-0 rounded-xl px-8 py-4 text-white text-base font-semibold cursor-pointer transition-all duration-300 min-w-[180px] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30"
        >
          Laad Whisper Model
        </button>

        <!-- Connecting State -->
        <button
          v-else-if="isConnecting"
          disabled
          class="bg-gradient-to-r from-yellow-600 to-yellow-800 border-0 rounded-xl px-8 py-4 text-white text-base font-semibold cursor-not-allowed min-w-[180px] opacity-80"
        >
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Laden...
          </div>
        </button>

        <!-- Recording Button -->
        <button
          v-else
          @click="toggleRecording"
          :disabled="!isConnected || isWaiting"
          class="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-0 rounded-xl px-8 py-4 text-white text-base font-semibold cursor-pointer transition-all duration-300 min-w-[180px] disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg hover:enabled:shadow-red-600/30"
          :class="{ 'from-green-600 to-green-800 hover:from-green-500 hover:to-green-700': isRecording }"
        >
          {{ isRecording ? 'Stop Opname' : 'Start Opname' }}
        </button>

        <div class="flex gap-2 items-center">
          <div
            class="w-3 h-3 rounded-full"
            :class="{
              'bg-gray-400': !isConnected && !isConnecting,
              'bg-yellow-400 animate-pulse': isConnecting,
              'bg-green-400': isConnected && !isRecording,
              'bg-red-400 animate-pulse': isRecording,
              'bg-orange-400': isWaiting
            }"
          ></div>
          <span class="text-white text-sm font-medium">
            {{ getStatusText() }}
          </span>
        </div>
      </div>

      <!-- Settings -->
      <div class="flex gap-4 items-center">


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


        <!-- Disconnect button when connected -->
        <button
          v-if="isConnected"
          @click="disconnect"
          :disabled="isRecording"
          class="bg-gray-600 hover:bg-gray-500 border-0 rounded-lg px-3 py-2 text-white text-sm font-medium cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Verbreek Verbinding
        </button>
      </div>
    </div>

    <!-- Transcription Display -->
    <div class="min-h-[300px]">
      <div class="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[300px] backdrop-blur-md relative">
        <div class="text-white text-lg leading-relaxed">
          <div v-if="serverError" class="text-center text-red-400 mt-20">
            <p>{{ errorMessage }}</p>
            <button @click="reconnect" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">
              Probeer Opnieuw
            </button>
          </div>
          <div v-else-if="!isConnected && !isConnecting" class="text-center text-gray-500 italic mt-20">
            <div class="mb-4">
              <div class="text-4xl mb-2">🎤</div>
              <p>Klik "Laad Whisper Model" om verbinding te maken met de Whisper Machine</p>
<!--              <p class="text-sm mt-2 opacity-75">Zorg ervoor dat de WhisperLive server draait op localhost:9090</p>-->
            </div>
          </div>
          <div v-else-if="isConnecting" class="text-center text-yellow-400 mt-20">
            <div class="flex justify-center items-center mb-4">
              <div class="w-8 h-8 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p>Whisper model wordt geladen...</p>
            <p class="text-sm mt-2 opacity-75">Dit kan even duren</p>
          </div>
          <div v-else-if="isWaiting" class="text-center text-yellow-400 mt-20">
            Server is bezet. Een moment geduld...
          </div>
          <div v-else-if="transcriptionSegments.length === 0 && !isRecording" class="text-center text-gray-500 italic mt-20">
            Klik "Start Opname" om live transcriptie te beginnen
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(segment, index) in displaySegments"
              :key="index"
              class="p-3 bg-white/5 rounded-lg border-l-4 border-red-500/50 transition-all duration-300"
            >
              {{ segment }}
            </div>
            <div v-if="currentSegment" class="p-3 bg-white/10 rounded-lg border-l-4 border-yellow-500 text-yellow-100">
              {{ currentSegment }}
              <span class="text-yellow-400 ml-1 animate-pulse">|</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Info -->
    <div class="flex gap-8 justify-center">
      <div class="flex gap-2 items-center text-sm">
        <span class="text-gray-400 font-medium">Model:</span>
        <span class="text-white font-semibold">{{ model }}</span>
      </div>
      <div class="flex gap-2 items-center text-sm">
        <span class="text-gray-400 font-medium">Taal:</span>
        <span class="text-white font-semibold">{{ getLanguageDisplayName() }}</span>
      </div>
      <div class="flex gap-2 items-center text-sm">
        <span class="text-gray-400 font-medium">Pakketten:</span>
        <span class="text-white font-semibold">{{ packetsSent }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'WhisperLiveInterface',
  emits: ['streaming-change'],
  setup(props, { emit }) {
    // Configuration - Fixed to Dutch and medium model
    const serverHost = ref('localhost')
    const serverPort = ref(9090)
    const language = ref('nl')
    const model = ref('medium')
    const useVAD = ref(false)

    // State
    const websocket = ref(null)
    const isConnected = ref(false)
    const isConnecting = ref(false)
    const isRecording = ref(false)
    const isWaiting = ref(false)
    const serverError = ref(false)
    const errorMessage = ref('')
    const connectionStatus = ref('disconnected')
    const transcriptionSegments = ref([])
    const currentSegment = ref('')
    const packetsSent = ref(0)

    // Audio
    const audioContext = ref(null)
    const microphone = ref(null)
    const processor = ref(null)
    const uid = ref(null)
    const stream = ref(null)

    // Audio settings - exact same as Python client
    const sampleRate = 16000
    const chunk = 4096

    let reconnectAttempts = 0
    const maxReconnectAttempts = 3

    // Computed
    const displaySegments = computed(() => {
      return transcriptionSegments.value.slice(-5)
    })

    const getStatusText = () => {
      if (serverError.value) return 'Fout'
      if (isConnecting.value) return 'Model Laden...'
      if (isWaiting.value) return 'Wachten...'
      if (!isConnected.value) return 'Niet Verbonden'
      if (isRecording.value) return 'Opnemen...'
      return 'Klaar'
    }

    const getLanguageDisplayName = () => {
      return 'Nederlands'
    }

    // Generate unique ID
    const generateUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }

    // WebSocket connection
    const connectToServer = () => {
      if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
        websocket.value.close()
      }

      const wsUrl = `ws://${serverHost.value}:${serverPort.value}`

      isConnecting.value = true
      connectionStatus.value = 'connecting'
      serverError.value = false
      uid.value = generateUID()
      packetsSent.value = 0

      // Clear previous transcription
      transcriptionSegments.value = []
      currentSegment.value = ''

      websocket.value = new WebSocket(wsUrl)

      websocket.value.onopen = () => {
        console.log('WebSocket verbonden')
        sendConfiguration()
      }

      websocket.value.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleServerMessage(message)
        } catch (error) {
          console.error('Fout bij verwerken bericht:', error)
        }
      }

      websocket.value.onerror = (error) => {
        console.error('WebSocket fout:', error)
        isConnecting.value = false
        connectionStatus.value = 'disconnected'
        serverError.value = true
        errorMessage.value = 'Verbinding mislukt. Zorg ervoor dat de WhisperLive server draait op localhost:9090'
        isConnected.value = false
      }

      websocket.value.onclose = (event) => {
        console.log('WebSocket verbinding verbroken:', event.code, event.reason)
        isConnected.value = false
        isConnecting.value = false
        connectionStatus.value = 'disconnected'
        stopRecording()
      }
    }

    const disconnect = () => {
      if (websocket.value) {
        websocket.value.close()
      }
      isConnected.value = false
      isConnecting.value = false
      connectionStatus.value = 'disconnected'
      stopRecording()
    }

    const sendConfiguration = () => {
      const config = {
        uid: uid.value,
        language: language.value,
        task: 'transcribe',
        model: model.value,
        use_vad: useVAD.value,
        max_clients: 4,
        max_connection_time: 600,
        send_last_n_segments: 10,
        no_speech_thresh: 0.45,
        clip_audio: false,
        same_output_threshold: 10,
      }

      if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
        websocket.value.send(JSON.stringify(config))
        console.log('Configuratie verzonden:', config)
      }
    }

    const handleServerMessage = (message) => {
      if (message.uid && message.uid !== uid.value) {
        return
      }

      // Handle status messages
      if (message.status) {
        handleStatusMessage(message)
        return
      }

      // Handle disconnect
      if (message.message === 'DISCONNECT') {
        console.log('Server verbinding verbroken wegens tijdsoverschrijding')
        stopRecording()
        return
      }

      // Handle server ready
      if (message.message === 'SERVER_READY') {
        console.log(`Server klaar met backend: ${message.backend}`)
        isConnected.value = true
        isConnecting.value = false
        connectionStatus.value = 'connected'
        isWaiting.value = false
        reconnectAttempts = 0
        return
      }

      // Handle language detection
      if (message.language) {
        console.log(`Server detecteerde taal: ${message.language}`)
        return
      }

      // Handle transcription segments
      if (message.segments) {
        processTranscriptionSegments(message.segments)
      }
    }

    const handleStatusMessage = (message) => {
      const status = message.status

      switch (status) {
        case 'WAIT':
          isWaiting.value = true
          break
        case 'ERROR':
          serverError.value = true
          errorMessage.value = message.message
          console.error(`Server fout: ${message.message}`)
          break
        case 'WARNING':
          console.warn(`Server waarschuwing: ${message.message}`)
          break
      }
    }

    const processTranscriptionSegments = (segments) => {
      for (const segment of segments) {
        if (segment.text && segment.text.trim()) {
          const text = segment.text.trim()

          if (segment.completed === false) {
            // This is an incomplete/partial segment
            currentSegment.value = text
          } else {
            // This is a completed segment
            if (!transcriptionSegments.value.includes(text)) {
              transcriptionSegments.value.push(text)
              currentSegment.value = ''

              // Keep only last 10 segments
              if (transcriptionSegments.value.length > 10) {
                transcriptionSegments.value = transcriptionSegments.value.slice(-10)
              }
            }
          }
        }
      }
    }

    const toggleRecording = async () => {
      if (isRecording.value) {
        stopRecording()
      } else {
        await startRecording()
      }
    }

    const startRecording = async () => {
      try {
        // Request microphone access
        stream.value = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 48000, // Use native sample rate
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

        // Create script processor with the chunk size
        processor.value = audioContext.value.createScriptProcessor(chunk, 1, 1)

        processor.value.onaudioprocess = (event) => {
          if (!isRecording.value) return

          const inputBuffer = event.inputBuffer
          const inputData = inputBuffer.getChannelData(0)

          // Convert to the exact same format as Python client
          // Python: audio_array = self.bytes_to_float_array(data)
          // Then: self.multicast_packet(audio_array.tobytes())

          // First resample to 16kHz to match WhisperLive expectations
          const resampledData = downsampleBuffer(inputData, audioContext.value.sampleRate, sampleRate)

          // Send as Float32Array buffer (equivalent to numpy float32 array.tobytes())
          const float32Buffer = new Float32Array(resampledData)

          if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
            websocket.value.send(float32Buffer.buffer)
            packetsSent.value++
          }
        }

        microphone.value.connect(processor.value)
        processor.value.connect(audioContext.value.destination)

        isRecording.value = true
        emit('streaming-change', true)
        console.log('Opname gestart met sample rate:', audioContext.value.sampleRate)

      } catch (error) {
        console.error('Fout bij starten opname:', error)
        serverError.value = true
        errorMessage.value = 'Fout bij toegang tot microfoon. Controleer de toestemmingen.'
      }
    }

    const stopRecording = () => {
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

      isRecording.value = false
      emit('streaming-change', false)
      console.log('Opname gestopt')
    }

    // Simple downsampling function
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

    const reconnect = () => {
      serverError.value = false
      reconnectAttempts = 0
      connectToServer()
    }

    const cleanup = () => {
      stopRecording()
      if (websocket.value) {
        websocket.value.close()
      }
    }

    onMounted(() => {
      console.log('WhisperLive component geladen - wachten op gebruiker om verbinding te maken')
    })

    onUnmounted(() => {
      cleanup()
    })

    return {
      // Data
      language,
      model,
      isConnected,
      isConnecting,
      isRecording,
      isWaiting,
      serverError,
      errorMessage,
      connectionStatus,
      transcriptionSegments,
      currentSegment,
      displaySegments,
      packetsSent,

      // Methods
      toggleRecording,
      connectToServer,
      disconnect,
      reconnect,
      getStatusText,
      getLanguageDisplayName
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
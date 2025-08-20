<template>
  <div class="story-container">
    <!-- Progress indicator -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
      <div class="progress-dots">
        <button
          v-for="(scene, index) in scenes"
          :key="index"
          @click="currentSceneIndex = index"
          class="progress-dot"
          :class="{
            active: index === currentSceneIndex,
            visited: index < currentSceneIndex
          }"
          :title="scene.title"
        ></button>
      </div>
    </div>

    <!-- Scene content -->
    <transition name="fade" mode="out-in">
      <div :key="currentSceneIndex" class="scene-wrapper">

        <!-- All scenes now use the same unified container -->
        <div
          class="scene-content-unified"
          :class="{ 'has-background': currentScene.backgroundImage }"
          :style="currentScene.backgroundImage ? { '--bg-image': `url(${currentScene.backgroundImage})` } : {}"
        >

          <!-- Hero scene -->
          <div v-if="currentScene.type === 'hero'" class="unified-hero-content">
            <div class="hero-content">
              <h1 class="hero-title">{{ currentScene.title }}</h1>
              <p class="hero-description">
                <span class="typewriter-text">{{ displayedText }}</span>
                <span class="cursor" :class="{ 'visible': showCursor }">|</span>
              </p>
              <button @click="nextScene" class="hero-cta">
                {{ currentScene.ctaText || 'Start Journey' }} →
              </button>
            </div>
          </div>

          <!-- Default text scene -->
          <div v-else-if="!currentScene.type || currentScene.type === 'text'" class="unified-text-content">
            <div class="scene-text">
              <h2 class="scene-title">{{ currentScene.title }}</h2>
              <p class="scene-description">{{ currentScene.description }}</p>

              <ul v-if="currentScene.points" class="scene-points">
                <li v-for="(point, idx) in currentScene.points" :key="idx">
                  {{ point }}
                </li>
              </ul>
            </div>

            <div class="unified-navigation">
              <div class="scene-navigation">
                <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
                  ← Vorige
                </button>
                <span class="scene-counter">{{ currentSceneIndex + 1 }} / {{ scenes.length }}</span>
                <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
                  Volgende →
                </button>
              </div>
            </div>
          </div>

          <!-- Stats showcase scene -->
          <div v-else-if="currentScene.type === 'stats'" class="unified-stats-content">
            <h2 class="scene-title">{{ currentScene.title }}</h2>
            <div class="stats-grid">
              <div v-for="stat in currentScene.stats" :key="stat.label" class="stat-card">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
                <div v-if="stat.detail" class="stat-detail">{{ stat.detail }}</div>
              </div>
            </div>
            <div class="unified-navigation">
              <div class="scene-navigation">
                <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
                  ← Vorige
                </button>
                <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
                  Volgende →
                </button>
              </div>
            </div>
          </div>

          <!-- Images showcase scene -->
          <div v-else-if="currentScene.type === 'images'" class="unified-images-content">
            <h2 class="scene-title">{{ currentScene.title }}</h2>
            <div class="images-grid">
              <div v-for="image in currentScene.images" :key="image.alt" class="image-card">
                <img :src="image.src" :alt="image.alt" class="performance-image" />
                <div class="image-caption">{{ image.caption }}</div>
              </div>
            </div>
            <div class="unified-navigation">
              <div class="scene-navigation">
                <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
                  ← Vorige
                </button>
                <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
                  Volgende →
                </button>
              </div>
            </div>
          </div>

          <!-- UTP Connection scene -->
          <div v-else-if="currentScene.type === 'utp'" class="unified-utp-content">
            <h2 class="scene-title">{{ currentScene.title }}</h2>
            <p class="scene-description">{{ currentScene.description }}</p>

            <div class="utp-visualization">
              <div class="pc-box left-pc">
                <div class="pc-label">LLM Machine</div>
                <div class="pc-icon">💻</div>
              </div>

              <div class="utp-cable">
                <div class="cable-line"></div>
                <div class="data-flow"></div>
                <div class="cable-label">UTP ethernet Kabel</div>
              </div>

              <div class="pc-box right-pc">
                <div class="pc-label">Whisper Machine</div>
                <div class="pc-icon">💻</div>
              </div>
            </div>

            <ul v-if="currentScene.points" class="scene-points">
              <li v-for="(point, idx) in currentScene.points" :key="idx">
                {{ point }}
              </li>
            </ul>

            <div class="unified-navigation">
              <div class="scene-navigation">
                <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
                  ← Vorige
                </button>
                <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
                  Volgende →
                </button>
              </div>
            </div>
          </div>

          <!-- Chat interface scene -->
          <div v-else-if="currentScene.type === 'chat'" class="unified-chat-content">
            <div class="scene-header">
              <h2 class="scene-title">{{ currentScene.title }}</h2>
              <p class="scene-subtitle">{{ currentScene.description }}</p>
            </div>

            <ChatInterface
              v-if="currentScene.type === 'chat'"
              @streaming-change="handleStreamingChange"
            />

            <div class="unified-navigation-minimal">
              <div class="scene-navigation-minimal">
                <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
                  ← Terug
                </button>
                <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
                  Doorgaan →
                </button>
              </div>
            </div>
          </div>

          <!-- WhisperLive interface scene -->
          <div v-else-if="currentScene.type === 'whisper'" class="unified-chat-content">
            <div class="scene-header">
              <h2 class="scene-title">{{ currentScene.title }}</h2>
              <p class="scene-subtitle">{{ currentScene.description }}</p>
            </div>

            <WhisperLiveInterface
              v-if="currentScene.type === 'whisper'"
              @streaming-change="handleStreamingChange"
            />

            <div class="unified-navigation-minimal">
              <div class="scene-navigation-minimal">
                <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
                  ← Terug
                </button>
                <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
                  Doorgaan →
                </button>
              </div>
            </div>
          </div>

          <!-- Conversation interface scene -->
          <div v-else-if="currentScene.type === 'conversation'" class="unified-chat-content">
            <div class="scene-header">
              <h2 class="scene-title">{{ currentScene.title }}</h2>
              <p class="scene-subtitle">{{ currentScene.description }}</p>
            </div>

            <ConversationInterface
              v-if="currentScene.type === 'conversation'"
              @streaming-change="handleStreamingChange"
              @conversation-state-change="handleConversationStateChange"
            />

            <div class="unified-navigation-minimal">
              <div class="scene-navigation-minimal">
                <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
                  ← Terug
                </button>
                <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
                  Doorgaan →
                </button>
              </div>
            </div>
          </div>

          <!-- Split view scene -->
          <div v-else-if="currentScene.type === 'split'" class="unified-split-content">
            <div class="split-left">
              <h2 class="scene-title">{{ currentScene.title }}</h2>
              <p class="scene-description">{{ currentScene.description }}</p>
              <div v-if="currentScene.code" class="code-block">
                <pre><code>{{ currentScene.code }}</code></pre>
              </div>
            </div>
            <div class="split-right">
              <div v-if="currentScene.image" class="image-container">
                <img :src="currentScene.image" :alt="currentScene.imageAlt" class="split-image" />
              </div>
              <div v-else class="visual-demo">
                <div v-for="i in 5" :key="i" class="demo-bar" :style="{
                  height: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.1}s`
                }"></div>
              </div>
            </div>

            <!-- Navigation positioned absolutely at bottom -->
            <div class="unified-navigation" style="position: absolute; bottom: 1rem; left: 1rem; right: 1rem;">
              <div class="scene-navigation-bottom">
                <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
                  ← Vorige
                </button>
                <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
                  Volgende →
                </button>
              </div>
            </div>
          </div>

          <!-- Split view scene (reversed layout) -->
          <div v-else-if="currentScene.type === 'split-reverse'" class="unified-split-content">
            <div class="split-left">
              <div v-if="currentScene.image" class="image-container">
                <img :src="currentScene.image" :alt="currentScene.imageAlt" class="split-image" />
              </div>
            </div>
            <div class="split-right">
              <h2 class="scene-title">{{ currentScene.title }}</h2>
              <p class="scene-description">{{ currentScene.description }}</p>
              <div v-if="currentScene.code" class="code-block">
                <pre><code>{{ currentScene.code }}</code></pre>
              </div>
            </div>

            <!-- Navigation positioned absolutely at bottom -->
            <div class="unified-navigation" style="position: absolute; bottom: 1rem; left: 1rem; right: 1rem;">
              <div class="scene-navigation-bottom">
                <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
                  ← Vorige
                </button>
                <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
                  Volgende →
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import ChatInterface from './ChatInterface.vue'
import WhisperLiveInterface from './WhisperLiveInterface.vue'
import ConversationInterface from './ConversationInterface.vue'

export default {
  name: 'StoryScene',
  components: {
    ChatInterface,
    WhisperLiveInterface,
    ConversationInterface
  },
  emits: ['scene-change', 'blob-state-change'],
  setup(props, { emit }) {
    const currentSceneIndex = ref(0)

    // Typewriter effect state
    const displayedText = ref('')
    const showCursor = ref(true)
    const typewriterTimeout = ref(null)
    const fullText = "Een reis door lokale AI-verwerking"
    const typingSpeed = 80 // milliseconds per character
    const deletingSpeed = 50 // milliseconds per character
    const pauseBetweenCycles = 2000 // pause before starting to delete
    const pauseBeforeRetyping = 1000 // pause before starting to type again

    // Enhanced scenes with different types
    const scenes = [
      {
        type: 'hero',
        title: "AI op Legacy Hardware",
        description: "Een reis door lokale AI-verwerking",
        blobState: "normal",
        ctaText: "Begin Experience"
      },
      {
        type: 'text',
        title: "Fat Clients van Team Geo",
        description: "Van 2000 tot 2025 gebruikte Team Geo krachtige werkstations voor geografische berekeningen. Deze 'fat clients' waren uitgerust met GPU's voor complexe visualisaties en data-analyse.",
        blobState: "normal",
        backgroundImage: "src/assets/kaart.png",
        points: [
          "25 jaar ervaring met GPU-versnelde berekeningen",
          "Geo-workloads: van kaartprojectie tot ruimtelijke analyse",
          "Parallelle verwerking van grote datasets",
          "Matrix-operaties voor transformaties en filtering"
        ]
      },
      {
        type: 'split',
        title: "Links: De LLM Machine",
        description: "Deze PC host een Large Language Model dat tekst begrijpt en genereert door woorden om te zetten naar vectoren in een multidimensionale ruimte.",
        blobState: "left",
        code: `// Word naar vector transformatie
const wordVector = embedding_layer(token);
// [0.2, -0.8, 0.1, 0.9, ...]
// Attention mechanism
const attention = softmax(
  query * key_transpose / sqrt(dim));
`,
        image: "src/assets/vectors.jpeg",
        imageAlt: "LLM Word Vector Visualization"
      },
      {
        type: 'split-reverse',
        title: "Rechts: De Whisper Machine",
        description: "Deze PC transcribeert spraak naar tekst met OpenAI's Whisper model. Audio wordt omgezet naar spectrogrammen en vervolgens gedecodeerd naar woorden.",
        blobState: "right",
        code: `// Audio preprocessing
const spectrogram = melSpectrogram(audio);
// 80 mel-frequency bins
// Encoder-decoder architectuur
const encoded = encoder(spectrogram);
const tokens = decoder(encoded);`,
        image: "src/assets/Spectrograms.jpg",
        imageAlt: "Whisper Audio Processing Pipeline"
      },
      {
        type: 'utp',
        title: "Lokale AI Verwerking",
        description: "De computers hebben geen internetverbinding en communiceren alleen via een UTP-kabel. Alle AI-verwerking gebeurt lokaal, zonder externe afhankelijkheden.",
        blobState: "normal",
        points: [
          "Geen internetverbinding - volledig offline systeem",
          "Directe communicatie via UTP ethernet kabel",
          "Alle data blijft lokaal en privé"
        ]
      },
      {
        type: 'chat',
        title: "Probeer het Zelf",
        // description: "Ervaar de AI in actie. Stel elke vraag!",
        blobState: "left"
      },
      {
        type: 'whisper',
        title: "Real-time Spraakherkenning",
        description: "Ervaar live spraak-naar-tekst transcriptie met OpenAI's Whisper model dat lokaal draait.",
        blobState: "right"
      },
      {
        type: 'conversation',
        title: "Spraakconversatie met AI",
        description: "Voer een natuurlijk gesprek met de AI via je stem. Spreek natuurlijk en de AI zal antwoorden.",
        blobState: "normal"
      },
      {
        type: 'split',
        title: "Onder de Motorkap",
        description: "De systeemarchitectuur die het mogelijk maakt",
        blobState: "right",
        code: `// Vereenvoudigde inference loop
async function verwerkVraag(input) {
  const tokens = tokenize(input);
  const embeddings = embed(tokens);
  const response = await model.generate(embeddings);
  return decode(response);
}`
      },
      {
        type: 'text',
        title: "De Toekomst",
        description: "Deze demonstratie toont dat krachtige AI niet altijd de nieuwste hardware vereist. Soms werken de oude methodes nog het beste.",
        blobState: "normal",
        points: [
          "Democratiseren van AI-toegang",
          "Verminderen van elektronisch afval",
          "Versterken van lokale berekeningen",
          "Behoud van privacy en controle",
          "Duurzame technologie-innovatie"
        ]
      }
    ]

    const currentScene = computed(() => scenes[currentSceneIndex.value])
    const progressPercentage = computed(() =>
      ((currentSceneIndex.value + 1) / scenes.length) * 100
    )

    const nextScene = () => {
      if (currentSceneIndex.value < scenes.length - 1) {
        currentSceneIndex.value++
      }
    }

    const previousScene = () => {
      if (currentSceneIndex.value > 0) {
        currentSceneIndex.value--
      }
    }

    // Typewriter effect functions
    const startTypewriter = () => {
      stopTypewriter() // Clear any existing timeouts

      let currentIndex = 0
      let isDeleting = false

      const typeStep = () => {
        if (!isDeleting) {
          // Typing forward
          displayedText.value = fullText.substring(0, currentIndex + 1)
          currentIndex++

          if (currentIndex > fullText.length) {
            // Finished typing, wait then start deleting
            typewriterTimeout.value = setTimeout(() => {
              isDeleting = true
              typeStep()
            }, pauseBetweenCycles)
            return
          }
        } else {
          // Deleting backward
          displayedText.value = fullText.substring(0, currentIndex - 1)
          currentIndex--

          if (currentIndex <= 0) {
            // Finished deleting, wait then start typing again
            typewriterTimeout.value = setTimeout(() => {
              isDeleting = false
              currentIndex = 0
              typeStep()
            }, pauseBeforeRetyping)
            return
          }
        }

        // Continue with next character
        const delay = isDeleting ? deletingSpeed : typingSpeed
        typewriterTimeout.value = setTimeout(typeStep, delay)
      }

      // Start the animation
      typeStep()
    }

    const stopTypewriter = () => {
      if (typewriterTimeout.value) {
        clearTimeout(typewriterTimeout.value)
        typewriterTimeout.value = null
      }
    }

    // Cursor blinking effect
    const startCursorBlink = () => {
      setInterval(() => {
        showCursor.value = !showCursor.value
      }, 500)
    }

    const handleStreamingChange = (isStreaming) => {
      // Update blob state based on streaming and scene type
      if (currentScene.value.type === 'whisper') {
        // Whisper scene: blobs go right when streaming
        const targetState = isStreaming ? 'right' : 'normal'
        emit('blob-state-change', targetState)
      } else if (currentScene.value.type === 'conversation') {
        // Conversation scene: different states for listening vs responding
        // When streaming is true, we're either transcribing (right) or AI is responding (left)
        // We need to check the conversation state to determine which
        // For now, we'll use a pattern where transcribing goes right, AI response goes left
        const targetState = isStreaming ? 'right' : 'normal'
        emit('blob-state-change', targetState)
      } else if (currentScene.value.type === 'chat') {
        // Chat scene: blobs go left when AI is responding
        const targetState = isStreaming ? 'left' : 'normal'
        emit('blob-state-change', targetState)
      }
    }

    // Keyboard navigation
    const handleKeypress = (e) => {
      // Disable keyboard nav during chat, whisper, and conversation scenes
      if (currentScene.value.type === 'chat' ||
          currentScene.value.type === 'whisper' ||
          currentScene.value.type === 'conversation') return

      if (e.key === 'ArrowRight') nextScene()
      if (e.key === 'ArrowLeft') previousScene()
    }

    // Watch for scene changes
    watch(currentSceneIndex, (newIndex) => {
      const scene = scenes[newIndex]
      emit('scene-change', scene)
      emit('blob-state-change', scene.blobState)

      // Start/stop typewriter effect for hero scene
      if (scene.type === 'hero') {
        startTypewriter()
      } else {
        stopTypewriter()
      }
    })

    onMounted(() => {
      window.addEventListener('keydown', handleKeypress)
      emit('scene-change', currentScene.value)
      emit('blob-state-change', currentScene.value.blobState)

      // Start cursor blinking
      startCursorBlink()

      // Start typewriter if starting on hero scene
      if (currentScene.value.type === 'hero') {
        startTypewriter()
      }
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeypress)
      stopTypewriter()
    })

    const handleConversationStateChange = (state) => {
      // Handle conversation-specific state changes
      if (state === 'listening') {
        // User is speaking - blobs go right
        emit('blob-state-change', 'right')
      } else if (state === 'responding') {
        // AI is responding - blobs go left
        emit('blob-state-change', 'left')
      } else {
        // Idle/paused - blobs return to normal
        emit('blob-state-change', 'normal')
      }
    }

    return {
      scenes,
      currentSceneIndex,
      currentScene,
      progressPercentage,
      nextScene,
      previousScene,
      handleStreamingChange,
      handleConversationStateChange,
      displayedText,
      showCursor
    }
  }
}
</script>

<style scoped>
.story-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Progress bar */
.progress-bar {
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-bottom: 3rem;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #dd0000 0%, #ff6666 100%);
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-dots {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}

.progress-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.progress-dot:hover {
  transform: scale(1.2);
  background: rgba(255, 255, 255, 0.5);
}

.progress-dot.active {
  background: #fff;
  border-color: #fff;
  transform: scale(1.3);
}

.progress-dot.visited {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.8);
}

/* Scene wrapper */
.scene-wrapper {
  min-height: 500px;
}

/* UNIFIED CONTAINER - All scenes use this */
.scene-content-unified {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 3rem;
  min-height: 700px;
  max-height: 700px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
  position: relative;
}

/* Background image variant */
.scene-content-unified.has-background {
  position: relative;
}

.scene-content-unified.has-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.25;
  border-radius: 20px;
  pointer-events: none;
  z-index: 0;
}

.scene-content-unified.has-background > * {
  position: relative;
  z-index: 1;
}

/* Specific layouts within the unified container */
.unified-hero-content {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
}

.unified-text-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.unified-stats-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.unified-images-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.unified-utp-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.unified-split-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  flex: 1;
  position: relative;
}

.unified-chat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* UTP Visualization */
.utp-visualization {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
  flex: 1;
  min-height: 200px;
}

.pc-box {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  min-width: 150px;
  transition: all 0.3s ease;
}

.pc-box:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-5px);
}

.left-pc {
  border-color: rgba(255, 102, 102, 0.5);
}

.right-pc {
  border-color: rgba(102, 255, 102, 0.5);
}

.pc-label {
  color: white;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.pc-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.utp-cable {
  position: relative;
  flex: 1;
  height: 60px;
  margin: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cable-line {
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, #ff6666 0%, #66ff66 100%);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.data-flow {
  position: absolute;
  top: 0;
  left: -20px;
  width: 40px;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
  animation: data-flow 2s ease-in-out infinite;
}

.cable-label {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

@keyframes data-flow {
  0% { left: -20px; }
  100% { left: 100%; }
}

/* Navigation positioning for unified container */
.unified-navigation {
  margin-top: auto;
  padding-top: 2rem;
  flex-shrink: 0;
}

.unified-navigation-minimal {
  margin-top: auto;
  padding-top: 1rem;
  flex-shrink: 0;
}

/* Scene content styles */
.scene-text {
  flex: 1;
}

.scene-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.scene-description {
  font-size: 1.25rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.scene-points {
  list-style: none;
  padding: 0;
  margin: 0;
}

.scene-points li {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.scene-points li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: #ff6666;
  font-weight: bold;
}

/* Hero scene styles */
.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  color: white;
  margin-bottom: 2rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4);
  line-height: 1.1;
}

.hero-description {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  line-height: 1.6;
  min-height: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.typewriter-text {
  display: inline;
}

.cursor {
  display: inline-block;
  color: #ff6666;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.1s ease;
}

.cursor.visible {
  opacity: 1;
}

.hero-cta {
  background: linear-gradient(135deg, #dd0000 0%, #ff6666 100%);
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(221, 0, 0, 0.3);
}

.hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(221, 0, 0, 0.4);
}

/* Scene header for chat interfaces */
.scene-header {
  text-align: center;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.scene-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
}

/* Images scene */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
  flex: 1;
}

.image-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  overflow: hidden;
}

.image-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.performance-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.image-caption {
  font-size: 1rem;
  color: white;
  font-weight: 600;
  line-height: 1.4;
}

/* Split scene image container */
.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1rem;
}

.split-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
  flex: 1;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.stat-value {
  font-size: 3rem;
  font-weight: 800;
  color: #ff6666;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  color: white;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.stat-detail {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

/* Split scene adjustments */
.split-left, .split-right {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
}

.code-block {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: 2rem;
  font-family: 'Monaco', 'Consolas', monospace;
}

.code-block pre {
  margin: 0;
  color: #fff;
  font-size: 0.9rem;
  line-height: 1.5;
}

.visual-demo {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 300px;
  padding: 2rem;
}

.demo-bar {
  width: 40px;
  background: linear-gradient(to top, #ff6666, #dd0000);
  border-radius: 5px 5px 0 0;
  animation: pulse-height 2s ease-in-out infinite;
}

@keyframes pulse-height {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Navigation variants */
.scene-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scene-navigation-minimal {
  display: flex;
  justify-content: space-between;
}

.scene-navigation-bottom {
  display: flex;
  justify-content: space-between;
}

.nav-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.scene-counter {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

/* Keyboard hint */
.keyboard-hint {
  text-align: center;
  margin-top: 2rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Responsive */
@media (max-width: 768px) {
  .story-container {
    padding: 1rem;
  }

  .scene-content-unified {
    padding: 2rem;
    min-height: 400px;
  }

  .scene-title {
    font-size: 2rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .unified-split-content {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .utp-visualization {
    flex-direction: column;
    gap: 2rem;
  }

  .utp-cable {
    transform: rotate(90deg);
    width: 60px;
    margin: 1rem 0;
  }

  .cable-label {
    transform: translateX(-50%) rotate(-90deg);
  }
}
</style>
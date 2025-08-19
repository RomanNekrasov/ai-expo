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
        <!-- Default text scene -->
        <div v-if="!currentScene.type || currentScene.type === 'text'" class="scene-content">
          <div class="scene-text">
            <h2 class="scene-title">{{ currentScene.title }}</h2>
            <p class="scene-description">{{ currentScene.description }}</p>

            <ul v-if="currentScene.points" class="scene-points">
              <li v-for="(point, idx) in currentScene.points" :key="idx">
                {{ point }}
              </li>
            </ul>
          </div>

          <div class="scene-navigation">
            <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
              ← Previous
            </button>
            <span class="scene-counter">{{ currentSceneIndex + 1 }} / {{ scenes.length }}</span>
            <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
              Next →
            </button>
          </div>
        </div>

        <!-- Chat interface scene -->
        <div v-else-if="currentScene.type === 'chat'" class="scene-content-full">
          <div class="scene-header">
            <h2 class="scene-title">{{ currentScene.title }}</h2>
            <p class="scene-subtitle">{{ currentScene.description }}</p>
          </div>

          <ChatInterface
            v-if="currentScene.type === 'chat'"
            @streaming-change="handleStreamingChange"
          />

          <div class="scene-navigation-minimal">
            <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
              ← Back
            </button>
            <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
              Continue →
            </button>
          </div>
        </div>

        <!-- WhisperLive interface scene -->
        <div v-else-if="currentScene.type === 'whisper'" class="scene-content-full">
          <div class="scene-header">
            <h2 class="scene-title">{{ currentScene.title }}</h2>
            <p class="scene-subtitle">{{ currentScene.description }}</p>
          </div>

          <WhisperLiveInterface
            v-if="currentScene.type === 'whisper'"
            @streaming-change="handleStreamingChange"
          />

          <div class="scene-navigation-minimal">
            <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
              ← Back
            </button>
            <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
              Continue →
            </button>
          </div>
        </div>

        <!-- Conversation interface scene -->
        <div v-else-if="currentScene.type === 'conversation'" class="scene-content-full">
          <div class="scene-header">
            <h2 class="scene-title">{{ currentScene.title }}</h2>
            <p class="scene-subtitle">{{ currentScene.description }}</p>
          </div>

          <ConversationInterface
            v-if="currentScene.type === 'conversation'"
            @streaming-change="handleStreamingChange"
            @conversation-state-change="handleConversationStateChange"
          />

          <div class="scene-navigation-minimal">
            <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
              ← Back
            </button>
            <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
              Continue →
            </button>
          </div>
        </div>

        <!-- Split view scene -->
        <div v-else-if="currentScene.type === 'split'" class="scene-content-split">
          <div class="split-left">
            <h2 class="scene-title">{{ currentScene.title }}</h2>
            <p class="scene-description">{{ currentScene.description }}</p>
            <div v-if="currentScene.code" class="code-block">
              <pre><code>{{ currentScene.code }}</code></pre>
            </div>
          </div>
          <div class="split-right">
            <div class="visual-demo">
              <div v-for="i in 5" :key="i" class="demo-bar" :style="{
                height: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.1}s`
              }"></div>
            </div>
          </div>
          <div class="scene-navigation-bottom">
            <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
              ← Previous
            </button>
            <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
              Next →
            </button>
          </div>
        </div>

        <!-- Stats showcase scene -->
        <div v-else-if="currentScene.type === 'stats'" class="scene-content">
          <h2 class="scene-title">{{ currentScene.title }}</h2>
          <div class="stats-grid">
            <div v-for="stat in currentScene.stats" :key="stat.label" class="stat-card">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div v-if="stat.detail" class="stat-detail">{{ stat.detail }}</div>
            </div>
          </div>
          <div class="scene-navigation">
            <button @click="previousScene" :disabled="currentSceneIndex === 0" class="nav-button prev">
              ← Previous
            </button>
            <button @click="nextScene" :disabled="currentSceneIndex === scenes.length - 1" class="nav-button next">
              Next →
            </button>
          </div>
        </div>

        <!-- Hero scene -->
        <div v-else-if="currentScene.type === 'hero'" class="scene-content-hero">
          <div class="hero-content">
            <h1 class="hero-title">{{ currentScene.title }}</h1>
            <p class="hero-description">{{ currentScene.description }}</p>
            <button @click="nextScene" class="hero-cta">
              {{ currentScene.ctaText || 'Start Journey' }} →
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Keyboard hint -->
    <div class="keyboard-hint" v-if="currentScene.type !== 'chat' && currentScene.type !== 'whisper' && currentScene.type !== 'conversation'">
      Use arrow keys to navigate
    </div>
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

    // Enhanced scenes with different types
    const scenes = [
      {
        type: 'hero',
        title: "AI on Legacy Hardware",
        description: "Discover how powerful AI can run on older machines, proving that innovation doesn't always require the latest technology.",
        blobState: "normal",
        ctaText: "Begin Experience"
      },
      {
        type: 'text',
        title: "The Beginning",
        description: "In a world where AI runs on legacy hardware, we discover that older machines have their own unique charm and capabilities.",
        blobState: "normal",
        points: [
          "Legacy hardware from 2015-2020 era",
          "Running local AI models efficiently",
          "No cloud dependency needed"
        ]
      },
      {
        type: 'stats',
        title: "System Performance",
        blobState: "left",
        stats: [
          { value: "8GB", label: "RAM Usage", detail: "Efficient memory management" },
          { value: "90%", label: "CPU Utilization", detail: "During peak processing" },
          { value: "1.2s", label: "Response Time", detail: "Average query latency" },
          { value: "7B", label: "Parameters", detail: "Model complexity" }
        ]
      },
      {
        type: 'chat',
        title: "Try It Yourself",
        description: "Experience the AI in action. Ask anything!",
        blobState: "left"
      },
      {
        type: 'whisper',
        title: "Real-time Speech Recognition",
        description: "Experience live speech-to-text transcription powered by OpenAI's Whisper model running locally.",
        blobState: "right"
      },
      {
        type: 'conversation',
        title: "Voice Conversation with AI",
        description: "Have a natural conversation with the AI using your voice. Speak naturally and the AI will respond.",
        blobState: "normal"
      },
      {
        type: 'split',
        title: "Under the Hood",
        description: "The system architecture that makes it possible",
        blobState: "right",
        code: `// Simplified inference loop
async function processQuery(input) {
  const tokens = tokenize(input);
  const embeddings = embed(tokens);
  const response = await model.generate(embeddings);
  return decode(response);
}`
      },
      {
        type: 'text',
        title: "The Future",
        description: "This demonstration shows that powerful AI doesn't always require the latest hardware. Sometimes, the old ways still work best.",
        blobState: "normal",
        points: [
          "Democratizing AI access",
          "Reducing electronic waste",
          "Empowering local computation"
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
    })

    onMounted(() => {
      window.addEventListener('keydown', handleKeypress)
      emit('scene-change', currentScene.value)
      emit('blob-state-change', currentScene.value.blobState)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeypress)
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
      handleConversationStateChange
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

/* Default scene content */
.scene-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 3rem;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

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

/* Hero scene */
.scene-content-hero {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.hero-content {
  max-width: 800px;
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

/* Chat, WhisperLive, and Conversation scene */
.scene-content-full {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  min-height: 600px;
}

.scene-header {
  text-align: center;
  margin-bottom: 2rem;
}

.scene-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
}

/* Stats scene */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
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

/* Split scene */
.scene-content-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  min-height: 500px;
  position: relative;
}

.split-left, .split-right {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
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
  margin-top: 3rem;
}

.scene-navigation-minimal {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.scene-navigation-bottom {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
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

  .scene-content {
    padding: 2rem;
    min-height: 350px;
  }

  .scene-title {
    font-size: 2rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .scene-content-split {
    grid-template-columns: 1fr;
  }

  .scene-navigation-bottom {
    position: static;
    margin-top: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
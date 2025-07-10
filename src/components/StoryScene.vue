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
      <div :key="currentSceneIndex" class="scene-content">
        <div class="scene-text">
          <h2 class="scene-title">{{ currentScene.title }}</h2>
          <p class="scene-description">{{ currentScene.description }}</p>

          <!-- Optional sub-points -->
          <ul v-if="currentScene.points" class="scene-points">
            <li v-for="(point, idx) in currentScene.points" :key="idx">
              {{ point }}
            </li>
          </ul>
        </div>

        <!-- Navigation -->
        <div class="scene-navigation">
          <button
            @click="previousScene"
            :disabled="currentSceneIndex === 0"
            class="nav-button prev"
          >
            ← Previous
          </button>

          <span class="scene-counter">
            {{ currentSceneIndex + 1 }} / {{ scenes.length }}
          </span>

          <button
            @click="nextScene"
            :disabled="currentSceneIndex === scenes.length - 1"
            class="nav-button next"
          >
            Next →
          </button>
        </div>
      </div>
    </transition>

    <!-- Keyboard hint -->
    <div class="keyboard-hint">
      Use arrow keys to navigate
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'StoryScene',
  emits: ['scene-change', 'blob-state-change'],
  setup(props, { emit }) {
    const currentSceneIndex = ref(0)

    // Define your story scenes here
    const scenes = [
      {
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
        title: "The Challenge",
        description: "As computational demands increase, the blobs converge to the left, representing the system under load as it processes complex queries.",
        blobState: "left"
      },
      {
        title: "Processing Power",
        description: "The system demonstrates its capability, with visual feedback showing the intense computational work happening locally.",
        blobState: "left",
        points: [
          "CPU utilization peaks at 90%",
          "Memory efficiently managed",
          "Real-time response generation"
        ]
      },
      {
        title: "The Response",
        description: "As the AI completes its task, the blobs shift right, indicating the successful completion and system relaxation.",
        blobState: "right"
      },
      {
        title: "Equilibrium",
        description: "The system returns to its natural state, ready for the next interaction. The dance of computation continues.",
        blobState: "normal",
        points: [
          "System resources normalized",
          "Ready for next query",
          "Continuous availability"
        ]
      },
      {
        title: "The Future",
        description: "This demonstration shows that powerful AI doesn't always require the latest hardware. Sometimes, the old ways still work best.",
        blobState: "normal"
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

    // Keyboard navigation
    const handleKeypress = (e) => {
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
      // Emit initial scene
      emit('scene-change', currentScene.value)
      emit('blob-state-change', currentScene.value.blobState)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeypress)
    })

    return {
      scenes,
      currentSceneIndex,
      currentScene,
      progressPercentage,
      nextScene,
      previousScene
    }
  }
}
</script>

<style scoped>
.story-container {
  width: 100%;
  max-width: 800px;
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

/* Scene content */
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

/* Navigation */
.scene-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
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

  .scene-description {
    font-size: 1.1rem;
  }

  .nav-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
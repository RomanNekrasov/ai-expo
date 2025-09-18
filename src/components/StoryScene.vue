<template>
  <div class="story-container">
    <StoryProgress
      :scenes="scenes"
      :current-scene-index="currentSceneIndex"
      @change="goToScene"
    />

    <transition name="fade" mode="out-in">
      <div :key="currentSceneIndex" class="scene-wrapper">
        <div
          class="scene-content-unified"
          :class="{ 'has-background': hasBackground }"
          :style="backgroundStyle"
        >
          <component
            :is="currentSceneComponent"
            v-bind="componentProps"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStoryScene } from '../composables/useStoryScene.js'
import StoryProgress from './story/StoryProgress.vue'
import HeroScene from './story/HeroScene.vue'
import TextScene from './story/TextScene.vue'
import StatsScene from './story/StatsScene.vue'
import ImagesScene from './story/ImagesScene.vue'
import UtpScene from './story/UtpScene.vue'
import ChatScene from './story/ChatScene.vue'
import WhisperScene from './story/WhisperScene.vue'
import ConversationScene from './story/ConversationScene.vue'
import SplitScene from './story/SplitScene.vue'

const emit = defineEmits(['scene-change', 'blob-state-change'])

const {
  scenes,
  currentSceneIndex,
  currentScene,
  displayedText,
  showCursor,
  nextScene,
  previousScene,
  goToScene,
  handleStreamingChange,
  handleConversationStateChange
} = useStoryScene(emit)

const sceneComponentMap = {
  hero: HeroScene,
  text: TextScene,
  stats: StatsScene,
  images: ImagesScene,
  utp: UtpScene,
  chat: ChatScene,
  whisper: WhisperScene,
  conversation: ConversationScene,
  split: SplitScene,
  'split-reverse': SplitScene
}

const currentSceneComponent = computed(() => {
  const type = currentScene.value?.type || 'text'
  return sceneComponentMap[type] || TextScene
})

const hasBackground = computed(() => Boolean(currentScene.value?.backgroundImage))

const backgroundStyle = computed(() => {
  if (!currentScene.value?.backgroundImage) return {}
  return { '--bg-image': `url(${currentScene.value.backgroundImage})` }
})

const isFirstScene = computed(() => currentSceneIndex.value === 0)
const isLastScene = computed(() => currentSceneIndex.value === scenes.length - 1)

const componentProps = computed(() => {
  const type = currentScene.value?.type || 'text'

  if (type === 'hero') {
    return {
      scene: currentScene.value,
      onNext: nextScene,
      displayedText: displayedText.value,
      showCursor: showCursor.value
    }
  }

  const props = {
    scene: currentScene.value,
    onNext: nextScene,
    onPrevious: previousScene,
    isFirst: isFirstScene.value,
    isLast: isLastScene.value
  }

  if (type === 'text') {
    props.currentIndex = currentSceneIndex.value
    props.totalScenes = scenes.length
  }

  if (type === 'chat' || type === 'whisper') {
    props.onStreamingChange = handleStreamingChange
  }

  if (type === 'conversation') {
    props.onStreamingChange = handleStreamingChange
    props.onConversationStateChange = handleConversationStateChange
  }

  if (type === 'split' || type === 'split-reverse') {
    props.reverse = type === 'split-reverse'
  }

  return props
})
</script>

<style scoped>
.story-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.scene-wrapper {
  min-height: 500px;
}

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
  opacity: 0.1;
  border-radius: 20px;
  pointer-events: none;
  z-index: 0;
}

.scene-content-unified.has-background > * {
  position: relative;
  z-index: 1;
}

.story-container :deep(.scene-title) {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.story-container :deep(.scene-description) {
  font-size: 1.25rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.story-container :deep(.scene-navigation),
.story-container :deep(.scene-navigation-minimal),
.story-container :deep(.scene-navigation-bottom) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.story-container :deep(.unified-navigation) {
  margin-top: auto;
  padding-top: 2rem;
  flex-shrink: 0;
}

.story-container :deep(.unified-navigation-minimal) {
  margin-top: auto;
  padding-top: 1rem;
  flex-shrink: 0;
}

.story-container :deep(.nav-button) {
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

.story-container :deep(.nav-button:hover:not(:disabled)) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.story-container :deep(.nav-button:disabled) {
  opacity: 0.3;
  cursor: not-allowed;
}

.story-container :deep(.scene-counter) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.story-container :deep(.scene-header) {
  margin-bottom: 1.5rem;
}

.story-container :deep(.scene-subtitle) {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.75);
}

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
}
</style>

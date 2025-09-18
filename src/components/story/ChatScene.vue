<template>
  <div class="chat-scene">
    <div class="scene-header">
      <h2 class="scene-title">{{ scene.title }}</h2>
      <p v-if="scene.description" class="scene-subtitle">{{ scene.description }}</p>
    </div>

    <ChatInterface @streaming-change="onStreamingChange" />

    <div class="unified-navigation-minimal">
      <div class="scene-navigation-minimal">
        <button class="nav-button prev" :disabled="isFirst" @click="onPrevious">
          ← Terug
        </button>
        <button class="nav-button next" :disabled="isLast" @click="onNext">
          Doorgaan →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import ChatInterface from '../ChatInterface.vue'

const props = defineProps({
  scene: {
    type: Object,
    required: true
  },
  isFirst: {
    type: Boolean,
    required: true
  },
  isLast: {
    type: Boolean,
    required: true
  },
  onNext: {
    type: Function,
    required: true
  },
  onPrevious: {
    type: Function,
    required: true
  },
  onStreamingChange: {
    type: Function,
    required: true
  }
})

const { scene, isFirst, isLast, onNext, onPrevious, onStreamingChange } = props
</script>

<style scoped>
.chat-scene {
  display: flex;
  flex-direction: column;
  flex: 1;
}
</style>

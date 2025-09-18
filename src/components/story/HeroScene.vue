<template>
  <div class="hero-scene">
    <div class="hero-content">
      <h1 class="hero-title">{{ scene.title }}</h1>
      <p class="hero-description">
        <span class="typewriter-text">{{ displayedText }}</span>
        <span class="cursor" :class="{ visible: showCursor }">|</span>
      </p>
      <button class="hero-cta" @click="onNext">
        {{ scene.ctaText || 'Start Journey' }} →
      </button>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  scene: {
    type: Object,
    required: true
  },
  onNext: {
    type: Function,
    required: true
  },
  displayedText: {
    type: String,
    default: ''
  },
  showCursor: {
    type: Boolean,
    default: true
  }
})

const { scene, onNext, displayedText, showCursor } = toRefs(props)
</script>

<style scoped>
.hero-scene {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
}

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
</style>

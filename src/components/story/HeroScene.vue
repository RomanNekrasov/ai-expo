<template>
  <div class="hero-content">
    <div class="hero-text">
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

const { scene, onNext, displayedText, showCursor } = props
</script>

<style scoped>
.hero-content {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
}

.hero-text {
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
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  min-height: 2em;
}

.typewriter-text {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.05em;
}

.cursor {
  display: inline-block;
  margin-left: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.cursor.visible {
  opacity: 1;
}

.hero-cta {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hero-cta:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
</style>

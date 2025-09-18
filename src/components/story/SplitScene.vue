<template>
  <div class="unified-split-content">
    <div class="split-left">
      <template v-if="!reverse">
        <h2 class="scene-title">{{ scene.title }}</h2>
        <p class="scene-description">{{ scene.description }}</p>
        <div v-if="scene.code" class="code-block">
          <pre><code>{{ scene.code }}</code></pre>
        </div>
      </template>
      <template v-else>
        <div v-if="scene.image" class="image-container">
          <img :src="scene.image" :alt="scene.imageAlt" class="split-image" />
        </div>
      </template>
    </div>

    <div class="split-right">
      <template v-if="reverse">
        <h2 class="scene-title">{{ scene.title }}</h2>
        <p class="scene-description">{{ scene.description }}</p>
        <div v-if="scene.code" class="code-block">
          <pre><code>{{ scene.code }}</code></pre>
        </div>
      </template>
      <template v-else>
        <div v-if="scene.image" class="image-container">
          <img :src="scene.image" :alt="scene.imageAlt" class="split-image" />
        </div>
        <div v-else class="visual-demo">
          <div
            v-for="(height, index) in demoBars"
            :key="index"
            class="demo-bar"
            :style="{ height: `${height}%`, animationDelay: `${index * 0.1}s` }"
          ></div>
        </div>
      </template>
    </div>

    <div class="unified-navigation navigation-bottom">
      <div class="scene-navigation-bottom">
        <button class="nav-button prev" :disabled="isFirst" @click="onPrevious">
          ← Vorige
        </button>
        <button class="nav-button next" :disabled="isLast" @click="onNext">
          Volgende →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
  reverse: {
    type: Boolean,
    default: false
  }
})

const { scene, isFirst, isLast, onNext, onPrevious, reverse } = props

const demoBars = ref(Array.from({ length: 5 }, () => 20 + Math.random() * 60))
</script>

<style scoped>
.unified-split-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  flex: 1;
  position: relative;
}

.split-left,
.split-right {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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

.navigation-bottom {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
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

@keyframes pulse-height {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}
</style>

<template>
  <div class="images-scene">
    <h2 class="scene-title">{{ scene.title }}</h2>
    <div class="images-grid">
      <div v-for="image in scene.images" :key="image.alt" class="image-card">
        <img :src="image.src" :alt="image.alt" class="performance-image" />
        <div class="image-caption">{{ image.caption }}</div>
      </div>
    </div>

    <div class="unified-navigation">
      <div class="scene-navigation">
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
  }
})

const { scene, isFirst, isLast, onNext, onPrevious } = props
</script>

<style scoped>
.images-scene {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.image-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
}

.performance-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.image-caption {
  padding: 1rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
}
</style>

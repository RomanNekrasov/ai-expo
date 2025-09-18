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
</style>

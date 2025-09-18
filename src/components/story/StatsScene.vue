<template>
  <div class="stats-scene">
    <h2 class="scene-title">{{ scene.title }}</h2>
    <div class="stats-grid">
      <div v-for="stat in scene.stats" :key="stat.label" class="stat-card">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
        <div v-if="stat.detail" class="stat-detail">{{ stat.detail }}</div>
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
.stats-scene {
  display: flex;
  flex-direction: column;
  flex: 1;
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
</style>

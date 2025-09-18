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
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.25);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
}

.stat-label {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.stat-detail {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.65);
}
</style>

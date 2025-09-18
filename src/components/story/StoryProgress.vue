<template>
  <div class="progress-bar">
    <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
    <div class="progress-dots">
      <button
        v-for="(scene, index) in scenes"
        :key="index"
        class="progress-dot"
        :class="{
          active: index === currentSceneIndex,
          visited: index < currentSceneIndex
        }"
        :title="scene.title"
        @click="handleSelect(index)"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  scenes: {
    type: Array,
    required: true
  },
  currentSceneIndex: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['change'])

const progressPercentage = computed(() => {
  if (!props.scenes.length) return 0
  return ((props.currentSceneIndex + 1) / props.scenes.length) * 100
})

const handleSelect = (index) => {
  emit('change', index)
}
</script>

<style scoped>
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
</style>

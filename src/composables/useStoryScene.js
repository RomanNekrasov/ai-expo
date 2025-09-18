import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storyScenes } from '../data/storyScenes.js'

const fullText = 'Een reis door lokale AI-verwerking'
const typingSpeed = 80
const deletingSpeed = 50
const pauseBetweenCycles = 2000
const pauseBeforeRetyping = 1000

export const useStoryScene = (emit) => {
  const scenes = storyScenes
  const currentSceneIndex = ref(0)
  const displayedText = ref('')
  const showCursor = ref(true)
  const typewriterTimeout = ref(null)
  const cursorInterval = ref(null)

  const currentScene = computed(() => scenes[currentSceneIndex.value])

  const progressPercentage = computed(() => {
    if (!scenes.length) return 0
    return ((currentSceneIndex.value + 1) / scenes.length) * 100
  })

  const nextScene = () => {
    if (currentSceneIndex.value < scenes.length - 1) {
      currentSceneIndex.value += 1
    }
  }

  const previousScene = () => {
    if (currentSceneIndex.value > 0) {
      currentSceneIndex.value -= 1
    }
  }

  const goToScene = (index) => {
    if (index >= 0 && index < scenes.length) {
      currentSceneIndex.value = index
    }
  }

  const stopTypewriter = () => {
    if (typewriterTimeout.value) {
      clearTimeout(typewriterTimeout.value)
      typewriterTimeout.value = null
    }
  }

  const startTypewriter = () => {
    stopTypewriter()

    let currentIndex = 0
    let isDeleting = false

    const typeStep = () => {
      if (!isDeleting) {
        displayedText.value = fullText.substring(0, currentIndex + 1)
        currentIndex += 1

        if (currentIndex > fullText.length) {
          typewriterTimeout.value = setTimeout(() => {
            isDeleting = true
            typeStep()
          }, pauseBetweenCycles)
          return
        }
      } else {
        displayedText.value = fullText.substring(0, currentIndex - 1)
        currentIndex -= 1

        if (currentIndex <= 0) {
          typewriterTimeout.value = setTimeout(() => {
            isDeleting = false
            currentIndex = 0
            typeStep()
          }, pauseBeforeRetyping)
          return
        }
      }

      const delay = isDeleting ? deletingSpeed : typingSpeed
      typewriterTimeout.value = setTimeout(typeStep, delay)
    }

    typeStep()
  }

  const startCursorBlink = () => {
    if (cursorInterval.value) return

    cursorInterval.value = setInterval(() => {
      showCursor.value = !showCursor.value
    }, 500)
  }

  const stopCursorBlink = () => {
    if (cursorInterval.value) {
      clearInterval(cursorInterval.value)
      cursorInterval.value = null
      showCursor.value = true
    }
  }

  const handleStreamingChange = (isStreaming) => {
    const type = currentScene.value?.type

    if (type === 'whisper') {
      emit('blob-state-change', isStreaming ? 'right' : 'normal')
    } else if (type === 'conversation') {
      emit('blob-state-change', isStreaming ? 'right' : 'normal')
    } else if (type === 'chat') {
      emit('blob-state-change', isStreaming ? 'left' : 'normal')
    }
  }

  const handleConversationStateChange = (state) => {
    if (state === 'listening') {
      emit('blob-state-change', 'right')
    } else if (state === 'responding') {
      emit('blob-state-change', 'left')
    } else {
      emit('blob-state-change', 'normal')
    }
  }

  const handleKeypress = (event) => {
    const disabledTypes = ['chat', 'whisper', 'conversation']
    if (disabledTypes.includes(currentScene.value?.type)) return

    if (event.key === 'ArrowRight') {
      nextScene()
    }

    if (event.key === 'ArrowLeft') {
      previousScene()
    }
  }

  watch(currentSceneIndex, (newIndex) => {
    const scene = scenes[newIndex]
    emit('scene-change', scene)
    emit('blob-state-change', scene.blobState)

    if (scene.type === 'hero') {
      startTypewriter()
    } else {
      stopTypewriter()
      displayedText.value = ''
    }
  })

  onMounted(() => {
    window.addEventListener('keydown', handleKeypress)
    const initialScene = currentScene.value
    emit('scene-change', initialScene)
    emit('blob-state-change', initialScene.blobState)

    startCursorBlink()

    if (initialScene.type === 'hero') {
      startTypewriter()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeypress)
    stopTypewriter()
    stopCursorBlink()
  })

  return {
    scenes,
    currentSceneIndex,
    currentScene,
    progressPercentage,
    displayedText,
    showCursor,
    nextScene,
    previousScene,
    goToScene,
    handleStreamingChange,
    handleConversationStateChange
  }
}

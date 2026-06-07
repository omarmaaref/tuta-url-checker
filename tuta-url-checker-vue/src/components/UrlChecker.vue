<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import { useUrlCheck } from '@/composables/useUrlCheck'

const input = ref('')
const { state } = useUrlCheck(input)
</script>

<template>
  <div class="url-checker">
    <InputText
      v-model="input"
      placeholder="https://example.com"
      autocomplete="off"
      spellcheck="false"
    />
    <p class="status" aria-live="polite">
      <span v-if="state.state === 'init'">Type a URL to check</span>
      <span v-else-if="state.state === 'invalid-format'">Invalid URL format</span>
      <span v-else-if="state.state === 'checking'">Checking…</span>
      <span v-else-if="state.state === 'exists'">
        <code>{{ state.url }}</code> exists ({{ state.type }})
      </span>
      <span v-else-if="state.state === 'not-found'">
        <code>{{ state.url }}</code> not found
      </span>
      <span v-else-if="state.state === 'error'">Error: {{ state.message }}</span>
    </p>
  </div>
</template>
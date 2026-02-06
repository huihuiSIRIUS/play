<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  shadow?: 'always' | 'hover' | 'never'
  height?: string
  flex?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shadow: 'hover',
  height: 'auto',
  flex: false
})

const cardClass = computed(() => ({
  'section-card': true,
  [`is-${props.shadow}`]: true,
  'is-flex': props.flex
}))

const cardStyle = computed(() => ({
  height: props.height
}))
</script>

<template>
  <el-card :shadow="shadow" :class="cardClass" :style="cardStyle">
    <template #header>
      <div class="card-header">
        <div class="title">{{ title }}</div>
        <div v-if="$slots.tools" class="tools">
          <slot name="tools"></slot>
        </div>
      </div>
    </template>
    <slot></slot>
  </el-card>
</template>

<style scoped>
.section-card {
  border: 1px solid #EBEEF5;
}

.section-card.is-flex {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.section-card.is-flex :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: var(--app-card-padding);
}

.section-card :deep(.el-card__header) {
  padding: 0;
  border-bottom: 1px solid #EBEEF5;
}

.card-header {
  height: 56px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.title::before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  background-color: var(--el-color-primary, #409EFF);
  border-radius: 2px;
  margin-right: var(--spacing-sm);
  flex-shrink: 0;
}

.tools {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-card.is-always {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.section-card.is-hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.section-card.is-hover:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-card.is-never {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.section-card.is-never:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>

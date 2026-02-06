<template>
  <div class="industrial-card" :class="status">
    <div class="status-line"></div>

    <div class="card-header">
      <div class="header-left">
        <h3 class="device-name">{{ name }}</h3>
        <span class="device-id">{{ id }}</span>
      </div>
      <el-tag 
        :type="statusMap[status].type" 
        size="small" 
        effect="light"
        class="status-tag"
      >
        {{ statusMap[status].text }}
      </el-tag>
    </div>

    <div class="card-body">
      <div class="image-section">
        <el-image 
          :src="imageUrl" 
          fit="cover" 
          class="device-thumb"
        >
          <template #error>
            <div class="image-slot">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
      </div>

      <div class="data-section">
        <div 
          v-for="(item, index) in data.slice(0, 4)" 
          :key="index"
          class="data-cell"
        >
          <div class="data-value" :class="{ 'is-alarm-value': item.isAlarm }">
            {{ item.value }}
          </div>
          <div class="data-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <el-button link type="primary" size="small">查看详情</el-button>
      <div class="divider"></div>
      <el-button link type="info" size="small">历史趋势</el-button>
    </div>
  </div>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'

const props = defineProps({
  name: String,
  id: String,
  status: { type: String, default: 'normal' },
  data: Array,
  imageUrl: String
})

const statusMap = {
  normal: { text: '正常运行', type: 'success' },
  alarm: { text: '异常报警', type: 'danger' },
  offline: { text: '设备离线', type: 'info' }
}
</script>

<style scoped>
/* ...保留之前的样式，新增以下样式... */

.industrial-card {
  background: #fff;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  position: relative;
  display: flex;
  flex-direction: column;
}
.industrial-card:hover { border-color: #409EFF; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }

.status-line { height: 3px; width: 100%; }
.industrial-card.normal .status-line { background: #67C23A; }
.industrial-card.alarm .status-line { background: #F56C6C; }
.industrial-card.offline .status-line { background: #909399; }

.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #FAFAFA;
}
.device-name { margin: 0; font-size: 16px; font-weight: 700; color: #303133; }
.device-id { font-size: 12px; color: #909399; font-family: 'Roboto Mono', monospace; margin-top: 2px; }

.card-body { display: flex; height: 140px; }
.image-section { width: 140px; border-right: 1px solid #EBEEF5; padding: 12px; display: flex; align-items: center; justify-content: center; }
.device-thumb { width: 100%; height: 100%; border-radius: 2px; background: #f5f7fa; }
.image-slot { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; background: #F5F7FA; color: #C0C4CC; font-size: 24px; }

.data-section { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.data-cell { padding: 8px 24px; display: flex; flex-direction: column; justify-content: center; border-right: 1px solid #EBEEF5; border-bottom: 1px solid #EBEEF5; overflow: hidden; }
.data-cell:nth-child(2n) { border-right: none; }
.data-cell:nth-last-child(-n+2) { border-bottom: none; }

.data-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  font-family: 'DIN Alternate', Arial, sans-serif;
  white-space: nowrap;
}
.data-label { font-size: 12px; color: #909399; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-footer { padding: 8px 16px; background: #fff; border-top: 1px solid #EBEEF5; display: flex; justify-content: space-around; align-items: center; }
.divider { width: 1px; height: 14px; background: #EBEEF5; }

/* --- 核心：报警数值变红样式 --- */
.is-alarm-value {
  color: #F56C6C !important; /* 强制红色 */
  animation: blink 1s infinite alternate; /* 可选：增加呼吸闪烁效果 */
}

@keyframes blink {
  from { opacity: 1; }
  to { opacity: 0.6; }
}
</style>
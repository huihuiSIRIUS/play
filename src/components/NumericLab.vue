<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { RefreshRight } from '@element-plus/icons-vue'

interface ThresholdValue {
  original: number
  simulated: number
}

interface RulesValue {
  original: number
  simulated: number
}

const chartRef = ref<HTMLDivElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)

const timeRange = ref([
  dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
  dayjs().format('YYYY-MM-DD HH:mm')
])

const selectedQuickTime = ref<string>('')

const quickTimeTags = [
  { label: '近30天', value: '30' },
  { label: '近60天', value: '60' },
  { label: '近90天', value: '90' }
]

const handleQuickTime = (days: string) => {
  selectedQuickTime.value = days
  const end = dayjs()
  const start = end.subtract(parseInt(days), 'day')
  timeRange.value = [
    start.format('YYYY-MM-DD HH:mm'),
    end.format('YYYY-MM-DD HH:mm')
  ]
}

const thresholds = ref<Record<string, ThresholdValue>>({
  hh: { original: 90, simulated: 85 },
  h: { original: 80, simulated: 75 },
  l: { original: 20, simulated: 25 },
  ll: { original: 10, simulated: 15 }
})

const rules = ref<Record<string, RulesValue>>({
  deadband: { original: 5, simulated: 3 },
  delay: { original: 10, simulated: 5 }
})

const alarmData = [
  { type: '高高报', original: 12, simulated: 8, diff: -4 },
  { type: '高报', original: 25, simulated: 18, diff: -7 },
  { type: '低报', original: 8, simulated: 5, diff: -3 },
  { type: '低低报', original: 3, simulated: 0, diff: -3 },
  { type: '报警时长', original: '45分钟', simulated: '28分钟' },
  { type: '抖动报警次数', original: 15, simulated: 7, diff: -8 },
  { type: '瞬时报警次数', original: 10, simulated: 4, diff: -6 },
  { type: '陈旧报警次数', original: 2, simulated: 0, diff: -2 }
]

const generateMockData = () => {
  const data = []
  const start = dayjs(timeRange.value[0])
  const end = dayjs(timeRange.value[1])
  const duration = end.diff(start, 'minute')

  for (let i = 0; i <= duration; i += 5) {
    const time = start.add(i, 'minute')
    const value = 50 + Math.sin(i / 10) * 30 + Math.random() * 10
    data.push([time.format('YYYY-MM-DD HH:mm'), value])
  }

  return data
}

const updateChart = () => {
  if (!chartInstance.value) return

  const mockData = generateMockData()

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function(params: any) {
        const time = dayjs(params[0].name).format('MM-DD HH:mm')
        let result = `${time}<br/>`
        
        const processValue = params.find((p: any) => p.seriesName === '工艺数值')
        if (processValue) {
          result += `${processValue.marker} ${processValue.seriesName}: ${processValue.value[1].toFixed(2)}<br/>`
        }
        
        const hhOriginal = params.find((p: any) => p.seriesName === 'HH值')
        const hhSimulated = params.find((p: any) => p.seriesName === '模拟HH值')
        if (hhOriginal || hhSimulated) {
          result += `<br/><strong>HH阈值:</strong><br/>`
          if (hhOriginal) result += `${hhOriginal.marker} 原值: ${hhOriginal.value[1]}<br/>`
          if (hhSimulated) result += `${hhSimulated.marker} 模拟: ${hhSimulated.value[1]}<br/>`
        }
        
        const hOriginal = params.find((p: any) => p.seriesName === 'H值')
        const hSimulated = params.find((p: any) => p.seriesName === '模拟H值')
        if (hOriginal || hSimulated) {
          result += `<br/><strong>H阈值:</strong><br/>`
          if (hOriginal) result += `${hOriginal.marker} 原值: ${hOriginal.value[1]}<br/>`
          if (hSimulated) result += `${hSimulated.marker} 模拟: ${hSimulated.value[1]}<br/>`
        }
        
        const lOriginal = params.find((p: any) => p.seriesName === 'L值')
        const lSimulated = params.find((p: any) => p.seriesName === '模拟L值')
        if (lOriginal || lSimulated) {
          result += `<br/><strong>L阈值:</strong><br/>`
          if (lOriginal) result += `${lOriginal.marker} 原值: ${lOriginal.value[1]}<br/>`
          if (lSimulated) result += `${lSimulated.marker} 模拟: ${lSimulated.value[1]}<br/>`
        }
        
        const llOriginal = params.find((p: any) => p.seriesName === 'LL值')
        const llSimulated = params.find((p: any) => p.seriesName === '模拟LL值')
        if (llOriginal || llSimulated) {
          result += `<br/><strong>LL阈值:</strong><br/>`
          if (llOriginal) result += `${llOriginal.marker} 原值: ${llOriginal.value[1]}<br/>`
          if (llSimulated) result += `${llSimulated.marker} 模拟: ${llSimulated.value[1]}<br/>`
        }
        
        return result
      }
    },
    legend: {
      data: ['工艺数值', 'HH值', 'H值', 'L值', 'LL值', '模拟HH值', '模拟H值', '模拟L值', '模拟LL值'],
      top: 10,
      left: 'center',
      itemGap: 20,
      textStyle: {
        fontSize: 12,
        color: '#606266'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      boundaryGap: false,
      axisLabel: {
        formatter: function(value: any) {
          return dayjs(value).format('HH:mm')
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}'
      }
    },
    dataZoom: [
      {
        start: 0,
        end: 100,
        bottom: 0
      }
    ],
    series: [
      {
        name: '工艺数值',
        type: 'line',
        data: mockData,
        smooth: true,
        showSymbol: false,
        hoverAnimation: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.2)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0)' }
          ])
        },
        lineStyle: {
          color: '#409EFF',
          width: 2
        }
      },
      {
        name: 'HH值',
        type: 'line',
        data: mockData.map((item: any) => [item[0], thresholds.value.hh.original]),
        lineStyle: {
          color: '#F56C6C',
          type: 'dashed',
          width: 1,
          opacity: 0.6
        },
        symbol: 'none'
      },
      {
        name: 'H值',
        type: 'line',
        data: mockData.map((item: any) => [item[0], thresholds.value.h.original]),
        lineStyle: {
          color: '#E6A23C',
          type: 'dashed',
          width: 1,
          opacity: 0.6
        },
        symbol: 'none'
      },
      {
        name: 'L值',
        type: 'line',
        data: mockData.map((item: any) => [item[0], thresholds.value.l.original]),
        lineStyle: {
          color: '#E6A23C',
          type: 'dashed',
          width: 1,
          opacity: 0.6
        },
        symbol: 'none'
      },
      {
        name: 'LL值',
        type: 'line',
        data: mockData.map((item: any) => [item[0], thresholds.value.ll.original]),
        lineStyle: {
          color: '#F56C6C',
          type: 'dashed',
          width: 1,
          opacity: 0.6
        },
        symbol: 'none'
      },
      {
        name: '模拟HH值',
        type: 'line',
        data: mockData.map((item: any) => [item[0], thresholds.value.hh.simulated]),
        lineStyle: {
          color: '#F56C6C',
          type: 'solid',
          width: 2,
          opacity: 1.0
        },
        symbol: 'none'
      },
      {
        name: '模拟H值',
        type: 'line',
        data: mockData.map((item: any) => [item[0], thresholds.value.h.simulated]),
        lineStyle: {
          color: '#E6A23C',
          type: 'solid',
          width: 2,
          opacity: 1.0
        },
        symbol: 'none'
      },
      {
        name: '模拟L值',
        type: 'line',
        data: mockData.map((item: any) => [item[0], thresholds.value.l.simulated]),
        lineStyle: {
          color: '#E6A23C',
          type: 'solid',
          width: 2,
          opacity: 1.0
        },
        symbol: 'none'
      },
      {
        name: '模拟LL值',
        type: 'line',
        data: mockData.map((item: any) => [item[0], thresholds.value.ll.simulated]),
        lineStyle: {
          color: '#F56C6C',
          type: 'solid',
          width: 2,
          opacity: 1.0
        },
        symbol: 'none'
      }
    ]
  }

  chartInstance.value.setOption(option)
}

const handleThresholdChange = (type: string, field: 'original' | 'simulated', value: string) => {
  thresholds.value[type][field] = parseFloat(value) || 0
}

const handleRuleChange = (type: string, field: 'original' | 'simulated', value: string) => {
  rules.value[type][field] = parseFloat(value) || 0
}

const handleCalculate = () => {
  updateChart()
}

const handleReset = () => {
  timeRange.value = [
    dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
    dayjs().format('YYYY-MM-DD HH:mm')
  ]
  thresholds.value = {
    hh: { original: 90, simulated: 85 },
    h: { original: 80, simulated: 75 },
    l: { original: 20, simulated: 25 },
    ll: { original: 10, simulated: 15 }
  }
  rules.value = {
    deadband: { original: 5, simulated: 3 },
    delay: { original: 10, simulated: 5 }
  }
}

const getThresholdColor = (key: string) => {
  switch(key) {
    case 'hh': return '#ff4d4f'
    case 'h': return '#fa8c16'
    case 'l': return '#faad14'
    case 'll': return '#1890ff'
    default: return '#333'
  }
}

const getThresholdLabel = (key: string) => {
  switch(key) {
    case 'hh': return 'HH值'
    case 'h': return 'H值'
    case 'l': return 'L值'
    case 'll': return 'LL值'
    default: return key
  }
}

const extractNumber = (value: number | string): number => {
  if (typeof value === 'number') return value
  const numStr = String(value).replace(/[^\d.]/g, '')
  return parseFloat(numStr) || 0
}

const calculateDiff = (row: any): number | string => {
  if (row.diff !== undefined) return row.diff
  const originalNum = extractNumber(row.original)
  const simulatedNum = extractNumber(row.simulated)
  const diff = simulatedNum - originalNum
  if (typeof row.original === 'string' && row.original.includes('分钟')) {
    return `${diff}分钟`
  }
  return diff
}

const getDiffBarClass = (row: any): string => {
  const numDiff = extractNumber(calculateDiff(row))
  return numDiff < 0 ? 'diff-bar-green' : 'diff-bar-red'
}

const getDiffBarWidth = (row: any): string => {
  const originalNum = extractNumber(row.original)
  const numDiff = Math.abs(extractNumber(calculateDiff(row)))
  if (originalNum <= 0) return '0%'
  const percentage = (numDiff / originalNum) * 100
  return `${Math.min(percentage, 100)}%`
}

const getDiffValue = (row: any): string => {
  const numDiff = extractNumber(calculateDiff(row))
  if (typeof row.original === 'string' && row.original.includes('分钟')) {
    return `${Math.abs(numDiff)}分钟`
  }
  return Math.abs(numDiff).toString()
}

const getDiffValueClass = (row: any): string => {
  const numDiff = extractNumber(calculateDiff(row))
  return numDiff < 0 ? 'diff-value-green' : 'diff-value-red'
}

onMounted(() => {
  nextTick(() => {
    if (chartRef.value) {
      chartInstance.value = echarts.init(chartRef.value)
      updateChart()

      window.addEventListener('resize', () => {
        chartInstance.value?.resize()
      })
    }
  })
})

watch([timeRange, thresholds, rules], () => {
  updateChart()
}, { deep: true })
</script>

<template>
  <div class="dashboard-container">
    <div class="left-panel">
      <SectionCard title="参数配置" shadow="never" flex height="100%">
        <div class="config-content">
          <div class="config-section time-section">
            <el-form label-position="top" size="small">
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="timeRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  style="width: 100%"
                />
              </el-form-item>
            </el-form>

            <div class="quick-time-tags">
              <el-tag 
                v-for="tag in quickTimeTags" 
                :key="tag.value"
                :type="selectedQuickTime === tag.value ? 'primary' : 'info'"
                @click="handleQuickTime(tag.value)"
                class="quick-time-tag"
              >
                {{ tag.label }}
              </el-tag>
            </div>
          </div>

          <div class="config-section threshold-section">
            <div class="section-divider">
              <div class="section-divider-text">阈值设定</div>
            </div>

            <div class="matrix-form">
              <div class="matrix-header">
                <div class="matrix-header-col">参数项</div>
                <div class="matrix-header-col">原值</div>
                <div class="matrix-header-col">模拟值</div>
              </div>

              <div class="matrix-row" :class="`matrix-row-${key}`" v-for="(value, key) in thresholds" :key="key">
                <div class="matrix-label">{{ getThresholdLabel(key) }}</div>
                <div class="matrix-value">
                  <el-input
                    type="number"
                    v-model="value.original"
                    disabled
                    size="small"
                  />
                </div>
                <div class="matrix-value">
                  <el-input
                    type="number"
                    v-model="value.simulated"
                    size="small"
                    @input="(val: string) => handleThresholdChange(key, 'simulated', val)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="config-section rules-section">
            <div class="section-divider">
              <div class="section-divider-text">规则设定</div>
            </div>

            <div class="rules-form">
              <div class="rule-row">
                <div class="rule-label">死区</div>
                <div class="rule-value">
                  <el-input
                    type="number"
                    v-model="rules.deadband.original"
                    disabled
                    size="small"
                  >
                    <template #append>%</template>
                  </el-input>
                </div>
                <div class="rule-value">
                  <el-input
                    type="number"
                    v-model="rules.deadband.simulated"
                    size="small"
                    @input="(val: string) => handleRuleChange('deadband', 'simulated', val)"
                  >
                    <template #append>%</template>
                  </el-input>
                </div>
              </div>

              <div class="rule-row">
                <div class="rule-label">延时</div>
                <div class="rule-value">
                  <el-input
                    type="number"
                    v-model="rules.delay.original"
                    disabled
                    size="small"
                  >
                    <template #append>S</template>
                  </el-input>
                </div>
                <div class="rule-value">
                  <el-input
                    type="number"
                    v-model="rules.delay.simulated"
                    size="small"
                    @input="(val: string) => handleRuleChange('delay', 'simulated', val)"
                  >
                    <template #append>S</template>
                  </el-input>
                </div>
              </div>
            </div>
          </div>

          <div class="config-section action-section">
            <div class="action-buttons">
              <el-button @click="handleReset" size="small">
                <el-icon><RefreshRight /></el-icon>
                重置
              </el-button>
              <el-button type="primary" @click="handleCalculate" size="small">
                计算
              </el-button>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <div class="right-panel">
      <SectionCard title="工艺数值趋势分析" shadow="never">
        <div ref="chartRef" class="chart-container"></div>
      </SectionCard>

      <SectionCard title="报警分析表" shadow="never" flex height="100%">
        <el-table :data="alarmData" stripe border class="alarm-table" :header-cell-style="{ backgroundColor: '#F5F7FA', fontWeight: '600' }">
          <el-table-column prop="type" label="报警类型" width="180" align="center" />
          <el-table-column prop="original" label="原值报警总数" min-width="150" align="center">
            <template #default="{ row }">
              <span class="numeric-font">{{ row.original }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="simulated" label="模拟值报警总数" min-width="150" align="center">
            <template #default="{ row }">
              <span class="numeric-font">{{ row.simulated }}</span>
            </template>
          </el-table-column>
          <el-table-column label="差值条" min-width="200" align="center">
            <template #default="{ row }">
              <div class="diff-bar-container">
                <div 
                  class="diff-bar" 
                  :class="getDiffBarClass(row)"
                  :style="{ width: getDiffBarWidth(row) }"
                ></div>
                <span class="diff-value" :class="getDiffValueClass(row)">
                  {{ getDiffValue(row) }}
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  gap: 16px;
  padding: 8px;
  width: 100%;
  min-height: calc(100vh - 64px);
  height: auto;
  align-items: flex-start;
  background: #f5f7fa;
}

.left-panel {
  flex: 0 0 320px;
  align-self: flex-start;
  position: sticky;
  top: 16px; 
  height: fit-content;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 1;
  min-width: 0px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-panel::-webkit-scrollbar {
  width: 6px;
}

.right-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.right-panel::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.right-panel::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.config-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.config-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.config-section.time-section {
  flex: 0 0 auto;
}

.config-section.threshold-section {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.config-section.rules-section {
  flex: 0 0 auto;
}

.config-section.action-section {
  flex: 0 0 auto;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.quick-time-tags {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.quick-time-tag {
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  padding: var(--spacing-xs) var(--spacing-md);
}

.quick-time-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-divider {
  position: relative;
  margin: var(--spacing-md) 0 var(--spacing-sm) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid #E4E7ED;
  flex-shrink: 0;
}

.section-divider-text {
  position: absolute;
  top: -8px;
  left: 0;
  background-color: #fff;
  padding-right: var(--spacing-md);
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.matrix-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-height: 0;
}

.matrix-header {
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  border-bottom: 2px solid #E4E7ED;
  margin-bottom: var(--spacing-sm);
}

.matrix-header-col {
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  text-align: center;
}

.matrix-header-col:first-child {
  text-align: left;
  padding-left: var(--spacing-sm);
}

.matrix-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  gap: var(--spacing-sm);
  align-items: center;
  padding: var(--spacing-sm) 0;
  margin-bottom: var(--spacing-md); /* 16px */
  border-bottom: 1px solid #EBEEF5;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.matrix-row:hover {
  border-left-color: #409EFF;
}

.matrix-row-hh {
  border-left-color: #F56C6C;
}

.matrix-row-h {
  border-left-color: #E6A23C;
}

.matrix-row-l {
  border-left-color: #E6A23C;
}

.matrix-row-ll {
  border-left-color: #F56C6C;
}

.matrix-row:last-child {
  border-bottom: none;
}

.matrix-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-left: 8px;
}

.matrix-value {
  display: flex;
  align-items: center;
  justify-content: center;
}

.matrix-value :deep(.el-input__inner) {
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.matrix-value :deep(.el-input.is-disabled .el-input__inner) {
  background-color: #F5F7FA;
  color: #909399;
  cursor: not-allowed;
}

.rules-form {
  margin-bottom: var(--spacing-md);
}

.rule-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  gap: var(--spacing-sm);
  align-items: center;
  padding: var(--spacing-sm) 0;
  margin-bottom: var(--spacing-md); /* 16px */
}

.rule-row:last-child {
  margin-bottom: 0;
}

.rule-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-left: 8px;
}

.rule-value {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rule-value :deep(.el-input__inner) {
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.rule-value :deep(.el-input.is-disabled .el-input__inner) {
  background-color: #F5F7FA;
  color: #909399;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
  width: 100%;
}

.action-buttons .el-button {
  flex: 1;
}

.chart-container {
  height: 400px;
}

.alarm-table {
  width: 100%;
  font-variant-numeric: tabular-nums;
}

.alarm-table :deep(.el-table__header-wrapper) {
  background-color: #F5F7FA;
}

.alarm-table :deep(.el-table__header th) {
  background-color: #F5F7FA;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.alarm-table :deep(.el-table__body td) {
  font-size: 14px;
  font-weight: 400;
  color: #606266;
}

.alarm-table :deep(.el-table__body td .main-number) {
  font-family: 'Inter', 'Roboto', sans-serif;
  font-variant-numeric: tabular-nums;
}

.alarm-table :deep(.el-table__row) {
  font-variant-numeric: tabular-nums;
}

.alarm-table :deep(.el-table__cell) {
  font-variant-numeric: tabular-nums;
}

.numeric-font {
  font-family: 'JetBrains Mono', 'Roboto Mono', 'Courier New', monospace;
  font-variant-numeric: tabular-nums;
}

.diff-bar-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
}

.diff-bar {
  height: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.diff-bar-green {
  background-color: #52c41a;
}

.diff-bar-red {
  background-color: #ff4d4f;
}

.diff-value {
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.diff-value-green {
  color: #52c41a;
}

.diff-value-red {
  color: #ff4d4f;
}

@media (max-width: 1200px) {
  .numeric-lab {
    flex-direction: column;
  }
  
  .config-panel {
    flex: 1;
    max-width: 100%;
  }
  
  .analysis-panel {
    min-width: 100%;
  }
}

@media (max-width: 768px) {
  .numeric-lab {
    gap: 16px;
  }
  
  .config-panel {
    min-width: 100%;
  }
  
  .analysis-panel {
    min-width: 100%;
  }
  
  .stats-cards {
    flex-direction: column;
  }
  
  .stat-card {
    width: 100%;
  }
  
  .stat-value {
    font-size: 28px;
  }
}
</style>
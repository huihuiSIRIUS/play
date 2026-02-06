<template>
  <div class="realtime-monitoring-analysis">
    <div class="analysis-header">
      <el-button type="primary" @click="handleBack">返回</el-button>
    </div>

    <div class="analysis-container">
      <div class="left-panel">
        <div class="section-point-info">
          <h3 class="section-title">点位信息</h3>
          <div class="point-info-grid">
            <div class="info-item">
              <div class="label">监测点名称</div>
              <div class="value">{{ pointInfo.pointName }}</div>
            </div>
            <div class="info-item">
              <div class="label">点位位号</div>
              <div class="value">{{ pointInfo.pointNumber }}</div>
            </div>
            <div class="info-item">
              <div class="label">报警种类</div>
              <div class="value">{{ pointInfo.alarmType }}</div>
            </div>
            <div class="info-item">
              <div class="label">安装位置</div>
              <div class="value">{{ pointInfo.installationLocation }}</div>
            </div>
            <div class="info-item">
              <div class="label">低低报</div>
              <div class="value">{{ pointInfo.lowLowAlarm }} {{ pointInfo.unit }}</div>
            </div>
            <div class="info-item">
              <div class="label">低报</div>
              <div class="value">{{ pointInfo.lowAlarm }} {{ pointInfo.unit }}</div>
            </div>
            <div class="info-item">
              <div class="label">高报</div>
              <div class="value">{{ pointInfo.highAlarm }} {{ pointInfo.unit }}</div>
            </div>
            <div class="info-item">
              <div class="label">高高报</div>
              <div class="value">{{ pointInfo.highHighAlarm }} {{ pointInfo.unit }}</div>
            </div>
          </div>
        </div>

        <div class="section-alarm-stats">
          <h3 class="section-title">告警统计</h3>
          <div class="alarm-statistics">
            <div 
              v-for="stat in alarmStatistics" 
              :key="stat.key"
              class="stat-block"
            >
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <div class="section-chart">
          <h3 class="section-title">历史趋势图</h3>
          <div class="history-chart">
            <div ref="chartRef" style="width: 100%; height: 100%;"></div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="section-stability">
          <h3 class="section-title">点位平稳率</h3>
          <div class="stability-rate-card">
            <div class="rate-value">{{ stabilityRate }}%</div>
          </div>
        </div>

        <div class="section-reasons">
          <h3 class="section-title">报警原因排行榜</h3>
          <el-table :data="alarmReasonsTop10" style="width: 100%">
            <el-table-column prop="reason" label="报警原因" min-width="200" align="center" />
            <el-table-column prop="count" label="报警次数" min-width="100" align="center" />
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const emit = defineEmits<{
  (e: 'back'): void
}>()

// 点位信息
const pointInfo = ref({
  pointName: '温度监测点1',
  pointNumber: 'PT-101',
  alarmType: '温度报警',
  installationLocation: '反应釜1',
  lowLowAlarm: 50,
  lowAlarm: 60,
  highAlarm: 90,
  highHighAlarm: 100,
  unit: '℃'
})

// 点位平稳率
const stabilityRate = ref(90.86)

// 告警统计
const alarmStatistics = ref([
  { key: 'total', label: '总报警次数', value: 120 },
  { key: 'duration', label: '总报警时长(分钟)', value: 360 },
  { key: 'll', label: 'LL报警', value: 12 },
  { key: 'l', label: 'L报警', value: 28 },
  { key: 'hh', label: 'HH报警', value: 8 },
  { key: 'h', label: 'H报警', value: 32 },
  { key: 'instant', label: '瞬时报警', value: 25 },
  { key: 'shake', label: '抖动报警', value: 15 }
])

// 报警原因排行榜
const alarmReasonsTop10 = ref([
  { reason: '温度过高', count: 35 },
  { reason: '压力异常', count: 28 },
  { reason: '液位过低', count: 22 },
  { reason: '流量不稳定', count: 18 },
  { reason: '传感器故障', count: 15 },
  { reason: '系统波动', count: 12 },
  { reason: '人为操作', count: 10 },
  { reason: '设备老化', count: 8 },
  { reason: '环境干扰', count: 6 },
  { reason: '其他原因', count: 4 }
])

// 图表相关
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 生成模拟历史数据
const generateHistoryData = () => {
  const data = []
  const now = new Date()
  
  // 生成过去24小时的数据，每小时一个点
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    const baseValue = 80 // 基础值
    const fluctuation = (Math.random() - 0.5) * 30 // 波动范围
    const value = baseValue + fluctuation
    
    data.push({
      time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat(value.toFixed(1))
    })
  }
  
  return data
}

const historyData = ref(generateHistoryData())

// 方法
const handleBack = () => {
  console.log('返回')
  emit('back')
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  // 准备数据
  const times = historyData.value.map(item => item.time)
  const values = historyData.value.map(item => item.value)
  
  // 阈值
  const thresholds = {
    LL: pointInfo.value.lowLowAlarm,
    L: pointInfo.value.lowAlarm,
    H: pointInfo.value.highAlarm,
    HH: pointInfo.value.highHighAlarm
  }
  
  // 图表配置
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        let result = params[0].name + '<br/>'
        params.forEach((param: any) => {
          result += param.marker + param.seriesName + ': ' + param.value + ' ' + pointInfo.value.unit + '<br/>'
        })
        return result
      }
    },
    legend: {
      data: ['实时值', 'LL', 'L', 'H', 'HH'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times
    },
    yAxis: {
      type: 'value',
      name: '数值 (' + pointInfo.value.unit + ')',
      axisLabel: {
        formatter: '{value} ' + pointInfo.value.unit
      }
    },
    series: [
      {
        name: '实时值',
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: '#1890ff'
        },
        itemStyle: {
          color: '#1890ff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(24, 144, 255, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(24, 144, 255, 0.1)'
            }
          ])
        }
      },
      {
        name: 'LL',
        type: 'line',
        data: Array(times.length).fill(thresholds.LL),
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#f5222d',
          type: 'dashed'
        },
        itemStyle: {
          color: '#f5222d'
        }
      },
      {
        name: 'L',
        type: 'line',
        data: Array(times.length).fill(thresholds.L),
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#f5222d',
          type: 'dashed'
        },
        itemStyle: {
          color: '#f5222d'
        }
      },
      {
        name: 'H',
        type: 'line',
        data: Array(times.length).fill(thresholds.H),
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#f5222d',
          type: 'dashed'
        },
        itemStyle: {
          color: '#f5222d'
        }
      },
      {
        name: 'HH',
        type: 'line',
        data: Array(times.length).fill(thresholds.HH),
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#f5222d',
          type: 'dashed'
        },
        itemStyle: {
          color: '#f5222d'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  chart?.resize()
}

// 生命周期钩子
onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.realtime-monitoring-analysis {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.analysis-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

/* 全局布局 */
.analysis-container {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 左侧区域 */
.section-point-info,
.section-alarm-stats,
.section-chart {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
/* 点位信息样式 */
.point-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #909399;
}

.value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

/* 告警统计样式 */
.alarm-statistics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 10px;
}

.stat-block {
  background: #1890ff;
  color: white;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
}

/* 历史趋势图样式 */
.section-chart {
  margin-top: 20px;
}

.history-chart {
  background: #f5f7fa;
  padding: 40px;
  border-radius: 8px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.chart-placeholder {
  text-align: center;
  color: #606266;
}

.chart-placeholder p {
  margin: 8px 0;
}

.chart-info {
  font-size: 14px;
  opacity: 0.8;
}

/* 右侧区域 */
.section-stability,
.section-reasons {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


/* 点位平稳率样式 */
.stability-rate-card {
  background: white;
  border: none;
  border-radius: 8px;
  padding: 0x;
  text-align: center;
  margin-top: 10px;
  height: auto;
}

.rate-value {
  font-size: 48px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}

.rate-label {
  font-size: 16px;
  color: #606266;
}

/* 报警原因样式 */
.section-reasons {
  margin-top: 20px;
}

/* 响应式调整 */
@media (max-width: 1400px) {
  .analysis-container {
    grid-template-columns: 1fr;
  }

  .alarm-statistics {
    grid-template-columns: repeat(2, 1fr);
  }

  .point-info-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-item {
    margin-bottom: 8px;
  }

  .threshold-item {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .analysis-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .alarm-statistics {
    grid-template-columns: 1fr;
  }

  .history-chart {
    height: 300px;
    padding: 20px;
  }
}
</style>
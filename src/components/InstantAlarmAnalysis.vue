<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import {
  Search,
  Download
} from '@element-plus/icons-vue'

// --- 1. 工具函数定义 (放在最前面，防止引用报错) ---
const getRecent30Days = (): [string, string] => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }
  
  return [formatDate(start), formatDate(end)]
}

// --- 2. 响应式数据 ---
// 使用函数初始化，获取动态的最近30天
const dateRange = ref<[string, string]>(getRecent30Days())

// 图表引用
const trendChartRef = ref<HTMLElement | null>(null)
const distributionChartRef = ref<HTMLElement | null>(null)

// 图表实例
let trendChart: echarts.ECharts | null = null
let distributionChart: echarts.ECharts | null = null

// 弹窗控制
const detailDialogVisible = ref(false)
const selectedRow = ref<any>(null)

// 明细数据
const detailData = ref<any[]>([])

// 生成 100 条模拟数据
const generateMockData = () => {
  const data = []
  const departments = ['1工段', '2工段', '3工段', '4工段', '5工段']
  const pointTypes = ['温度变送器', '流量变送器', '液位变送器', '压力变送器']
  const reasons = [
    '设备振动异常，超出正常范围',
    '传感器信号波动较大，可能受到干扰',
    '系统压力不稳定，导致数据抖动',
    '电源电压波动，影响设备运行',
    '环境温度变化较大，导致测量误差',
    '管道流体湍流，引起压力波动',
    '设备老化，传感器灵敏度下降',
    '控制系统参数设置不合理',
    '外部干扰信号影响',
    '测量回路接触不良'
  ]
  const rectifications = [
    '检查设备固定情况，重新紧固螺丝',
    '更换传感器，提高测量精度',
    '调整系统压力，稳定运行参数',
    '安装稳压电源，确保供电稳定',
    '改善环境通风，控制温度变化',
    '优化管道设计，减少湍流影响',
    '更换老化设备，恢复正常功能',
    '重新整定控制系统参数',
    '安装屏蔽措施，减少外部干扰',
    '检查并修复测量回路接线'
  ]
  
  for (let i = 1; i <= 100; i++) {
    // 随机生成过去30天内的时间
    const start = new Date()
    start.setDate(start.getDate() - Math.floor(Math.random() * 30))
    start.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60))
    
    // 持续时间 5-15 分钟
    const durationMinutes = Math.floor(Math.random() * 10) + 5
    const durationSeconds = Math.floor(Math.random() * 60)
    const end = new Date(start.getTime() + (durationMinutes * 60 + durationSeconds) * 1000)
    
    // 处理时间：消警后随机时间
    const handleTime = new Date(end.getTime() + Math.floor(Math.random() * 30 * 60 * 1000))
    
    // 生成随机监测点
    const pointType = pointTypes[Math.floor(Math.random() * pointTypes.length)]
    const typeCode = ['TIC', 'FIC', 'LIC', 'PIC'][pointTypes.indexOf(pointType)]
    const num = String(i).padStart(3, '0')
    const pointCode = `${typeCode}-${num}`
    
    // 随机选择原因和整改措施
    const alarmReason = reasons[Math.floor(Math.random() * reasons.length)]
    const rectification = rectifications[Math.floor(Math.random() * rectifications.length)]
    
    data.push({
      index: i,
      pointName: pointType,
      pointCode: pointCode,
      department: departments[Math.floor(Math.random() * departments.length)],
      alarmTime: start.toLocaleString(),
      clearTime: end.toLocaleString(),
      handleTime: handleTime.toLocaleString(),
      alarmDuration: durationMinutes,
      alarmReason: alarmReason,
      rectification: rectification,
      duration: `${durationMinutes}分${durationSeconds}秒`
    })
  }
  detailData.value = data
}

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性：分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return detailData.value.slice(start, end)
})

// 分页事件处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// --- 3. 方法 ---

// 修复：将参数类型改为 any，兼容 Element Plus 可能返回 null 的情况
const handleDateRangeChange = (val: any) => {
  console.log('日期范围变化:', val)
  if (val) {
    updateCharts()
  }
}

const openDetail = (row: any) => {
  console.log('打开详情:', row)
  selectedRow.value = row
  detailDialogVisible.value = true
}

// 初始化图表
const initCharts = () => {
  initTrendChart()
  initDistributionChart()
}

// 初始化趋势图
const initTrendChart = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}次'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['01-01', '01-02', '01-03', '01-04', '01-05', '01-06', '01-07', '01-08', '01-09', '01-10', '01-11', '01-12', '01-13', '01-14', '01-15', '01-16', '01-17', '01-18', '01-19', '01-20', '01-21', '01-22', '01-23', '01-24', '01-25', '01-26', '01-27', '01-28', '01-29', '01-30']
      },
      yAxis: {
        type: 'value',
        name: '发生次数'
      },
      series: [{
        name: '瞬时报警次数',
        type: 'line',
        smooth: true,
        data: [45, 52, 48, 55, 60, 58, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95, 98, 100, 102, 105, 108, 110, 112, 115, 118, 120],
        lineStyle: {
          color: '#1890ff',
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ])
        }
      }]
    }
    trendChart.setOption(option)
  }
}

// 初始化分布图
const initDistributionChart = () => {
  if (distributionChartRef.value) {
    distributionChart = echarts.init(distributionChartRef.value)
    
    // 计算总数
    const data = [
      { value: 320, name: '1工段' },
      { value: 280, name: '2工段' },
      { value: 240, name: '3工段' },
      { value: 200, name: '4工段' },
      { value: 205, name: '5工段' }
    ]
    const total = data.reduce((a, b) => a + b.value, 0)

    const option = {
      // 颜色盘
      color: ['#1890ff', '#fa8c16', '#722ed1', '#ff4d4f', '#52c41a'],
      
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      
      // 中间显示总数
      title: {
        text: total.toString(),
        subtext: '瞬时次数',
        left: '39%',
        top: '48%',
        textAlign: 'center',
        textBaseline: 'middle',
        textStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#303133'
        },
        subtextStyle: {
          fontSize: 12,
          color: '#909399',
          lineHeight: 16
        }
      },
      
      // 图例
      legend: {
        orient: 'vertical',
        right: '10%',
        top: 'middle',
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
        icon: 'circle',
        textStyle: {
          fontSize: 12,
          color: '#606266'
        },
        formatter: (name: string) => {
            const item = data.find(i => i.name === name);
            return `${name}   ${item ? item.value : ''}`;
        }
      },
      
      series: [{
        name: '瞬时报警',
        type: 'pie',
        radius: ['55%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 3
        },
        
        label: {
          show: false,
          position: 'center'
        },
        
        // 鼠标悬停时放大
        emphasis: {
          scale: true,
          scaleSize: 10,
          label: {
            show: false
          }
        },
        
        labelLine: {
          show: false
        },
        
        data: data
      }]
    }
    
    distributionChart.setOption(option)
  }
}

// 更新图表
const updateCharts = () => {
  console.log('更新图表数据')
  initCharts()
}

// 监听窗口大小变化
const handleResize = () => {
  trendChart?.resize()
  distributionChart?.resize()
}

// 生命周期钩子
onMounted(() => {
  generateMockData() // 初始化生成模拟数据
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 清理函数
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  distributionChart?.dispose()
})
</script>

<template>
  <div class="analysis-page">
    <div class="search-toolbar">
      <span class="toolbar-label">统计范围：</span>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @change="handleDateRangeChange"
        class="date-range-picker"
      />
      <el-button type="primary" :icon="Search" @click="initCharts">
        搜索
      </el-button>
    </div>
    
    <div class="statistics-section">
      <div class="section-header">
        <span>关键指标统计</span>
      </div>
      <div class="stats-cards">
        
        <div class="stat-card blue">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">总瞬时次数</div>
              <div class="stat-value">1,245<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-18.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card orange">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">工艺报警次数</div>
              <div class="stat-value">456<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-19.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card purple">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">设备报警次数</div>
              <div class="stat-value">328<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-down">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-20.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card red">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">安全报警次数</div>
              <div class="stat-value">215<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-21.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card green">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">联锁报警次数</div>
              <div class="stat-value">246<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-22.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <div class="chart-row">
      <el-card class="chart-card trend-chart">
        <template #header>
          <div class="section-header">
            <span>瞬时报警次数统计图</span>
          </div>
        </template>
        <div class="chart-container" ref="trendChartRef"></div>
      </el-card>
      
      <el-card class="chart-card distribution-chart">
        <template #header>
          <div class="section-header">
            <span>瞬时报警发生原因占比</span>
          </div>
        </template>
        <div class="chart-container" ref="distributionChartRef"></div>
      </el-card>
    </div>
    
    <el-card class="detail-card">
      <template #header>
        <div class="section-header">
          <span>瞬时报警台账</span>
          <el-button type="primary" size="small" class="export-btn">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </template>
      <el-table :data="paginatedData" stripe style="width: 100%">
        <el-table-column prop="index" label="序号" width="80" align="center" />
        <el-table-column prop="pointName" label="监测点名称" width="120" align="center"/>
        <el-table-column prop="pointCode" label="监测点位号" width="120" align="center"/>
        <el-table-column prop="department" label="所属部门" width="100" align="center"/>
        <el-table-column prop="alarmTime" label="报警时间" width="auto" align="center"/>
        <el-table-column prop="clearTime" label="消警时间" width="auto" align="center"/>
        <el-table-column prop="handleTime" label="处理时间" width="auto" align="center"/>
        <el-table-column prop="alarmDuration" label="报警时长(min)" width="120" align="center"/>
        <el-table-column prop="alarmReason" label="报警原因" min-width="150" align="center">
          <template #default="scope">
            <el-tooltip :content="scope.row.alarmReason" placement="top">
              <div class="text-ellipsis">{{ scope.row.alarmReason }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="rectification" label="整改措施" min-width="150" align="center">
          <template #default="scope">
            <el-tooltip :content="scope.row.rectification" placement="top">
              <div class="text-ellipsis">{{ scope.row.rectification }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="detailData.length"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <el-dialog
      v-model="detailDialogVisible"
      title="瞬时报警详情"
      width="80%"
      class="industrial-dialog"
    >
      <div class="modal-content">
        <div v-if="selectedRow" class="detail-info">
          <div class="info-item">
            <span class="info-label">监测点名称：</span>
            <span class="info-value">{{ selectedRow.pointName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">监测点位号：</span>
            <span class="info-value">{{ selectedRow.pointCode }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">所属部门：</span>
            <span class="info-value">{{ selectedRow.department }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">报警时间：</span>
            <span class="info-value">{{ selectedRow.alarmTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">消警时间：</span>
            <span class="info-value">{{ selectedRow.clearTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">持续时间：</span>
            <span class="info-value">{{ selectedRow.duration }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.analysis-page {
  padding: 8px;
  height: 100%;
  background: #f5f7fa;
}

/* 搜索工具栏 */
.search-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;
}

.date-range-picker {
  border-radius: 8px;
}

/* 核心指标卡片 */
.statistics-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 标题左侧的蓝色竖条装饰 */
.section-header::before {
  content: "";
  display: block;
  width: 4px;
  height: 16px;
  background: #409EFF;
  margin-right: 8px;
  border-radius: 2px;
}

/* 卡片布局容器 */
.stats-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

/* 单个卡片样式 */
.stat-card {
  flex: 1;
  min-width: 220px;
  height: 100px;
  border-radius: 8px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

/* 自定义渐变背景色 */
/* 蓝色系 */
.stat-card.blue {
  background: linear-gradient(90deg, 
  rgba(209, 227, 255, 0.8) 0%,
  rgba(235, 241, 255, 0.8) 100%);
}
/* 橙色系 */
.stat-card.orange {
  background: linear-gradient(90deg,
  rgba(255, 208, 171, 0.6) 0%,
  rgba(255, 242, 232, 0.6) 100%);
}
/* 紫色系 */
.stat-card.purple {
 background: linear-gradient(90deg,
  rgba(204, 207, 255, 0.6) 0%,   /* 起始颜色 */
  rgba(230, 231, 255, 0.6) 100%  /* 结束颜色 */); 
}
/* 红色系 */
.stat-card.red {
  background: linear-gradient(90deg,  
  rgba(255, 196, 211, 0.6) 0%,
  rgba(255, 230, 235, 0.6) 100%);
}
/* 绿色系 */
.stat-card.green {
  background: linear-gradient(90deg,
  rgba(195, 251, 241, 0.6) 0%,   
  rgba(230, 251, 247, 0.6) 100%  
); 
}

/* 卡片数字颜色 */
.stat-card.blue .stat-value {
  color: #2681ff;
}

.stat-card.orange .stat-value {
  color: #fc8428;
}

.stat-card.purple .stat-value {
  color: #6A5BDE;
}

.stat-card.red .stat-value {
  color: #FF4D55;
}

.stat-card.green .stat-value {
  color: #08C47F;
}

/* 卡片标题颜色 */
.stat-card.blue .stat-title {
  color: #2681ff;
  opacity: 0.8;
}

.stat-card.orange .stat-title {
  color: #fc8428;
  opacity: 0.9;
}

.stat-card.purple .stat-title {
  color: #6A5BDE;
  opacity: 0.9;
}

.stat-card.red .stat-title {
  color: #FF4D55;
  opacity: 0.9;
}

.stat-card.green .stat-title {
  color: #08C47F;
  opacity: 0.9;
}

/* 内容布局：左右分开 */
.stat-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 左侧文字区 */
.card-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.stat-title {
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  font-family: 'JetBrains Mono', sans-serif;
  line-height: 1.2;
}

/* 趋势文字 */
.stat-trend {
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.trend-up { color: #F56C6C; }
.trend-down { color: #67C23A; }

/* 右侧图片区 */
.card-right {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 自定义图片样式 */
.custom-icon-img {
  width: 56px;
  height: 56px;
  object-fit: contain;
  opacity: 0.9;
}

/* 图表行 */
.chart-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.chart-card {
  flex: 1;
  min-width: 300px;
  border-radius: 8px;
  overflow: hidden;
}

.trend-chart {
  flex: 2;
}

.distribution-chart {
  flex: 1;
}

/* 图表容器样式 */
/* .chart-container {
  height: 300px;
  width: 100%;
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
} */

/* 明细卡片 */
.detail-card {
  border-radius: 8px;
  overflow: hidden;
}

.export-btn {
  margin-left: auto;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

/* 详情弹窗样式 */
.detail-info {
  padding: 20px;
}

.info-item {
  margin-bottom: 16px;
  display: flex;
}

.info-label {
  width: 120px;
  font-weight: 500;
  color: #303133;
}

.info-value {
  flex: 1;
  color: #606266;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards {
    flex-direction: column;
  }
  
  .stat-card {
    width: 100%;
  }
  
  .chart-row {
    flex-direction: column;
  }
  
  .detail-card {
    min-width: 100%;
  }
  
  .search-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}

.stat-unit {
  font-size: 14px;
  margin-left: 4px;
  font-weight: normal;
  opacity: 0.8;
}
/* --- 修复：卡片标题与内容间距过大 --- */

/* 1. 去掉卡片内标题的下边距 (针对图表卡片和底部明细卡片) */
.chart-card .section-header,
.detail-card .section-header {
  margin-bottom: 0 !important;
}

/* 2. 调整 Card Body 的内边距 (让内容往上提一点，更紧凑) */
/* 使用 :deep() 穿透 Element Plus 的默认样式 */
.chart-card :deep(.el-card__body),
.detail-card :deep(.el-card__body) {
  padding-top: 10px; /* 建议设为 10px 或 0 */
}
</style>
<template>
  <div class="analysis-page">
    
    <!-- 时间筛选器 -->
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
      <el-button type="primary" @click="initCharts">
        搜索
      </el-button>
    </div>
    
    <!-- 核心指标 -->
    <div class="statistics-section">
      <div class="section-header">
        <span>关键指标统计</span>
      </div>
      <div class="stats-cards">
        
        <div class="stat-card blue">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">总陈旧报警次数</div>
              <div class="stat-value">1,280<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-23.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card orange">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">总陈旧报警时长</div>
              <div class="stat-value">4,680<span class="stat-unit">小时</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-24.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card purple">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">≤48小时数量</div>
              <div class="stat-value">420<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-down">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-25.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card red">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">≤72小时数量</div>
              <div class="stat-value">360<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-26.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card green">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">＞72小时数量</div>
              <div class="stat-value">500<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-27.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <!-- 趋势分析和分布分析 -->
    <div class="chart-row">
      <!-- 陈旧报警时长统计图 -->
      <el-card class="chart-card trend-chart">
        <template #header>
          <div class="section-header">
            <span>陈旧报警时长统计图</span>
          </div>
        </template>
        <div class="chart-container" ref="trendChartRef"></div>
      </el-card>
      
      <!-- 陈旧报警工序占比 -->
      <el-card class="chart-card distribution-chart">
        <template #header>
          <div class="section-header">
            <span>陈旧报警工序占比</span>
          </div>
        </template>
        <div class="chart-container" ref="distributionChartRef"></div>
      </el-card>
    </div>
    
    <!-- 明细查询 -->
    <el-card class="detail-card">
      <template #header>
        <div class="section-header">
          <span>陈旧报警明细</span>
          <el-button type="primary" size="small" class="export-btn">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </template>
      <el-table :data="paginatedData" stripe style="width: 100%">
        <el-table-column prop="index" label="序号" width="80" align="center" />
        <el-table-column prop="pointName" label="监测点名称" align="center"/>
        <el-table-column prop="pointCode" label="监测点位号" width="150" align="center"/>
        <el-table-column prop="department" label="所属部门" width="120" align="center"/>
        <el-table-column prop="alarmTime" label="报警时间" width="180" align="center"/>
        <el-table-column prop="clearTime" label="消警时间" width="180" align="center"/>
        <el-table-column prop="processTime" label="处理时间" width="180" align="center"/>
        <el-table-column prop="duration" label="持续时间" width="120" align="center"/>
        <el-table-column prop="alarmReason" label="报警原因" align="center"/>
        <el-table-column prop="rectificationMeasure" label="整改措施" align="center"/>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="staleAlarmDetail.length"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="陈旧报警详情"
      width="80%"
      class="industrial-dialog"
    >
      <div class="modal-content">
        <el-form :model="detailForm" label-width="120px">
          <el-form-item label="监测点名称">
            <el-input v-model="detailForm.pointName" disabled />
          </el-form-item>
          <el-form-item label="监测点位号">
            <el-input v-model="detailForm.pointCode" disabled />
          </el-form-item>
          <el-form-item label="所属部门">
            <el-input v-model="detailForm.department" disabled />
          </el-form-item>
          <el-form-item label="报警时间">
            <el-input v-model="detailForm.alarmTime" disabled />
          </el-form-item>
          <el-form-item label="消警时间">
            <el-input v-model="detailForm.clearTime" disabled />
          </el-form-item>
          <el-form-item label="持续时间">
            <el-input v-model="detailForm.duration" disabled />
          </el-form-item>
          <el-form-item label="报警原因">
            <el-input v-model="detailForm.reason" disabled type="textarea" />
          </el-form-item>
          <el-form-item label="处理措施">
            <el-input v-model="detailForm.measure" disabled type="textarea" />
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'
import { Download } from '@element-plus/icons-vue'

// 响应式数据
const dateRange = ref<[string, string]>([
  '2024-01-01',
  '2024-01-30'
])

// 图表引用
const trendChartRef = ref<HTMLElement>()
const distributionChartRef = ref<HTMLElement>()

// 图表实例
let trendChart: echarts.ECharts | null = null
let distributionChart: echarts.ECharts | null = null

// 弹窗控制
const detailDialogVisible = ref(false)

// 弹窗表单数据
const detailForm = ref({
  pointName: '',
  pointCode: '',
  department: '',
  alarmTime: '',
  clearTime: '',
  duration: '',
  reason: '',
  measure: ''
})

// 陈旧报警明细数据
const staleAlarmDetail = ref<any[]>([])

// 生成 100 条模拟数据
const generateMockData = () => {
  const data = []
  const pointTypes = ['温度变送器', '压力变送器', '液位变送器', '流量变送器']
  const departments = ['甲醇装置', '乙醇装置', '乙炔装置', '氯乙烯装置', '盐酸装置']
  
  for (let i = 1; i <= 100; i++) {
    // 随机生成过去60天内的时间
    const start = new Date()
    start.setDate(start.getDate() - Math.floor(Math.random() * 60))
    start.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60))
    
    // 持续时间 1-240 小时
    const durationHours = Math.floor(Math.random() * 240) + 1
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000)
    
    // 生成随机监测点
    const pointType = pointTypes[Math.floor(Math.random() * pointTypes.length)]
    const typeCode = ['TIC', 'PIC', 'LIC', 'FIC'][pointTypes.indexOf(pointType)]
    const num = String(i).padStart(3, '0')
    const pointCode = `${typeCode}-${num}`
    
    // 处理时间（在报警时间和消警时间之间）
    const processTime = new Date(start.getTime() + Math.floor(Math.random() * durationHours) * 60 * 60 * 1000)
    
    // 报警原因和整改措施
    const alarmReasons = ['设备故障', '工艺波动', '传感器异常', '人为操作失误', '系统误报']
    const rectificationMeasures = ['更换设备', '调整工艺参数', '校准传感器', '加强人员培训', '优化系统设置']
    const alarmReason = alarmReasons[Math.floor(Math.random() * alarmReasons.length)]
    const rectificationMeasure = rectificationMeasures[Math.floor(Math.random() * rectificationMeasures.length)]
    
    data.push({
      index: i,
      pointName: pointType,
      pointCode: pointCode,
      department: departments[Math.floor(Math.random() * departments.length)],
      alarmTime: start.toLocaleString(),
      clearTime: end.toLocaleString(),
      processTime: processTime.toLocaleString(),
      alarmReason: alarmReason,
      rectificationMeasure: rectificationMeasure,
      duration: `${durationHours}小时`,
      alarmTimeTimestamp: start.getTime() // 存储时间戳，用于排序
    })
  }
  
  // 按报警时间降序排序（最新的日期在前）
  data.sort((a, b) => b.alarmTimeTimestamp - a.alarmTimeTimestamp)
  
  // 重新编号
  data.forEach((item, index) => {
    item.index = index + 1
  })
  
  staleAlarmDetail.value = data
}

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性：分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return staleAlarmDetail.value.slice(start, end)
})

// 分页事件处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 方法
const handleDateRangeChange = (val: [string, string]) => {
  console.log('日期范围变化:', val)
  // 这里可以添加数据刷新逻辑
  updateCharts()
}

const openDetail = (row: any) => {
  console.log('打开详情:', row)
  detailForm.value = {
    pointName: row.pointName,
    pointCode: row.pointCode,
    department: row.department,
    alarmTime: row.alarmTime,
    clearTime: row.clearTime,
    duration: row.duration,
    reason: '传感器故障',
    measure: '更换传感器'
  }
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
      legend: {
        data: ['总陈旧报警数量', '≤48小时', '≤72小时', '＞72小时'],
        top: 0
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
        data: ['0-24小时', '24-48小时', '48-72小时', '72-96小时', '96-120小时', '120小时以上']
      },
      yAxis: {
        type: 'value',
        name: '次数'
      },
      series: [
        {
          name: '总陈旧报警数量',
          type: 'line',
          smooth: true,
          data: [120, 280, 360, 240, 180, 100],
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
        },
        {
          name: '≤48小时',
          type: 'line',
          smooth: true,
          data: [120, 280, 0, 0, 0, 0],
          lineStyle: {
            color: '#6A5BDE',
            width: 2
          }
        },
        {
          name: '≤72小时',
          type: 'line',
          smooth: true,
          data: [0, 0, 360, 0, 0, 0],
          lineStyle: {
            color: '#FF4D55',
            width: 2
          }
        },
        {
          name: '＞72小时',
          type: 'line',
          smooth: true,
          data: [0, 0, 0, 240, 180, 100],
          lineStyle: {
            color: '#67C23A',
            width: 2
          }
        }
      ]
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
      { value: 320, name: '甲醇装置' },
      { value: 280, name: '乙醇装置' },
      { value: 240, name: '乙炔装置' },
      { value: 220, name: '氯乙烯装置' },
      { value: 220, name: '盐酸装置' }
    ]
    const total = data.reduce((a, b) => a + b.value, 0).toLocaleString()

    const option = {
      // 颜色盘：使用更鲜亮和谐的 B 端配色
      color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'],
      
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      
      // 中间显示总数标题
      title: {
        text: total,
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
      
      // 图例样式优化
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
        }
      },
      
      series: [{
        name: '陈旧报警工序占比',
        type: 'pie',
        // 关键：调整圆环粗细和圆角
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
  // 这里可以添加数据更新逻辑
  console.log('更新图表数据')
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
const cleanup = () => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  distributionChart?.dispose()
}
</script>

<style scoped>
.analysis-page {
  padding: 8px;
  height: 100%;
  background: #f5f7fa;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.page-header p {
  font-size: 14px;
  color: #606266;
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
  rgba(209, 227, 255, 0.8) 0%,   /* 起始颜色 */
  rgba(235, 241, 255, 0.8) 100%  /* 结束颜色 */);
}
/* 橙色系 */
.stat-card.orange {
  background: linear-gradient(90deg,
  rgba(255, 208, 171, 0.6) 0%,   /* 起始颜色 */
  rgba(255, 242, 232, 0.6) 100%  /* 结束颜色 */);
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
  rgba(255, 196, 211, 0.6) 0%,   /* 起始颜色 */
  rgba(255, 230, 235, 0.6) 100%  /* 结束颜色 */);
}
/* 绿色系 */
.stat-card.green {
  background: linear-gradient(90deg,
  rgba(195, 251, 241, 0.6) 0%,   
  rgba(230, 251, 247, 0.6) 100%  
); 
}

/* 让不同卡片的数字显示不同颜色 */
/* 蓝色卡片 - 数字变蓝 */
.stat-card.blue .stat-value {
  color: #2681ff;
}

/* 橙色卡片 - 数字变橙 */
.stat-card.orange .stat-value {
  color: #fc8428;
}

/* 紫色卡片 - 数字变紫 */
.stat-card.purple .stat-value {
  color: #6A5BDE;
}

/* 红色卡片 - 数字变红 */
.stat-card.red .stat-value {
  color: #FF4D55;
}

/* 绿色卡片 - 数字变绿 */
.stat-card.green .stat-value {
  color: #08C47F;
}

/* 让标题文字也跟随主题变色 */
/* 蓝色卡片 - 标题变蓝 */
.stat-card.blue .stat-title {
  color: #2681ff;
  opacity: 0.8;
}

/* 橙色卡片 - 标题变橙 */
.stat-card.orange .stat-title {
  color: #fc8428;
  opacity: 0.9;
}

/* 紫色卡片 - 标题变紫 */
.stat-card.purple .stat-title {
  color: #6A5BDE;
  opacity: 0.9;
}

/* 红色卡片 - 标题变红 */
.stat-card.red .stat-title {
  color: #FF4D55;
  opacity: 0.9;
}

/* 绿色卡片 - 标题变绿 */
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

趋势文字
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
.chart-container {
  height: 100%;
  width: 100%;
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
}

/* 明细查询卡片 */
.detail-card {
  margin-bottom: 24px;
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
  
  .chart-card {
    width: 100%;
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
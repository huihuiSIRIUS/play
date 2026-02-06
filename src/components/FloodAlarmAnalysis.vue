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
              <div class="stat-title">泛滥次数</div>
              <div class="stat-value">800<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-8.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card orange">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">平均持续时长</div>
              <div class="stat-value">45<span class="stat-unit">min</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-9.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card purple">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">单次最大报警数</div>
              <div class="stat-value">120<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-down">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-10.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card red">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">累计报警数</div>
              <div class="stat-value">9,600<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-11.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card green">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">月泛滥时长占比</div>
              <div class="stat-value">15<span class="stat-unit">%</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-12.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <!-- 趋势分析和分布分析 -->
    <div class="chart-row">
      <!-- 报警时长次数分布图 -->
      <el-card class="chart-card trend-chart">
        <template #header>
          <div class="section-header">
            <span>泛滥报警次数统计图</span>
          </div>
        </template>
        <div class="chart-container" ref="trendChartRef"></div>
      </el-card>
      
      <!-- 报警时长百分比统计 -->
      <el-card class="chart-card distribution-chart">
        <template #header>
          <div class="section-header">
            <span>泛滥报警发生单位统计图</span>
          </div>
        </template>
        <div class="chart-container" ref="distributionChartRef"></div>
      </el-card>
    </div>
    
    <!-- 明细查询 -->
    <el-card class="analysis-card">
      <template #header>
        <div class="section-header">
          <span>泛滥报警台账</span>
          <el-button type="primary" size="small" class="export-btn">
            <el-icon><Download /></el-icon>
              导出
          </el-button>
        </div>
      </template>
      <div class="card-body">
        <el-table :data="paginatedData" stripe style="width: 100%">
          <el-table-column prop="index" label="序号" width="80" align="center" />
          <el-table-column prop="startTime" label="开始时间" width=auto align="center"/>
          <el-table-column prop="endTime" label="结束时间" width=auto align="center"/>
          <el-table-column prop="duration" label="持续时长（分钟）" width=auto align="center"/>
          <el-table-column prop="totalAlarms" label="报警总数" width="120" align="center"/>
          <el-table-column prop="peakRate" label="峰值报警率(次/10分钟)" width=auto align="center"/>
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" @click="openDetail(scope.row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="floodAlarmData.length"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'
  import { Download } from '@element-plus/icons-vue'

// --- 工具函数：获取最近30天日期 ---
const getRecent30Days = (): string [] => {
  const  dates = []
  const start = new Date ()
  start.setDate(start.getDate() - 29) // 包含今天共30天
  
  for (let i = 0; i < 30 ; i++) {
    const date = new Date (start)
    date.setDate(start.getDate() + i)
    dates.push(date.toISOString().split('T')[0].slice(5)) // 只取 MM-DD
  }
  return  dates
}

// --- 工具函数：生成30条随机数据 ---
const generateRandomData = (min: number, max: number): number [] => {
  return Array.from({ length: 30 }, () => Math.floor(Math.random() * (max - min + 1 )) + min)
}

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

// 泛滥报警数据
const floodAlarmData = ref<any[]>([])

// 生成 100 条模拟数据
const generateMockData = () => {
  const data = []
  for (let i = 1; i <= 100; i++) {
    // 随机生成过去30天内的时间
    const start = new Date()
    start.setDate(start.getDate() - Math.floor(Math.random() * 30))
    start.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
    
    // 持续时间 10 - 120 分钟
    const duration = Math.floor(Math.random() * 110) + 10
    const end = new Date(start.getTime() + duration * 60000)
    
    data.push({
      index: i,
      startTime: start.toLocaleString(),
      endTime: end.toLocaleString(),
      duration: duration,
      totalAlarms: Math.floor(Math.random() * 150) + 50,
      peakRate: Math.floor(Math.random() * 80) + 20
    })
  }
  floodAlarmData.value = data
}

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性：分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return floodAlarmData.value.slice(start, end)
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
  // 这里可以添加打开详情弹窗的逻辑
}

// 初始化图表
const initCharts = () => {
  initTrendChart()
  initDistributionChart()
}

// 初始化趋势图 (修改版：最近30天趋势)
const initTrendChart = () =>  {
  if  (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    
    // 1. 获取动态数据
    const  xData = getRecent30Days()
    const yData = generateRandomData(10, 80) // 生成 10~80 之间的随机数

    const  option = {
      tooltip : {
        trigger: 'axis' ,
        formatter: '{b}: {c}次'
      },
      grid : {
        left: '3%' ,
        right: '4%' ,
        bottom: '3%' ,
        containLabel: true
      },
      xAxis : {
        type: 'category' ,
        boundaryGap: false ,
        data: xData, // ✅ 使用日期数组
        axisLabel : {
          rotate: 0, // 日期如果不挤的话可以不旋转，或者设为 45 
          interval: 4 // 每隔4天显示一个标签，防止拥挤
        }
      },
      yAxis : {
        type: 'value' ,
        name: '泛滥次数' ,
        splitLine : {
          show: true ,
          lineStyle : {
            type: 'dashed'
          }
        }
      },
      series : [{
        name: '泛滥次数' ,
        type: 'line' ,
        smooth: true ,
        // ✅ 使用随机生成的30天数据
        data : yData,
        lineStyle : {
          color: '#1890ff' ,
          width: 3
        },
        areaStyle : {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1 , [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)'  },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)'  }
          ])
        }
      }]
    }
    trendChart.setOption(option)
  }
}

// 初始化分布图 (报警时长百分比统计)
const initDistributionChart = () => {
  if (distributionChartRef.value) {
    distributionChart = echarts.init(distributionChartRef.value)
    
    // 数据
    const data = [
      { value: 328, name: '1工段' },
      { value: 286, name: '2工段' },
      { value: 154, name: '3工段' },
      { value: 56, name: '4工段' },
      { value: 32, name: '5工段' }
    ]
    const total = data.reduce((a, b) => a + b.value, 0).toLocaleString()

    const option = {
      // 颜色盘
      color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'],
      
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      
      // 中心显示总数
      title: {
        text: total,
        subtext: '泛滥次数',
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
        name: '工段分布',
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
  rgba(235, 241, 255, 0.8) 100%  
);
}
/* 橙色系 */
.stat-card.orange {
  background: linear-gradient(90deg,
  rgba(255, 208, 171, 0.6) 0%,   
  rgba(255, 242, 232, 0.6) 100%  
);
}
/* 绿色系 */
.stat-card.green {
  background: linear-gradient(90deg,
  rgba(195, 251, 241, 0.6) 0%,   
  rgba(230, 251, 247, 0.6) 100%  
); 
}
/* 红色系 */
.stat-card.red {
  background: linear-gradient(90deg,  
  rgba(255, 196, 211, 0.6) 0%,   
  rgba(255, 230, 235, 0.6) 100%  
); 
}
/* 紫色系 */
.stat-card.purple {
  background: linear-gradient(90deg,
  rgba(204, 207, 255, 0.6) 0%,   
  rgba(230, 231, 255, 0.6) 100%  
); 
}

/* 卡片文字颜色 */
.stat-card.blue .stat-value {
  color: #2681ff;
}

.stat-card.orange .stat-value {
  color: #fc8428;
}

.stat-card.green .stat-value {
  color: #08C47F;
}

.stat-card.red .stat-value {
  color: #FF4D55;
}

.stat-card.purple .stat-value {
  color: #6A5BDE;
}

/* 标题文字颜色 */
.stat-card.blue .stat-title {
  color: #2681ff;
  opacity: 0.8;
}

.stat-card.orange .stat-title {
  color: #fc8428;
  opacity: 0.9;
}

.stat-card.green .stat-title {
  color: #08C47F;
  opacity: 0.9;
}

.stat-card.red .stat-title {
  color: #FF4D55;
  opacity: 0.9;
}

.stat-card.purple .stat-title {
  color: #6A5BDE;
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

.stat-unit {
  font-size: 14px;
  margin-left: 4px;
  font-weight: normal;
  opacity: 0.8;
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
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
} */

/* 分析卡片 */
.analysis-card {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  padding: 20px 0;
}

.export-btn {
  margin-left: auto;
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
  
  .ranking-row {
    flex-direction: column;
  }
  
  .ranking-card {
    width: 100%;
    min-width: auto;
  }
  
  .search-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
/* --- 修复：泛滥报警台账间距优化 --- */

/* 1. 去掉标题在卡片内的下边距 */
.analysis-card .section-header {
  margin-bottom: 0 !important;
}

/* 2. 去掉手动添加的内容层上边距 */
.card-body {
  padding-top: 0 !important;
  /* 如果希望表格紧贴卡片边缘，可以将 padding 设为 0 */
  /* padding: 0 !important; */
}
/* --- 修复：顶部图表卡片间距优化 --- */

/* 1. 去掉图表卡片内标题的下边距 */
.chart-card .section-header {
  margin-bottom: 0 !important;
}

/* 2. 调整图表 Card Body 的上内边距 (默认是 20px，改小一点让图表贴上去) */
.chart-card :deep(.el-card__body) {
  padding-top: 8px; /* 建议设为 10px 或 0 */
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: flex-end; /* 靠右对齐 */
  margin-top: 24px;          /* 与表格拉开距离 */
}
</style>
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
      <el-button type="primary" :icon="Search" @click="initCharts">
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
              <div class="stat-title">总抖动报警次数</div>
              <div class="stat-value">{{ totalJitterCount }}<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-13.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card orange">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">涉及点位数量</div>
              <div class="stat-value">{{ involvedPoints }}<span class="stat-unit">个</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-14.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card purple">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">平均抖动频率</div>
              <div class="stat-value">{{ avgJitterFreq }}<span class="stat-unit">Hz</span></div>
              <div class="stat-trend trend-down">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-15.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card red">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">最高抖动频率</div>
              <div class="stat-value">{{ maxJitterFreq }}<span class="stat-unit">Hz</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-16.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>

        <div class="stat-card green">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">总干扰时长</div>
              <div class="stat-value">{{ totalInterferenceTime }}<span class="stat-unit">min</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-17.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <!-- 趋势分析和分布分析 -->
    <div class="chart-row">
      <!-- 抖动报警TOP10 -->
      <el-card class="chart-card trend-chart">
        <template #header>
          <div class="section-header">
            <span>抖动报警点位TOP10</span>
          </div>
        </template>
        <div class="chart-container" ref="top10ChartRef"></div>
      </el-card>
      
      <!-- 抖动报警趋势图 -->
      <el-card class="chart-card distribution-chart">
        <template #header>
          <div class="section-header">
            <span>抖动报警趋势图</span>
          </div>
        </template>
        <div class="chart-container" ref="trendChartRef"></div>
      </el-card>
    </div>
    
    <!-- 明细查询 -->
    <el-card class="detail-card">
      <template #header>
        <div class="section-header">
          <span>抖动报警台账</span>
          <el-button type="primary" size="small" class="export-btn" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </template>
      <div class="table-container">
        <el-table :data="paginatedData" stripe style="width: 100%">
          <el-table-column prop="index" label="序号" width="80" align="center" />
          <el-table-column prop="pointName" label="监测点名称" width="400" align="center" />
          <el-table-column prop="pointCode" label="监测点位号" width="400" align="center" />
          <el-table-column prop="department" label="责任部门" width="auto" align="center" />
          <el-table-column prop="handler" label="责任人" width="auto" align="center" />
          <el-table-column prop="totalJitterCount" label="总抖动次数" width="auto" align="center" />
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
            :total="detailData.length"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
    
    <!-- 抖动报警详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="抖动报警详情"
      width="85%"
      center
    >
      <!-- 顶部搜索栏 -->
      <div class="detail-search-toolbar">
        <el-select v-model="detailSearchForm.type" placeholder="类型" size="small" style="width: 120px; margin-right: 12px;">
          <el-option label="高报" value="高报" />
          <el-option label="低报" value="低报" />
          <el-option label="高高报" value="高高报" />
          <el-option label="低低报" value="低低报" />
        </el-select>
        
        <el-date-picker
          v-model="detailSearchForm.alarmTime"
          type="daterange"
          range-separator="至"
          start-placeholder="报警开始时间"
          end-placeholder="报警结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          size="small"
          style="width: 240px; margin-right: 12px;"
        />
        
        <el-date-picker
          v-model="detailSearchForm.clearTime"
          type="daterange"
          range-separator="至"
          start-placeholder="消警开始时间"
          end-placeholder="消警结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          size="small"
          style="width: 240px; margin-right: 12px;"
        />
        
        <el-date-picker
          v-model="detailSearchForm.handleTime"
          type="daterange"
          range-separator="至"
          start-placeholder="处理开始时间"
          end-placeholder="处理结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          size="small"
          style="width: 240px; margin-right: 12px;"
        />
        
        <el-input v-model="detailSearchForm.handler" placeholder="处理人" size="small" style="width: 120px; margin-right: 12px;" />
        
        <div style="margin-left: auto; display: flex; gap: 8px;">
          <el-button size="small" @click="handleDetailSearch">搜索</el-button>
          <el-button size="small" @click="handleDetailExport">导出</el-button>
        </div>
      </div>
      
      <!-- 数据表格 -->
      <div class="detail-table-container">
        <el-table :data="paginatedDetailData" stripe style="width: 100%">
          <el-table-column prop="index" label="序号" width="80" align="center" />
          <el-table-column prop="type" label="类型" width="120" align="center" />
          <el-table-column prop="alarmTime" label="报警时间" width="180" align="center" />
          <el-table-column prop="clearTime" label="消警时间" width="180" align="center" />
          <el-table-column prop="handleTime" label="处理时间" width="180" align="center" />
          <el-table-column prop="alarmDuration" label="报警时长(min)" width="120" align="center" />
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
          <el-table-column prop="handler" label="处理人" width="100" align="center" />
        </el-table>
        
        <!-- 分页器 -->
        <div class="detail-pagination-container">
          <el-pagination
            v-model:current-page="detailPagination.currentPage"
            v-model:page-size="detailPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="detailList.length"
            background
            @size-change="handleDetailSizeChange"
            @current-change="handleDetailCurrentChange"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 时间筛选器
const dateRange = ref<any[]>([])

// 图表引用
const top10ChartRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
let top10Chart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

// 核心指标数据
const totalJitterCount = ref('1,248')
const involvedPoints = ref('86')
const avgJitterFreq = ref('2.4')
const maxJitterFreq = ref('15.6')
const totalInterferenceTime = ref('456')

// 明细数据
const detailData = ref<any[]>([])

// 生成 100 条模拟数据
const generateMockData = () => {
  const data = []
  const departments = ['1工段', '2工段', '3工段', '4工段', '5工段']
  const handlers = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
  const pointTypes = ['温度变送器', '压力变送器', '液位变送器', '流量变送器']
  const areas = ['反应釜A区', '反应釜B区', '精馏塔区', '储罐区', '冷凝器区', '蒸发器区']
  
  for (let i = 1; i <= 100; i++) {
    // 生成随机监测点
    const pointType = pointTypes[Math.floor(Math.random() * pointTypes.length)]
    const typeCode = ['TIC', 'PIC', 'LIC', 'FIC'][pointTypes.indexOf(pointType)]
    const area = areas[Math.floor(Math.random() * areas.length)]
    const num = String(i).padStart(3, '0')
    const pointCode = `${typeCode}-${num}`
    const pointName = `${area}${pointType}`
    
    data.push({
      index: i,
      pointName: pointName,
      pointCode: pointCode,
      department: departments[Math.floor(Math.random() * departments.length)],
      handler: handlers[Math.floor(Math.random() * handlers.length)],
      totalJitterCount: Math.floor(Math.random() * 100) + 10 // 10-110次
    })
  }
  
  // 按总抖动次数降序排序
  data.sort((a, b) => b.totalJitterCount - a.totalJitterCount)
  
  // 重新编号
  data.forEach((item, index) => {
    item.index = index + 1
  })
  
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

// 详情弹窗状态
const detailDialogVisible = ref(false)

// 详情数据
const detailList = ref<any[]>([])

// 详情分页状态
const detailPagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 详情搜索表单
const detailSearchForm = ref({
  type: '',
  alarmTime: null,
  clearTime: null,
  handleTime: null,
  handler: ''
})

// 计算属性：详情分页数据
const paginatedDetailData = computed(() => {
  const start = (detailPagination.value.currentPage - 1) * detailPagination.value.pageSize
  const end = start + detailPagination.value.pageSize
  return detailList.value.slice(start, end)
})

// 分页事件处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 初始化日期范围为最近30天
const initDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  
  dateRange.value = [
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  ]
}

// 处理日期范围变化
const handleDateRangeChange = () => {
  initCharts()
}

// 初始化图表
const initCharts = () => {
  initTop10Chart()
  initTrendChart()
}

// 初始化TOP10柱状图
const initTop10Chart = () => {
  if (top10ChartRef.value) {
    top10Chart = echarts.init(top10ChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c}次'
      },
      grid: {
        left: '10%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '报警次数'
      },
      yAxis: {
        type: 'category',
        data: ['TIC-101', 'PIC-201', 'LIC-301', 'FIC-102', 'TIC-202', 'PIC-302', 'LIC-103', 'FIC-203', 'TIC-303', 'PIC-104'],
        axisLabel: {
          interval: 0,
          rotate: 0
        }
      },
      series: [{
        name: '报警次数',
        type: 'bar',
        data: [128, 96, 84, 72, 68, 64, 58, 52, 48, 42],
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#79bbff' },
            { offset: 1, color: '#409EFF' }
          ])
        },
        label: {
          show: true,
          position: 'right',
          color: '#303133'
        }
      }]
    }
    top10Chart.setOption(option)
  }
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
        data: ['01-01', '01-05', '01-10', '01-15', '01-20', '01-25', '01-30']
      },
      yAxis: {
        type: 'value',
        name: '抖动次数'
      },
      series: [{
        name: '抖动次数',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
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

// 处理导出
const handleExport = () => {
  console.log('导出数据')
}

// 生成详情数据
const generateDetailData = (parentRow: any) => {
  const data = []
  const types = ['高报', '低报', '高高报', '低低报']
  const handlers = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
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
  
  // 获取日期范围（使用当前日期的前后7天）
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)
  
  for (let i = 0; i < parentRow.totalJitterCount; i++) {
    // 随机生成报警时间
    const randomTime = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
    const alarmTime = randomTime
    
    // 消警时间 = 报警时间 + 随机分钟数 (1-10分钟)
    const clearTime = new Date(alarmTime.getTime() + Math.floor(Math.random() * 10 + 1) * 60 * 1000)
    
    // 处理时间 = 消警时间 + 随机分钟数 (1-30分钟)
    const handleTime = new Date(clearTime.getTime() + Math.floor(Math.random() * 30 + 1) * 60 * 1000)
    
    // 计算报警时长
    const alarmDuration = Math.round((clearTime.getTime() - alarmTime.getTime()) / (1000 * 60))
    
    // 随机生成其他数据
    const type = types[Math.floor(Math.random() * types.length)]
    const handler = handlers[Math.floor(Math.random() * handlers.length)]
    const alarmReason = reasons[Math.floor(Math.random() * reasons.length)] + '，这是一条测试数据，用于模拟实际报警情况...'
    const rectification = rectifications[Math.floor(Math.random() * rectifications.length)] + '，通过调整参数和检查设备，确保系统稳定运行...'
    
    data.push({
      index: i + 1,
      type: type,
      alarmTime: alarmTime.toISOString().slice(0, 19).replace('T', ' '),
      clearTime: clearTime.toISOString().slice(0, 19).replace('T', ' '),
      handleTime: handleTime.toISOString().slice(0, 19).replace('T', ' '),
      alarmDuration: alarmDuration,
      alarmReason: alarmReason,
      rectification: rectification,
      handler: handler
    })
  }
  
  // 按报警时长降序排列
  data.sort((a, b) => b.alarmDuration - a.alarmDuration)
  
  // 重新编号
  data.forEach((item, index) => {
    item.index = index + 1
  })
  
  return data
}

// 打开详情
const openDetail = (row: any) => {
  // 生成详情数据
  detailList.value = generateDetailData(row)
  // 重置分页
  detailPagination.value.currentPage = 1
  // 打开弹窗
  detailDialogVisible.value = true
}

// 详情搜索处理
const handleDetailSearch = () => {
  console.log('搜索详情数据:', detailSearchForm.value)
  // 这里可以添加实际的搜索逻辑
}

// 详情导出处理
const handleDetailExport = () => {
  console.log('导出详情数据')
  // 这里可以添加实际的导出逻辑
}

// 详情分页大小变化
const handleDetailSizeChange = (val: number) => {
  detailPagination.value.pageSize = val
  detailPagination.value.currentPage = 1 // 重置到第一页
}

// 详情分页当前页变化
const handleDetailCurrentChange = (val: number) => {
  detailPagination.value.currentPage = val
}

// 更新图表
const updateCharts = () => {
  console.log('更新图表数据')
}

// 监听窗口大小变化
const handleResize = () => {
  top10Chart?.resize()
  trendChart?.resize()
}

// 生命周期钩子
onMounted(() => {
  initDateRange()
  generateMockData() // 初始化生成模拟数据
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 清理函数
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  top10Chart?.dispose()
  trendChart?.dispose()
})
</script>

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

.section-header::before {
  content: "";
  display: block;
  width: 4px;
  height: 16px;
  background: #409EFF;
  margin-right: 8px;
  border-radius: 2px;
}

.stats-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

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

/* 颜色定义 */
.stat-card.blue {
  background: linear-gradient(90deg, 
  rgba(209, 227, 255, 0.8) 0%,   
  rgba(235, 241, 255, 0.8) 100%  
);
}

.stat-card.orange {
  background: linear-gradient(90deg,
  rgba(255, 208, 171, 0.6) 0%,   
  rgba(255, 242, 232, 0.6) 100%  
);
}

.stat-card.purple {
  background: linear-gradient(90deg,
  rgba(204, 207, 255, 0.6) 0%,   
  rgba(230, 231, 255, 0.6) 100%  
); 
}

.stat-card.red {
  background: linear-gradient(90deg,  
  rgba(255, 196, 211, 0.6) 0%,   
  rgba(255, 230, 235, 0.6) 100%  
); 
}

.stat-card.green {
  background: linear-gradient(90deg,
  rgba(195, 251, 241, 0.6) 0%,   
  rgba(230, 251, 247, 0.6) 100%  
); 
}

/* 卡片文字颜色 */
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

.stat-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

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

.stat-trend {
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.trend-up { color: #F56C6C; }
.trend-down { color: #67C23A; }

.card-right {
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-icon-img {
  width: 56px;
  height: 56px;
  object-fit: contain;
  opacity: 0.9;
}

.stat-unit {
  font-size: 14px;
  margin-left: 4px;
  font-weight: normal;
  opacity: 0.8;
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

/* 明细卡片 */
.detail-card {
  border-radius: 8px;
  overflow: hidden;
}

.export-btn {
  margin-left: auto;
}

.table-container {
  overflow-x: auto;
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
/* 1. 去掉标题在卡片内的下边距 */
.detail-card .section-header {
  margin-bottom: 0 !important;
}

/* 2. 调整 Card Body 的内边距 (默认 20px，改小一点让表格更紧凑) */
.detail-card :deep(.el-card__body) {
  padding-top: 10px; /* 建议设为 10px 或 0 */
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: flex-end; /* 靠右对齐 */
  margin-top: 24px;          /* 与表格拉开距离 */
}

/* 详情弹窗样式 */
.detail-search-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.detail-table-container {
  margin-top: 20px;
}

.detail-pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .detail-search-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .detail-search-toolbar > * {
    margin-right: 0 !important;
    margin-bottom: 8px !important;
  }
  
  .detail-search-toolbar > div:last-child {
    margin-top: 8px;
    justify-content: flex-end;
  }
}
</style>
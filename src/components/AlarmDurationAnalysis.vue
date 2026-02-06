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
              <div class="stat-title">总报警时长</div>
              <div class="stat-value">{{ totalDuration }}<span class="stat-unit">min</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-5.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card orange">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">最长报警时长</div>
              <div class="stat-value">{{ maxDuration }}<span class="stat-unit">min</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-6.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card purple">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">平均告警时长</div>
              <div class="stat-value">{{ avgDuration }}<span class="stat-unit">min</span></div>
              <div class="stat-trend trend-down">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-7.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 趋势分析和分布分析 -->
    <div class="chart-row">
      <!-- 报警时长次数统计 -->
      <el-card class="chart-card trend-chart">
        <template #header>
          <div class="section-header">
            <span>报警时长次数统计</span>
          </div>
        </template>
        <div class="chart-container" ref="durationBarChartRef"></div>
      </el-card>
      
      <!-- 报警时长百分比统计 -->
      <el-card class="chart-card distribution-chart">
        <template #header>
          <div class="section-header">
            <span>报警时长百分比统计</span>
          </div>
        </template>
        <div class="chart-container" ref="distributionChartRef"></div>
      </el-card>
    </div>
    
    <!-- 明细查询 -->
    <el-card class="detail-card">
      <template #header>
        <div class="section-header">
          <span>报警时长台账</span>
        </div>
      </template>
      <div class="table-toolbar">
        <div class="duration-filters">
          <el-radio-group v-model="durationFilter" class="custom-blue-radio">
            <el-radio-button label="<1min" />
            <el-radio-button label="1~5min" />
            <el-radio-button label="5~15min" />
            <el-radio-button label="15~30min" />
            <el-radio-button label=">30min" />
          </el-radio-group>
        </div>
        <div class="actions-right">
          <el-button type="primary" size="small" @click="handleExport">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </div>
      <div class="table-container">
        <el-table :data="paginatedData" stripe style="width: 100%">
          <el-table-column prop="index" label="序号" width="80" align="center" />
          <el-table-column prop="pointName" label="监测点名称" align="center"/>
          <el-table-column prop="pointCode" label="监测点位号" align="center"/>
          <el-table-column prop="device" label="关联设备" align="center"/>
          <el-table-column prop="department" label="所属部门" align="center"/>
          <el-table-column prop="duration" label="报警时长" width="120" align="center"/>
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
  </div>

  <!-- 报警时长详情弹窗 -->
  <el-dialog
    v-model="detailDialogVisible"
    title="报警时长详情"
    width="85%"
    destroy-on-close
  >
    <!-- 搜索栏 -->
    <div class="search-toolbar">
      <el-select v-model="detailFilters.type" placeholder="类型" class="filter-item">
        <el-option label="高报" value="high" />
        <el-option label="低报" value="low" />
        <el-option label="高高报" value="highHigh" />
        <el-option label="低低报" value="lowLow" />
      </el-select>
      <el-date-picker
        v-model="detailFilters.alarmTimeRange"
        type="daterange"
        range-separator="至"
        start-placeholder="报警开始时间"
        end-placeholder="报警结束时间"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        class="filter-item"
      />
      <el-date-picker
        v-model="detailFilters.clearTimeRange"
        type="daterange"
        range-separator="至"
        start-placeholder="消警开始时间"
        end-placeholder="消警结束时间"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        class="filter-item"
      />
      <el-date-picker
        v-model="detailFilters.processTimeRange"
        type="daterange"
        range-separator="至"
        start-placeholder="处理开始时间"
        end-placeholder="处理结束时间"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        class="filter-item"
      />
      <el-input v-model="detailFilters.handler" placeholder="处理人" class="filter-item" />
      <div class="actions-right">
        <el-button type="primary" @click="handleDetailSearch">
          搜索
        </el-button>
        <el-button @click="handleDetailExport">
          导出
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table :data="paginatedDetailData" stripe style="width: 100%">
        <el-table-column prop="index" label="序号" width="80" align="center" />
        <el-table-column prop="type" label="类型" align="center" />
        <el-table-column prop="alarmTime" label="报警时间" width="180" align="center" />
        <el-table-column prop="clearTime" label="消警时间" width="180" align="center" />
        <el-table-column prop="processTime" label="处理时间" width="180" align="center" />
        <el-table-column prop="durationMinutes" label="报警时长(min)" width="120" align="center" />
        <el-table-column prop="alarmReason" label="报警原因" align="left" show-overflow-tooltip />
        <el-table-column prop="rectificationMeasures" label="整改措施" align="left" show-overflow-tooltip />
        <el-table-column prop="handler" label="处理人" align="center" />
      </el-table>
      
      <!-- 分页器 -->
      <div class="pagination-container">
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 时间筛选器
const dateRange = ref<any[]>([])

// --- 新增：表格专用的时间筛选 ---
const tableDateRange = ref([])

const handleTableDateChange = (val: [string, string] | null) => {
  console.log('表格时间范围改变:', val)
  // 在这里调用刷新表格数据的接口
}

// 时长筛选状态
const durationFilter = ref('<1min')

// 图表引用
const trendChartRef = ref<HTMLElement | null>(null)
const distributionChartRef = ref<HTMLElement | null>(null)
const durationBarChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let distributionChart: echarts.ECharts | null = null
let durationBarChart: echarts.ECharts | null = null

// 核心指标数据
const totalDuration = ref('1,248')
const maxDuration = ref('45')
const avgDuration = ref('8.6')

// 明细数据
const detailData = ref<any[]>([])

// 生成 100 条模拟数据
const generateMockData = () => {
  const data = []
  const departments = ['1工段', '2工段', '3工段', '4工段', '5工段']
  const devices = ['反应釜', '泵', '储罐', '流量计', '换热器', '压缩机', '阀门', '反应器']
  
  for (let i = 1; i <= 100; i++) {
    // 生成随机监测点名称和位号
    const type = ['TIC', 'PIC', 'LIC', 'FIC'][Math.floor(Math.random() * 4)]
    const num = String(i).padStart(3, '0')
    const pointName = `${type}-${num}`
    const pointCode = `${type}-${num}`
    
    // 随机选择部门和设备
    const department = departments[Math.floor(Math.random() * departments.length)]
    const deviceType = devices[Math.floor(Math.random() * devices.length)]
    const deviceIndex = Math.floor(Math.random() * 26) + 65 // A-Z
    const device = `${deviceType}${String.fromCharCode(deviceIndex)}`
    
    // 生成随机报警时长
    const durationMinutes = Math.floor(Math.random() * 60) + 1 // 1-60分钟
    const duration = `${durationMinutes}min`
    
    data.push({
      index: i,
      pointName,
      pointCode,
      device,
      department,
      duration,
      durationMinutes // 存储数字格式的时长，用于排序
    })
  }
  
  // 按报警时长降序排序
  data.sort((a, b) => b.durationMinutes - a.durationMinutes)
  
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
  initDurationBarChart()
  initDistributionChart()
}

// 初始化报警时长柱状图
const initDurationBarChart = () => {
  if (durationBarChartRef.value) {
    durationBarChart = echarts.init(durationBarChartRef.value);
    
    const option = {
      grid: {
        top: '15%',
        left: '2%',
        right: '2%',
        bottom: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['<1min', '1~5min', '5~15min', '15~30min', '>30min'],
        axisTick: { show: false },
        axisLine: {
          lineStyle: { color: '#E4E7ED' }
        },
        axisLabel: {
          color: '#606266',
          margin: 15,
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#E4E7ED'
          }
        },
        axisLabel: { show: false }
      },
      series: [
        {
          name: '报警次数',
          type: 'bar',
          barWidth: 24,
          data: [40, 60, 80, 55, 30],
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(64, 158, 255, 0.08)',
            borderRadius: [12, 12, 0, 0]
          },
          itemStyle: {
            borderRadius: [12, 12, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#79bbff' },
              { offset: 1, color: '#409EFF' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            color: '#303133',
            fontSize: 12,
            // fontWeight: 600, 
            formatter: '{c}'
          }
        }
      ]
    };

    durationBarChart.setOption(option);
  }
}

// 初始化趋势图（保留原函数但不再使用）
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
        data: ['<1min', '1~5min', '5~15min', '15~30min', '>30min']
      },
      yAxis: {
        type: 'value',
        name: '发生频次'
      },
      series: [{
        name: '发生频次',
        type: 'bar',
        data: [248, 186, 124, 68, 32],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#91d5ff' }
          ])
        },
        label: {
          show: true,
          position: 'top',
          color: '#303133'
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
    
    const data = [
      { value: 248, name: '<1min' },
      { value: 186, name: '1~5min' },
      { value: 124, name: '5~15min' },
      { value: 68, name: '15~30min' },
      { value: 32, name: '>30min' }
    ]
    const total = data.reduce((a, b) => a + b.value, 0)

    const option = {
      color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'],
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      title: {
        text: total.toString(),
        subtext: '总时长',
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
        name: '报警时长',
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

// 处理导出
const handleExport = () => {
  console.log('导出数据')
}

// 详情弹窗状态
const detailDialogVisible = ref(false)
const detailList = ref<any[]>([])
const detailPagination = ref({
  currentPage: 1,
  pageSize: 10
})
const detailFilters = ref({
  type: '',
  alarmTimeRange: null,
  clearTimeRange: null,
  processTimeRange: null,
  handler: ''
})

// 计算属性：详情分页数据
const paginatedDetailData = computed(() => {
  const start = (detailPagination.value.currentPage - 1) * detailPagination.value.pageSize
  const end = start + detailPagination.value.pageSize
  return detailList.value.slice(start, end)
})

// 生成详情数据
const generateDetailData = (parentRow: any) => {
  const parentDuration = parentRow.durationMinutes
  const list = []
  let remaining = parentDuration
  const count = Math.floor(Math.random() * 10) + 5 // 生成 5-15 条
  const types = ['高报', '低报', '高高报', '低低报']
  const handlers = ['张三', '李四', '王五', '赵六', '钱七']
  const reasons = [
    '设备运行参数超出设定阈值',
    '传感器信号异常波动',
    '系统压力突然升高',
    '温度传感器故障',
    '液位计显示异常',
    '流量监测值异常',
    '电源电压不稳定',
    '控制系统通信中断'
  ]
  const measures = [
    '检查设备运行状态，调整参数',
    '更换故障传感器',
    '检查系统压力源，排除泄漏',
    '校准温度传感器',
    '检查液位计安装位置和连接',
    '清理流量计，检查管道堵塞情况',
    '检查电源系统，确保电压稳定',
    '检查通信线路，重启控制系统'
  ]
  
  for (let i = 0; i < count; i++) {
    // 分配时长：如果是最后一条，则全部分配；否则随机分配剩余的一部分
    let duration = 0
    if (i === count - 1) {
      duration = remaining
    } else {
      // 保证每条至少 1 分钟，且不超过剩余的一半（让分布更均匀）
      duration = Math.floor(Math.random() * (Math.max(1, Math.floor(remaining / 2)))) + 1
    }
    remaining -= duration
    
    // 生成随机时间
    const baseDate = new Date()
    const randomDays = Math.floor(Math.random() * 30) // 最近30天内
    const randomHours = Math.floor(Math.random() * 24)
    const randomMinutes = Math.floor(Math.random() * 60)
    
    const alarmTime = new Date(baseDate)
    alarmTime.setDate(alarmTime.getDate() - randomDays)
    alarmTime.setHours(randomHours, randomMinutes, 0, 0)
    
    const clearTime = new Date(alarmTime)
    clearTime.setMinutes(clearTime.getMinutes() + duration)
    
    const processTime = new Date(clearTime)
    processTime.setMinutes(processTime.getMinutes() + Math.floor(Math.random() * 10) + 1) // 1-10分钟
    
    // 生成随机数据
    const type = types[Math.floor(Math.random() * types.length)]
    const handler = handlers[Math.floor(Math.random() * handlers.length)]
    const reason = reasons[Math.floor(Math.random() * reasons.length)]
    const measure = measures[Math.floor(Math.random() * measures.length)]
    
    // 生成随机长文本
    const generateLongText = (baseText: string) => {
      const suffixes = [
        '，需要进一步检查相关设备。',
        '，请技术人员及时处理。',
        '，已通知相关部门进行排查。',
        '，可能存在设备老化问题。',
        '，建议定期进行维护保养。'
      ]
      let longText = baseText
      for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
        longText += suffixes[Math.floor(Math.random() * suffixes.length)]
      }
      return longText
    }
    
    list.push({
      index: i + 1,
      type,
      alarmTime: alarmTime.toISOString().replace('T', ' ').slice(0, 19),
      clearTime: clearTime.toISOString().replace('T', ' ').slice(0, 19),
      processTime: processTime.toISOString().replace('T', ' ').slice(0, 19),
      durationMinutes: duration,
      alarmReason: generateLongText(reason),
      rectificationMeasures: generateLongText(measure),
      handler
    })
  }
  
  // 按报警时间降序排列
  return list.sort((a, b) => new Date(b.alarmTime).getTime() - new Date(a.alarmTime).getTime())
}

// 打开详情
const openDetail = (row: any) => {
  console.log('打开详情:', row)
  detailList.value = generateDetailData(row)
  detailPagination.value.currentPage = 1 // 重置分页
  detailDialogVisible.value = true
}

// 详情弹窗事件处理
const handleDetailSearch = () => {
  console.log('搜索详情数据:', detailFilters.value)
  // 这里可以根据过滤条件筛选数据
}

const handleDetailExport = () => {
  console.log('导出详情数据')
}

const handleDetailSizeChange = (val: number) => {
  detailPagination.value.pageSize = val
  detailPagination.value.currentPage = 1
}

const handleDetailCurrentChange = (val: number) => {
  detailPagination.value.currentPage = val
}

const viewDetailItem = (row: any) => {
  console.log('查看详情项:', row)
  // 这里可以打开更详细的信息弹窗
}

// 更新图表
const updateCharts = () => {
  console.log('更新图表数据')
}

// 监听窗口大小变化
const handleResize = () => {
  durationBarChart?.resize()
  distributionChart?.resize()
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
  durationBarChart?.dispose()
  distributionChart?.dispose()
})
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

.stat-card.blue {
  background: linear-gradient(90deg, 
  rgba(209, 227, 255, 0.8) 0%, 
  rgba(235, 241, 255, 0.8) 100%);
}

.stat-card.orange {
  background: linear-gradient(90deg,
  rgba(255, 208, 171, 0.6) 0%, 
  rgba(255, 242, 232, 0.6) 100%);
}

.stat-card.purple {
  background: linear-gradient(90deg,
  rgba(204, 207, 255, 0.6) 0%, 
  rgba(230, 231, 255, 0.6) 100%); 
}

.stat-card.blue .stat-value {
  color: #2681ff;
}

.stat-card.orange .stat-value {
  color: #fc8428;
}

.stat-card.purple .stat-value {
  color: #6A5BDE;
}

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

/* .chart-container {
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
  height: 350px;
} */

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

/* --- 表格工具栏样式 --- */
.table-toolbar {
  display: flex;
  justify-content: space-between; /* 左侧按钮靠左，右侧操作靠右 */
  align-items: center;
  margin-bottom: 24px; /* 和表格拉开距离 */
  flex-wrap: wrap;     /* 防止屏幕太窄时挤在一起 */
  gap: 12px;
}

.actions-right {
  display: flex;
  align-items: center;
}

/* --- 自定义蓝色胶囊单选框 --- */
.custom-blue-radio :deep(.el-radio-button__inner) {
  background-color: #409EFF;   /* 默认背景就是蓝色 */
  color: #ffffff;              /* 文字白色 */
  border-color: rgba(255, 255, 255, 0.3); /* 分割线颜色 */
  box-shadow: none;
  padding: 8px 20px;          /* 调整内边距，让它看起来更饱满 */
  font-weight: normal;
}

/* 选中状态：加深颜色，或者加粗，以此区分 */
.custom-blue-radio :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #337ecc; /* 选中时颜色更深一点 */
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: none;
  font-weight: bold;         /* 选中加粗 */
}

/* 第一个按钮左边圆角 */
.custom-blue-radio :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 4px 0 0 4px;
}

/* 最后一个按钮右边圆角 */
.custom-blue-radio :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 4px 4px 0;
}

/* 去掉默认的 focus 阴影 */
.custom-blue-radio :deep(.el-radio-button__original-radio:focus-visible + .el-radio-button__inner) {
  box-shadow: none;
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
/* --- 修复：卡片标题与内容间距过大 --- */

/* 1. 去掉卡片内标题的下边距 (针对顶部的图表卡片和底部的明细卡片) */
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

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: flex-end; /* 靠右对齐 */
  margin-top: 24px;          /* 与表格拉开距离 */
}

/* 详情弹窗搜索栏过滤项 */
.filter-item {
  margin-right: 12px;
  width: 180px;
}
</style>
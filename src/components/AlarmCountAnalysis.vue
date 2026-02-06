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
              <div class="stat-title">报警点位总数</div>
              <div class="stat-value">128<span class="stat-unit">个</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-3.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card orange">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">报警总次数</div>
              <div class="stat-value">8,642<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-2.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card green">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">单日最高报警次数</div>
              <div class="stat-value">328<span class="stat-unit">次</span></div>
              <div class="stat-trend trend-down">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-4.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>
        
        <div class="stat-card red">
          <div class="stat-content">
            <div class="card-left">
              <div class="stat-title">平均报警数</div>
              <div class="stat-value">288<span class="stat-unit">个</span></div>
              <div class="stat-trend trend-up">
              </div>
            </div>
            <div class="card-right">
              <img src="/src/assets/icon-analysis-1.png" class="custom-icon-img" alt="icon" />
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <!-- 趋势分析和分布分析 -->
    <div class="chart-row">
      <!-- 报警次数趋势图 -->
      <el-card class="chart-card trend-chart">
        <template #header>
          <div class="section-header">
            <span>报警次数趋势图</span>
          </div>
        </template>
        <div class="chart-container" ref="trendChartRef"></div>
      </el-card>
      
      <!-- 部门报警分布 -->
      <el-card class="chart-card distribution-chart">
        <template #header>
          <div class="section-header">
            <span>部门报警分布</span>
          </div>
        </template>
        <div class="chart-container" ref="distributionChartRef"></div>
      </el-card>
    </div>
    

    
    <!-- 排行数据 -->
    <div class="ranking-row">
      <!-- 点位排序 -->
      <el-card class="ranking-card">
        <template #header>
          <div class="section-header">
            <span>点位排序 (Top 10)</span>
            <el-button type="primary" size="small" class="export-btn">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </template>
        <el-table :data="pointRankingData" stripe style="width: 100%">
          <el-table-column prop="index" label="序号" width="80" align="center" />
          <el-table-column prop="pointName" label="监测点名称" align="center"/>
          <el-table-column prop="department" label="所属部门" align="center"/>
          <el-table-column prop="alarmCount" label="报警次数" width="120" align="center"/>
          <el-table-column label="操作" width="120"align="center">
            <template #default="scope">
              <el-button type="primary" size="small" @click="openPointDetail(scope.row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      
      <!-- 部门排序 -->
      <el-card class="ranking-card">
        <template #header>
          <div class="section-header">
            <span>部门排序 (Top 10)</span>
            <el-button type="primary" size="small" class="export-btn">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </template>
        <el-table :data="departmentRankingData" stripe style="width: 100%">
          <el-table-column prop="index" label="序号" width="80" align="center"/>
          <el-table-column prop="departmentName" label="部门名称"  align="center"/>
          <el-table-column prop="alarmCount" label="报警次数" width="200" align="center"/>
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" @click="openDepartmentDetail(scope.row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <!-- 点位排序详情弹窗 -->
    <el-dialog
      v-model="pointDetailDialogVisible"
      title="点位报警历史"
      width="80%"
      class="industrial-dialog"
    >
      <div class="modal-content">
        <!-- 搜索筛选 -->
        <div class="search-filters">
          <el-form :inline="true" :model="pointDetailForm">
            <el-form-item label="类型">
              <el-select v-model="pointDetailForm.type" placeholder="请选择类型" style="width: 120px;">
                <el-option label="高高报" value="HH" />
                <el-option label="高报" value="H" />
                <el-option label="低报" value="L" />
                <el-option label="低低报" value="LL" />
              </el-select>
            </el-form-item>
            <el-form-item label="处理人">
              <el-input v-model="pointDetailForm.handler" placeholder="请输入处理人" />
            </el-form-item>
            <el-form-item label="报警时间">
              <el-date-picker
                v-model="pointDetailForm.alarmTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="search-btn">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button type="default" class="reset-btn">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
              <el-button type="primary" class="export-btn">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 报警历史列表 -->
        <el-table :data="paginatedPointAlarmHistory" stripe style="width: 100%">
          <el-table-column prop="index" label="序号" width="80" align="center" />
          <el-table-column prop="type" label="类型" width="100" align="center" />
          <el-table-column prop="alarmTime" label="报警时间" width="180" align="center" />
          <el-table-column prop="clearTime" label="销警时间" width="180" align="center" />
          <el-table-column prop="handleTime" label="处理时间" width="180" align="center" />
          <el-table-column prop="reason" label="报警原因" show-overflow-tooltip align="center" />
          <el-table-column prop="measure" label="整改措施" show-overflow-tooltip align="center" />
          <el-table-column prop="handler" label="处理人" width="120" align="center" />
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pointCurrentPage"
            v-model:page-size="pointPageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pointAlarmHistory.length"
            background
            @size-change="handlePointSizeChange"
            @current-change="handlePointCurrentChange"
          />
        </div>
      </div>
    </el-dialog>
    
    <!-- 部门排序详情弹窗 -->
    <el-dialog
      v-model="departmentDetailDialogVisible"
      title="部门报警详情"
      width="80%"
      class="industrial-dialog"
    >
      <div class="modal-content">
        <!-- 搜索筛选 -->
        <div class="search-filters">
          <el-form :inline="true" :model="departmentDetailForm">
            <el-form-item label="类型">
              <el-select v-model="departmentDetailForm.type" placeholder="请选择类型" style="width: 120px;">
                <el-option label="高高报" value="HH" />
                <el-option label="高报" value="H" />
                <el-option label="低报" value="L" />
                <el-option label="低低报" value="LL" />
              </el-select>
            </el-form-item>
            <el-form-item label="报警时间">
              <el-date-picker
                v-model="departmentDetailForm.alarmTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="处理人">
              <el-input v-model="departmentDetailForm.handler" placeholder="请输入处理人" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="search-btn">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button type="default" class="reset-btn">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 部门报警列表 -->
        <el-table :data="departmentAlarmList" stripe style="width: 100%">
          <el-table-column prop="index" label="序号" width="80" align="center" />
          <el-table-column prop="pointCode" label="点位位号" width="120" align="center" />
          <el-table-column prop="pointName" label="监测点名称" align="center" />
          <el-table-column prop="department" label="责任部门" width="150" align="center" />
          <el-table-column prop="alarmType" label="报警种类" width="120" align="center" />
          <el-table-column prop="alarmContent" label="报警内容" show-overflow-tooltip align="center" />
          <el-table-column prop="alarmLevel" label="报警级别" width="120" align="center" />
          <el-table-column prop="alarmTime" label="报警时间" width="180" align="center" />
          <el-table-column prop="handler" label="处理人" width="120" align="center" />
        </el-table>
          
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :total="150"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="10"
            current-page="1"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'
import {
  DataAnalysis,
  Warning,
  Top,
  DataLine,
  ArrowUp,
  ArrowDown,
  Download,
  Search,
  Refresh
} from '@element-plus/icons-vue'

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
const pointDetailDialogVisible = ref(false)
const departmentDetailDialogVisible = ref(false)

// 弹窗表单数据
const pointDetailForm = ref({
  type: '',
  handler: '',
  alarmTime: null as [string, string] | null
})

const departmentDetailForm = ref({
  type: '',
  alarmTime: null as [string, string] | null,
  handler: ''
})


// 点位报警历史数据
const pointAlarmHistory = ref<any[]>([])

// 部门报警列表数据
const departmentAlarmList = ref<any[]>([])

// 生成点位报警历史模拟数据
const generatePointAlarmHistory = () => {
  const data = []
  const types = ['HH', 'H', 'L', 'LL']
  const reasons = ['温度传感器故障', '工艺波动', '流量过低', '液位过低', '压力过高', '阀门故障', '泵故障', '管道堵塞']
  const measures = ['更换传感器', '调整操作参数', '检查阀门开度', '增加进料', '释放压力', '维修阀门', '更换泵', '清理管道']
  const handlers = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
  
  for (let i = 1; i <= 100; i++) {
    // 随机生成过去30天内的时间
    const start = new Date()
    start.setDate(start.getDate() - Math.floor(Math.random() * 30))
    start.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60))
    
    // 生成随机时间间隔
    const clearDelay = Math.floor(Math.random() * 300) + 60 // 1-5分钟
    const handleDelay = Math.floor(Math.random() * 600) + 120 // 2-10分钟
    
    const clearTime = new Date(start.getTime() + clearDelay * 1000)
    const handleTime = new Date(start.getTime() + handleDelay * 1000)
    
    data.push({
      index: i,
      type: types[Math.floor(Math.random() * types.length)],
      alarmTime: start.toLocaleString(),
      clearTime: clearTime.toLocaleString(),
      handleTime: handleTime.toLocaleString(),
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      measure: measures[Math.floor(Math.random() * measures.length)],
      handler: handlers[Math.floor(Math.random() * handlers.length)]
    })
  }
  pointAlarmHistory.value = data
}

// 生成部门报警列表模拟数据
const generateDepartmentAlarmList = () => {
  const data = []
  const departments = ['1工段', '2工段', '3工段', '4工段', '5工段']
  const alarmTypes = ['高高报', '高报', '低报', '低低报']
  const alarmLevels = ['一级报警', '二级报警', '三级报警']
  const handlers = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
  const pointTypes = ['温度变送器', '压力变送器', '液位变送器', '流量变送器']
  
  for (let i = 1; i <= 150; i++) {
    // 随机生成过去30天内的时间
    const alarmTime = new Date()
    alarmTime.setDate(alarmTime.getDate() - Math.floor(Math.random() * 30))
    alarmTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60))
    
    // 生成随机监测点
    const pointIndex = Math.floor(Math.random() * 4)
    const typeCode = ['TIC', 'PIC', 'LIC', 'FIC'][pointIndex]
    const num = String(i).padStart(3, '0')
    const pointCode = `${typeCode}-${num}`
    const pointName = pointTypes[pointIndex]
    
    data.push({
      index: i,
      pointCode: pointCode,
      pointName: pointName,
      department: departments[Math.floor(Math.random() * departments.length)],
      alarmType: alarmTypes[Math.floor(Math.random() * alarmTypes.length)],
      alarmContent: `${pointName.split('')[0]}超过${alarmTypes[Math.floor(Math.random() * alarmTypes.length)].split('')[1]}值`,
      alarmLevel: alarmLevels[Math.floor(Math.random() * alarmLevels.length)],
      alarmTime: alarmTime.toLocaleString(),
      handler: handlers[Math.floor(Math.random() * handlers.length)]
    })
  }
  departmentAlarmList.value = data
}

// 点位报警历史分页状态
const pointCurrentPage = ref(1)
const pointPageSize = ref(10)

// 部门报警列表分页状态
const departmentCurrentPage = ref(1)
const departmentPageSize = ref(10)

// 计算属性：分页数据
const paginatedPointAlarmHistory = computed(() => {
  const start = (pointCurrentPage.value - 1) * pointPageSize.value
  const end = start + pointPageSize.value
  return pointAlarmHistory.value.slice(start, end)
})

const paginatedDepartmentAlarmList = computed(() => {
  const start = (departmentCurrentPage.value - 1) * departmentPageSize.value
  const end = start + departmentPageSize.value
  return departmentAlarmList.value.slice(start, end)
})

// 分页事件处理
const handlePointSizeChange = (val: number) => {
  pointPageSize.value = val
  pointCurrentPage.value = 1 // 重置到第一页
}

const handlePointCurrentChange = (val: number) => {
  pointCurrentPage.value = val
}

const handleDepartmentSizeChange = (val: number) => {
  departmentPageSize.value = val
  departmentCurrentPage.value = 1 // 重置到第一页
}

const handleDepartmentCurrentChange = (val: number) => {
  departmentCurrentPage.value = val
}

// 方法
const handleDateRangeChange = (val: [string, string]) => {
  console.log('日期范围变化:', val)
  // 这里可以添加数据刷新逻辑
  updateCharts()
}

const openPointDetail = (row: any) => {
  console.log('打开点位详情:', row)
  pointDetailDialogVisible.value = true
}

const openDepartmentDetail = (row: any) => {
  console.log('打开部门详情:', row)
  departmentDetailDialogVisible.value = true
}
// 点位排序数据 (Top 10)
const pointRankingData = ref([
  { index: 1, pointName: 'TIC-101', department: '1工段', alarmCount: 328 },
  { index: 2, pointName: 'PIC-201', department: '2工段', alarmCount: 286 },
  { index: 3, pointName: 'LIC-301', department: '3工段', alarmCount: 254 },
  { index: 4, pointName: 'FIC-102', department: '1工段', alarmCount: 232 },
  { index: 5, pointName: 'TIC-202', department: '2工段', alarmCount: 218 },
  { index: 6, pointName: 'PIC-302', department: '3工段', alarmCount: 196 },
  { index: 7, pointName: 'LIC-103', department: '1工段', alarmCount: 182 },
  { index: 8, pointName: 'FIC-203', department: '2工段', alarmCount: 168 },
  { index: 9, pointName: 'TIC-303', department: '3工段', alarmCount: 154 },
  { index: 10, pointName: 'PIC-104', department: '1工段', alarmCount: 142 }
])

// 部门排序数据 (Top 10)
const departmentRankingData = ref([
  { index: 1, departmentName: '1工段', alarmCount: 1248 },
  { index: 2, departmentName: '2工段', alarmCount: 1056 },
  { index: 3, departmentName: '3工段', alarmCount: 982 },
  { index: 4, departmentName: '4工段', alarmCount: 876 },
  { index: 5, departmentName: '5工段', alarmCount: 764 },
  { index: 6, departmentName: '6工段', alarmCount: 652 },
  { index: 7, departmentName: '7工段', alarmCount: 548 },
  { index: 8, departmentName: '8工段', alarmCount: 436 },
  { index: 9, departmentName: '9工段', alarmCount: 324 },
  { index: 10, departmentName: '10工段', alarmCount: 212 }
])
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
        name: '报警次数'
      },
      series: [{
        name: '报警次数',
        type: 'line',
        smooth: true,
        data: [286, 324, 298, 312, 345, 368, 324, 302, 286, 312, 334, 356, 389, 412, 398, 376, 354, 332, 310, 298, 324, 346, 368, 345, 323, 301, 289, 312, 334, 356],
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

// 初始化分布图 (优化版)
const initDistributionChart = () => {
  if (distributionChartRef.value) {
    distributionChart = echarts.init(distributionChartRef.value)
    
    // 1. 计算总数 (为了显示在中间)
    const data = [
      { value: 3280, name: '1工段' },
      { value: 2860, name: '2工段' },
      { value: 1540, name: '3工段' },
      { value: 560, name: '4工段' },
      { value: 320, name: '5工段' },
      { value: 82, name: '其他' }
    ]
    const total = data.reduce((a, b) => a + b.value, 0).toLocaleString()

    const option = {
      // 颜色盘：使用更鲜亮和谐的 B 端配色
      color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#36cfc9'],
      
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)' // 简洁的提示
      },
      
      // 2. 中间显示总数标题
      title: {
        text: total,          // 主标题：总数值
        subtext: '报警总数',   // 副标题
        left: '39%',          // 配合饼图圆心位置 (40%)
        top: '48%',           // 垂直居中
        textAlign: 'center',  // 文字居中对齐
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
      
      // 3. 图例样式优化
      legend: {
        orient: 'vertical',
        right: '10%',         // 靠右停靠
        top: 'middle',        // 垂直居中
        itemGap: 15,          // 间距拉开一点
        itemWidth: 10,        // 图标变小圆点
        itemHeight: 10,
        icon: 'circle',
        textStyle: {
          fontSize: 12,
          color: '#606266'
        },
        formatter: (name: string) => {
            // 获取该项的值，展示 "名称  数值"
            const item = data.find(i => i.name === name);
            return `${name}   ${item ? item.value : ''}`;
        }
      },
      
      series: [{
        name: '部门报警',
        type: 'pie',
        // 4. 关键：调整圆环粗细和圆角
        radius: ['55%', '75%'], // 内径变大，环变粗
        center: ['40%', '50%'], // 圆心稍微向左移，平衡右侧图例
        avoidLabelOverlap: false,
        
        itemStyle: {
          borderRadius: 8,      // 圆角效果
          borderColor: '#fff',  // 白边分割
          borderWidth: 3
        },
        
        label: {
          show: false,          // 默认不显示引线标签
          position: 'center'
        },
        
        // 鼠标悬停时放大
        emphasis: {
          scale: true,
          scaleSize: 10,
          label: {
            show: false         // 悬停时不覆盖中间的 Title
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
  generatePointAlarmHistory() // 初始化生成点位报警历史模拟数据
  generateDepartmentAlarmList() // 初始化生成部门报警列表模拟数据
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
.stat-title {
  margin-bottom: 8px;  /* 现在的距离是 4px */
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
/* --- 新增：统计区域外层容器 (白色卡片背景) --- */
.statistics-section {
  background: #ffffff;
  border-radius: 8px; /* 圆角 */
  padding: 24px;      /* 内边距 */
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05); /* 轻微阴影 */
}

/* --- 新增：区域标题栏 --- */
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
  background: #409EFF; /* 你的主色调 */
  margin-right: 8px;
  border-radius: 2px;
}

/* --- 修改：卡片布局容器 --- */
.stats-cards {
  display: flex;
  gap: 20px; /* 卡片之间的间距 */
  flex-wrap: wrap; /* 屏幕小的时候自动换行 */
}

/* --- 修改：单个卡片样式 --- */
.stat-card {
  flex: 1;             /* 平均分配宽度 */
  min-width: 220px;    /* 最小宽度，防止太窄 */
  height: 100px;       /* 固定高度，看起来更整齐 */
  border-radius: 8px;
  padding: 0 24px;     /* 卡片内部左右留白 */
  display: flex;       /* 开启Flex布局 */
  align-items: center; /* 垂直居中 */
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px); /* 鼠标悬停上浮效果 */
}

/* --- 核心：自定义渐变背景色 (你可以修改这里的颜色) --- */
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
.stat-card.green {
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
/* --- 新增：让不同卡片的数字显示不同颜色 --- */

/* 蓝色卡片 - 数字变蓝 */
.stat-card.blue .stat-value {
  color: #2681ff;
}

/* 橙色卡片 - 数字变橙 */
.stat-card.orange .stat-value {
  color: #fc8428;
}

/* 绿色卡片 - 数字变绿 */
.stat-card.green .stat-value {
  color: #6A5BDE;
}

/* 红色卡片 - 数字变红 */
.stat-card.red .stat-value {
  color: #FF4D55;
}
/* --- 补充：让标题文字也跟随主题变色 --- */

/* 蓝色卡片 - 标题变蓝 */
.stat-card.blue .stat-title {
  color: #2681ff;
  opacity: 0.8; /*稍微淡一点，突出数字*/
}

/* 橙色卡片 - 标题变橙 */
.stat-card.orange .stat-title {
  color: #fc8428;
  opacity: 0.9;
}

/* 绿色卡片 - 标题变绿 */
.stat-card.green .stat-title {
  color: #6A5BDE;
  opacity: 0.9;
}

/* 红色卡片 - 标题变红 */
.stat-card.red .stat-title {
  color: #FF4D55;
  opacity: 0.9;
}
/* --- 内容布局：左右分开 --- */
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
.stat-value {
  font-size: 28px; /* 数字加大 */
  font-weight: 700;
  color: #ffffff;
  font-family: 'JetBrains Mono', sans-serif; /* 保持原来的数字字体 */
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
  width: 56px;  /* 图片宽度 */
  height: 56px; /* 图片高度 */
  object-fit: contain;
  opacity: 0.9; /* 稍微透明一点点，融合度更好 */
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
  /* 保持高度不变，或者根据需要调整 (比如改为 350px 显得更紧凑) */
  /* height: auto;  */
  
  /* 确保占满父容器宽度 */
  /* width: auto; */
  
  /* ✅ 关键修改：建议去掉 margin-bottom */
  /* 因为我们刚刚在 .el-card__body 里加了 24px 的 padding-bottom */
  /* 如果这里再加 margin，底部留白会太大 (24+24=48px)，显得空荡荡的 */
  margin-bottom: 0; 
  
  /* ✅ 最佳实践：加上相对定位 */
  /* 这有助于 ECharts 的 Tooltip (提示框) 准确计算位置，防止错位 */
  position: relative;
  
  /* 防止图表缩放时溢出 */
  overflow: hidden;
}

/* 排行数据 */
.ranking-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.ranking-card {
  flex: 1;
  min-width: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.export-btn {
  margin-left: auto;
}

/* 搜索筛选 */
.search-filters {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
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
.stat-unit {
  font-size: 14px;      /* 字体改小，形成层次感 (原数字是 28px) */
  margin-left: 4px;     /* 和数字拉开一点点距离 */
  font-weight: normal;  /* 字重变细，不要太抢眼 */
  opacity: 0.8;         /* 稍微透明一点，更有质感 */
}
/* --- 修复：卡片标题与内容间距过大 --- */

/* 1. 去掉卡片内标题的下边距 */
.chart-card .section-header,
.ranking-card .section-header {
  margin-bottom: 0 !important;
}

/* 2. 调整 Card Body 的内边距 (让内容往上提一点，更紧凑) */
.chart-card :deep(.el-card__body),
.ranking-card :deep(.el-card__body) {
  padding-top: 10px; /* 建议设为 10px 或 0 */
}
</style>
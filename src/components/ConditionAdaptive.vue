<template>
  <div class="condition-adaptive">
    <!-- 搜索栏 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="设备名称"
        prefix-icon="Search"
        clearable
        class="search-input"
      />
      <div class="search-buttons">
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
    </div>

    <!-- 设备列表 -->
    <el-card class="device-list-card">
      <template #header>
        <div class="header-content">
          <h3>设备列表</h3>
          <el-button type="primary" @click="openConfigDialog">
            <el-icon><Plus /></el-icon>
            新增配置
          </el-button>
        </div>
      </template>
      <el-table
        :data="filteredDevices"
        style="width: 100%"
        size="small"
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center"/>
        <el-table-column prop="name" label="设备名称" width="200" align="center"/>
        <el-table-column label="关联点位" width="400" align="center">
          <template #default="scope">
            <el-tag
              v-for="point in scope.row.points"
              :key="point.id"
              size="small"
              :type="point.online ? 'success' : 'danger'"
            >
              {{ point.name }} ({{ point.tag }})
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="当前状态" width="auto" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="auto" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="editDevice(scope.row)"
              style="margin-right: 6px"
            >
              编辑
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="viewDetails(scope.row)"
              style="margin-right: 6px"
            >
              详情
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="viewStartStopRecord(scope.row)"
              style="margin-right: 6px"
            >
              启停记录
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteDevice(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 配置弹窗 -->
    <el-dialog
      v-model="configDialogVisible"
      title="配置设备与点位"
      width="600px"
      center
    >
      <div class="config-dialog-content">
        <el-form label-width="80px">
          <el-form-item label="选择设备">
            <el-select
              v-model="selectedDevice"
              placeholder="请选择设备"
              style="width: 100%"
              @change="loadDevicePoints"
            >
              <el-option
                v-for="device in availableDevices"
                :key="device.id"
                :label="device.name"
                :value="device"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="点位列表">
            <el-input
              v-model="pointSearchQuery"
              placeholder="搜索点位"
              prefix-icon="Search"
              clearable
              style="margin-bottom: 12px"
            />
            <el-table
              :data="filteredPoints"
              style="width: 100%"
              size="small"
              border
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="name" label="监测点名称" min-width="120" />
              <el-table-column prop="tag" label="位号" min-width="100" />
              <el-table-column label="在线状态" width="80">
                <template #default="scope">
                  <el-tag :type="scope.row.online ? 'success' : 'danger'">
                    {{ scope.row.online ? '在线' : '离线' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="configDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveConfig">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑工况配置"
      width="1100px"
      center
    >
      <div class="edit-dialog-content">
        <div class="edit-layout">
          <!-- 左侧阶段管理 -->
          <div class="stage-management">
            <div class="stage-header">
              <h4>阶段管理</h4>
              <el-button
                type="primary"
                size="small"
                @click="addStage"
              >
                <el-icon><Plus /></el-icon>
                新增阶段
              </el-button>
            </div>
            <div class="stage-list">
              <div
                v-for="(stage, index) in stages"
                :key="stage.id"
                :class="['stage-item', { active: selectedStageId === stage.id }]"
                @click="selectStage(stage.id)"
              >
                <span class="stage-name">{{ stage.name }}</span>
                <div class="stage-actions">
                  <el-button
                    type="text"
                    size="small"
                    @click.stop="moveStageUp(index)"
                    :disabled="index === 0"
                  >
                    <el-icon><ArrowUp /></el-icon>
                  </el-button>
                  <el-button
                    type="text"
                    size="small"
                    @click.stop="moveStageDown(index)"
                    :disabled="index === stages.length - 1"
                  >
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <el-button
                    type="text"
                    size="small"
                    @click.stop="deleteStage(stage.id)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧判定逻辑 -->
          <div class="judgment-logic">
            <h4>判定逻辑</h4>
            
            <!-- 数字逻辑 -->
            <div class="logic-section">
              <h5>判定状态 (数字逻辑)</h5>
              <div
                v-for="(condition, index) in currentStage?.digitalConditions || []"
                :key="index"
                class="condition-item"
              >
                <el-select v-model="condition.tag" placeholder="选择位号">
                  <el-option
                    v-for="point in selectedDevice.points"
                    :key="point.id"
                    :label="point.tag"
                    :value="point.tag"
                  />
                </el-select>
                <el-select v-model="condition.operator" placeholder="运算符">
                  <el-option label="=" value="==" />
                  <el-option label="!=" value="!=" />
                  <el-option label=">" value=">" />
                  <el-option label="<" value="<" />
                </el-select>
                <el-input v-model="condition.value" placeholder="判定值" />
                <el-button
                  type="danger"
                  size="small"
                  @click="removeDigitalCondition(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button
                type="primary"
                size="small"
                @click="addDigitalCondition"
              >
                <el-icon><Plus /></el-icon>
                添加条件
              </el-button>
            </div>

            <!-- 模拟量逻辑 -->
            <div class="logic-section">
              <h5>判定区间 (模拟量)</h5>
              <div
                v-for="(condition, index) in currentStage?.analogConditions || []"
                :key="index"
                class="condition-item"
              >
                <el-select v-model="condition.tag" placeholder="选择位号">
                  <el-option
                    v-for="point in selectedDevice.points"
                    :key="point.id"
                    :label="point.tag"
                    :value="point.tag"
                  />
                </el-select>
                <el-input v-model="condition.min" placeholder="MIN" style="width: 80px" />
                <span class="range-separator">~</span>
                <el-input v-model="condition.max" placeholder="MAX" style="width: 80px" />
                <el-button
                  type="danger"
                  size="small"
                  @click="removeAnalogCondition(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button
                type="primary"
                size="small"
                @click="addAnalogCondition"
              >
                <el-icon><Plus /></el-icon>
                添加条件
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveStageConfig">保存配置</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 启停记录弹窗 -->
    <el-dialog
      v-model="recordDialogVisible"
      title="启停记录"
      width="800px"
      center
    >
      <div class="record-dialog-content">
        <el-table
          :data="startStopRecords"
          style="width: 100%"
          size="small"
          border
        >
          <el-table-column prop="stageName" label="阶段名称" min-width="120" align="center" />
          <el-table-column label="持续时间" min-width="200" align="center">
            <template #default="scope">
              <div>
                <div>{{ scope.row.startTime }} ~ {{ scope.row.endTime }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="持续时长" width="100" align="center" />
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="viewTrend(scope.row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="recordDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 趋势分析弹窗 -->
    <el-dialog
      v-model="trendDialogVisible"
      title="趋势分析"
      width="1200px"
      center
    >
      <div class="trend-analysis-content">
        <!-- 左右布局 -->
        <div class="trend-layout">
          <!-- 左侧测点列表 -->
          <div class="points-list">
            <el-table
              :data="currentRecordPoints"
              style="width: 100%"
              size="small"
              highlight-current-row
            >
              <el-table-column prop="name" label="测点名称" min-width="120" show-overflow-tooltip />
              <el-table-column prop="tag" label="位号" min-width="100" show-overflow-tooltip />
              <el-table-column label="操作" width="70" align="center">
                <template #default="scope">
                  <el-button
                    type="primary"
                    link
                    size="small"
                    @click="loadPointTrend(scope.row)"
                  >
                    趋势
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 右侧图表区 -->
          <div class="chart-area">
            <h4>趋势回溯</h4>
            <h5 class="chart-title">{{ currentChartTitle }}</h5>
            <div class="chart-container" ref="chartContainer"></div>
            <div class="chart-info">
              <div class="time-range">
                <span>时间范围: {{ currentRecord?.startTime }} ~ {{ currentRecord?.endTime }}</span>
              </div>
              <div class="threshold-markers">
                <span class="marker max">MAX值</span>
                <span class="marker min">MIN值</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="trendDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 反馈提示 -->
    <el-notification
      v-if="showNotification"
      :title="notificationTitle"
      :message="notificationMessage"
      :type="notificationType"
      :duration="3000"
      @close="showNotification = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Plus, Search, ArrowUp, ArrowDown, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 设备数据结构
interface DevicePoint {
  id: string
  name: string
  tag: string
  online: boolean
}

interface Device {
  id: string
  name: string
  points: DevicePoint[]
  status: string
}

// 阶段数据结构
interface DigitalCondition {
  tag: string
  operator: string
  value: string
}

interface AnalogCondition {
  tag: string
  min: string
  max: string
}

interface Stage {
  id: string
  name: string
  digitalConditions: DigitalCondition[]
  analogConditions: AnalogCondition[]
}

// 启停记录数据结构
interface StartStopRecord {
  id: string
  stageName: string
  startTime: string
  endTime: string
  duration: string
}

// 响应式数据
const searchQuery = ref('')
const pointSearchQuery = ref('')
const configDialogVisible = ref(false)
const editDialogVisible = ref(false)
const recordDialogVisible = ref(false)
const trendDialogVisible = ref(false)
const selectedDevice = ref<any>(null)
const selectedStageId = ref<string>('')
const showNotification = ref(false)
const notificationTitle = ref('')
const notificationMessage = ref('')
const notificationType = ref<'success' | 'warning' | 'info' | 'error'>('success')
const currentRecord = ref<any>(null)
const currentRecordPoints = ref<any[]>([])
const currentChartTitle = ref('趋势分析')
const chartContainer = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 模拟数据
const devices = ref<Device[]>([
  {
    id: '1',
    name: '聚合釜',
    points: [
      { id: '1-1', name: '温度', tag: 'VA6078', online: true },
      { id: '1-2', name: '压力', tag: 'VA6680', online: true }
    ],
    status: '进料阶段'
  },
  {
    id: '2',
    name: '反应器',
    points: [
      { id: '2-1', name: '温度', tag: 'VB6078', online: true },
      { id: '2-2', name: '压力', tag: 'VB6680', online: false }
    ],
    status: '升温阶段'
  }
])

const availableDevices = ref([
  { id: '1', name: '聚合釜' },
  { id: '2', name: '反应器' },
  { id: '3', name: '分离器' },
  { id: '4', name: '换热器' }
])

const devicePoints = ref<DevicePoint[]>([
  { id: '1-1', name: '温度', tag: 'VA6078', online: true },
  { id: '1-2', name: '压力', tag: 'VA6680', online: true },
  { id: '1-3', name: '液位', tag: 'VA6681', online: true },
  { id: '1-4', name: '流量', tag: 'VA6682', online: false }
])

const stages = ref<Stage[]>([
  {
    id: '1',
    name: '进料阶段',
    digitalConditions: [
      { tag: 'VA6078', operator: '==', value: '0' }
    ],
    analogConditions: []
  },
  {
    id: '2',
    name: '升温阶段',
    digitalConditions: [],
    analogConditions: [
      { tag: 'VA6680', min: '10', max: '15' }
    ]
  }
])

const startStopRecords = ref<StartStopRecord[]>([
  {
    id: '1',
    stageName: '进料阶段',
    startTime: '2026-02-06 08:00:00',
    endTime: '2026-02-06 08:30:00',
    duration: '30分钟'
  },
  {
    id: '2',
    stageName: '升温阶段',
    startTime: '2026-02-06 08:30:00',
    endTime: '2026-02-06 09:00:00',
    duration: '30分钟'
  }
])

// 计算属性
const filteredDevices = computed(() => {
  if (!searchQuery.value) return devices.value
  return devices.value.filter(device => 
    device.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredPoints = computed(() => {
  if (!pointSearchQuery.value) return devicePoints.value
  return devicePoints.value.filter(point => 
    point.name.toLowerCase().includes(pointSearchQuery.value.toLowerCase()) ||
    point.tag.toLowerCase().includes(pointSearchQuery.value.toLowerCase())
  )
})

const currentStage = computed(() => {
  return stages.value.find(stage => stage.id === selectedStageId.value)
})

// 方法
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '进料阶段': 'info',
    '升温阶段': 'warning',
    '反应阶段': 'success',
    '出料阶段': 'primary'
  }
  return statusMap[status] || 'default'
}

const openConfigDialog = () => {
  selectedDevice.value = null
  configDialogVisible.value = true
}

const loadDevicePoints = (device: any) => {
  // 模拟加载设备点位
  devicePoints.value = [
    { id: '1-1', name: '温度', tag: 'VA6078', online: true },
    { id: '1-2', name: '压力', tag: 'VA6680', online: true },
    { id: '1-3', name: '液位', tag: 'VA6681', online: true },
    { id: '1-4', name: '流量', tag: 'VA6682', online: false }
  ]
}

const saveConfig = () => {
  // 模拟保存配置
  showNotification.value = true
  notificationTitle.value = '保存成功'
  notificationMessage.value = '配置已保存'
  notificationType.value = 'success'
  configDialogVisible.value = false
}

const editDevice = (device: Device) => {
  selectedDevice.value = device
  selectedStageId.value = stages.value[0]?.id || ''
  editDialogVisible.value = true
}

const viewDetails = (device: Device) => {
  // 查看详情逻辑
  console.log('查看详情:', device)
}

const viewStartStopRecord = (device: Device) => {
  // 查看启停记录逻辑
  recordDialogVisible.value = true
}

const deleteDevice = (id: string) => {
  // 模拟删除设备
  devices.value = devices.value.filter(device => device.id !== id)
  showNotification.value = true
  notificationTitle.value = '删除成功'
  notificationMessage.value = '设备配置已删除'
  notificationType.value = 'success'
}

const addStage = () => {
  ElMessageBox.prompt(
    '请输入阶段名称',
    '新增阶段',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^\S+$/,
      inputErrorMessage: '阶段名称不能为空'
    }
  ).then(({ value }) => {
    const newStage: Stage = {
      id: Date.now().toString(),
      name: value,
      digitalConditions: [],
      analogConditions: []
    }
    stages.value.push(newStage)
    selectedStageId.value = newStage.id
    ElMessage({
      type: 'success',
      message: '阶段添加成功'
    })
  }).catch(() => {
    // 取消操作，不做处理
  })
}

const selectStage = (id: string) => {
  selectedStageId.value = id
}

const moveStageUp = (index: number) => {
  if (index > 0) {
    const temp = stages.value[index]
    stages.value[index] = stages.value[index - 1]
    stages.value[index - 1] = temp
  }
}

const moveStageDown = (index: number) => {
  if (index < stages.value.length - 1) {
    const temp = stages.value[index]
    stages.value[index] = stages.value[index + 1]
    stages.value[index + 1] = temp
  }
}

const deleteStage = (id: string) => {
  stages.value = stages.value.filter(stage => stage.id !== id)
  if (selectedStageId.value === id) {
    selectedStageId.value = stages.value[0]?.id || ''
  }
}

const addDigitalCondition = () => {
  if (currentStage.value) {
    currentStage.value.digitalConditions.push({ tag: '', operator: '', value: '' })
  }
}

const removeDigitalCondition = (index: number) => {
  if (currentStage.value) {
    currentStage.value.digitalConditions.splice(index, 1)
  }
}

const addAnalogCondition = () => {
  if (currentStage.value) {
    currentStage.value.analogConditions.push({ tag: '', min: '', max: '' })
  }
}

const removeAnalogCondition = (index: number) => {
  if (currentStage.value) {
    currentStage.value.analogConditions.splice(index, 1)
  }
}

const saveStageConfig = () => {
  // 模拟保存阶段配置
  showNotification.value = true
  notificationTitle.value = '保存成功'
  notificationMessage.value = '阶段配置已保存'
  notificationType.value = 'success'
  editDialogVisible.value = false
}

const viewTrend = (record: StartStopRecord) => {
  // 查看趋势逻辑
  console.log('查看趋势:', record)
  
  // 保存当前记录
  currentRecord.value = record
  
  // 模拟当前记录的测点数据
  currentRecordPoints.value = [
    { id: '1', name: '温度', tag: 'VA6078' },
    { id: '2', name: '压力', tag: 'VA6680' },
    { id: '3', name: '液位', tag: 'VA6681' },
    { id: '4', name: '流量', tag: 'VA6682' }
  ]
  
  // 打开趋势分析弹窗
  trendDialogVisible.value = true
  
  // 等待弹窗渲染完成后初始化图表
  nextTick(() => {
    initChart()
  })
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return
  
  // 销毁旧图表实例
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  // 创建新图表实例
  chartInstance = echarts.init(chartContainer.value)
  
  // 模拟时间数据
  const times = []
  const startTime = new Date(currentRecord.value.startTime)
  const endTime = new Date(currentRecord.value.endTime)
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60) // 转换为分钟
  
  for (let i = 0; i <= duration; i += 5) {
    const time = new Date(startTime.getTime() + i * 1000 * 60)
    times.push(time.toLocaleTimeString())
  }
  
  // 模拟温度数据
  const tempData = []
  for (let i = 0; i < times.length; i++) {
    // 生成10-15℃之间的随机温度
    const temp = 10 + Math.random() * 5
    tempData.push(temp.toFixed(1))
  }
  
  // 图表配置
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['温度', 'MAX值', 'MIN值'],
      top: '0',
      left: 'center',
      type: 'scroll'
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '15%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times
    },
    yAxis: {
      type: 'value',
      name: '温度 (℃)'
    },
    series: [
      {
        name: '温度',
        type: 'line',
        data: tempData,
        itemStyle: {
          color: '#409EFF'
        },
        smooth: true
      },
      {
        name: 'MAX值',
        type: 'line',
        data: Array(times.length).fill(15),
        itemStyle: {
          color: '#F56C6C'
        },
        lineStyle: {
          type: 'dashed'
        },
        symbol: 'none'
      },
      {
        name: 'MIN值',
        type: 'line',
        data: Array(times.length).fill(10),
        itemStyle: {
          color: '#67C23A'
        },
        lineStyle: {
          type: 'dashed'
        },
        symbol: 'none'
      }
    ]
  }
  
  // 设置图表配置
  chartInstance.setOption(option)
}

// 加载特定测点的趋势
const loadPointTrend = (point: any) => {
  console.log('加载测点趋势:', point)
  
  // 显示加载提示
  ElMessage({
    type: 'info',
    message: `正在加载 ${point.name} (${point.tag}) 的趋势数据...`,
    duration: 2000
  })
  
  // 更新图表标题
  currentChartTitle.value = `${point.name} (${point.tag}) 趋势分析`
  
  // 这里可以根据测点ID加载不同的趋势数据
  // 为了演示，我们只更新图表标题
}

// 搜索方法
const handleSearch = () => {
  // 执行搜索逻辑
  console.log('执行搜索:', searchQuery.value)
  // 这里可以添加搜索时的加载状态或其他逻辑
}

const resetSearch = () => {
  // 重置搜索
  searchQuery.value = ''
  console.log('重置搜索')
}

// 生命周期
onMounted(() => {
  // 初始化数据
  if (stages.value.length > 0) {
    selectedStageId.value = stages.value[0].id
  }
})
</script>

<style scoped>
.condition-adaptive {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px 20px; /* 舒适的内边距 */
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05); /* 精致的阴影 */
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 220px; /* 固定输入框宽度 */
}

.search-buttons {
  margin-left: auto; /* 关键：将按钮推到最右边 */
  display: flex;
  gap: 10px;
}

.device-list-card {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between; /* 关键：标题在左，按钮在右 */
  align-items: center;
}

.header-content h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}



.config-dialog-content,
.edit-dialog-content,
.record-dialog-content {
  padding: 20px 0;
}

.edit-layout {
  display: flex;
  gap: 20px;
  height: 400px;
}

.stage-management {
  width: 300px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.stage-header {
  padding: 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stage-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.stage-list {
  padding: 8px;
  overflow-y: auto;
  height: calc(100% - 52px);
}

.stage-item {
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stage-item:hover {
  background-color: #ecf5ff;
}

.stage-item.active {
  background-color: #409eff;
  color: white;
}

.stage-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage-actions {
  display: flex;
  gap: 4px;
}

.judgment-logic {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  overflow-y: auto;
}

.judgment-logic h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
}

.judgment-logic h5 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.logic-section {
  margin-bottom: 24px;
}

.condition-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.range-separator {
  margin: 0 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.duration {
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}

/* 趋势分析弹窗样式 */
.trend-analysis-content {
  padding: 20px 0;
}

.trend-layout {
  display: flex;
  gap: 20px;
  height: 500px;
}

.points-list {
  width: 340px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.points-list .el-table {
  flex: 1;
  border: none;
}

.chart-area {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chart-area h4 {
  margin: 0;
  padding: 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
  font-weight: 500;
}

.chart-title {
  margin: 10px 0;
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  text-align: center;
}

.chart-container {
  flex: 1;
  min-height: 300px;
}

.chart-info {
  padding: 12px;
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.time-range {
  color: #606266;
}

.threshold-markers {
  display: flex;
  gap: 12px;
}

.marker {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.marker.max {
  background-color: #FEF0F0;
  color: #F56C6C;
}

.marker.min {
  background-color: #F0F9EB;
  color: #67C23A;
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  .trend-layout {
    flex-direction: column;
    height: auto;
  }
  
  .points-list {
    width: 100%;
    height: 200px;
  }
  
  .chart-container {
    height: 400px;
  }
}
</style>
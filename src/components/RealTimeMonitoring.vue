<template>
  <div class="realtime-monitoring">
    <!-- 搜索筛选区 -->
    <div class="search-filter-section">
      <div class="filter-form">
        <el-input
          v-model="filters.pointNumber"
          placeholder="点位位号"
          class="filter-input"
        />
        <el-input
          v-model="filters.pointName"
          placeholder="监测点名称"
          class="filter-input"
        />
        <el-input
          v-model="filters.equipment"
          placeholder="关联设备"
          class="filter-input"
        />
        <el-input
          v-model="filters.substance"
          placeholder="监测物质"
          class="filter-input"
        />
        <el-input
          v-model="filters.alarmStatus"
          placeholder="报警状态"
          class="filter-input"
        />
        <el-select
          v-model="filters.connectionStatus"
          placeholder="连接状态"
          class="filter-select"
        >
          <el-option label="已连接" value="connected" />
          <el-option label="未连接" value="disconnected" />
        </el-select>
        <div class="lock-switch">
          <el-switch v-model="filters.locked" label="锁定开关" @change="handleLockChange" />
        </div>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <div class="main-content-area">
      <!-- 左侧组织架构树 -->
      <div class="organization-tree">
        <div class="tree-header">
          <el-input
            v-model="treeSearch"
            placeholder="搜索节点"
            prefix-icon="Search"
          />
        </div>
        <el-tree
          :data="organizationTree"
          :props="treeProps"
          :default-expand-all="false"
          :default-expanded-keys="['company1']"
          :filter-node-method="filterNode"
          class="tree-container"
          @node-click="handleNodeClick"
        />
      </div>

      <!-- 右侧数据区域 -->
      <div class="data-area">
        <!-- 数据概览卡片 -->
        <div class="overview-cards">
          <div 
            v-for="card in overviewCards" 
            :key="card.key"
            class="status-card"
            :style="{ '--status-color': card.color }"
            @click="handleCardClick(card.key)"
          >
            <div class="status-bar"></div>
            <div class="card-content">
              <div class="card-label text-tertiary">{{ card.label }}</div>
              <div class="card-value number">{{ card.value }}</div>
              <div class="card-icon">
                <el-icon :size="0">{{ card.icon }}</el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 核心数据表 -->
        <div class="data-table-section">
          <el-table
            :data="filteredData"
            style="width: 100%"
            height="100%"
            class="monitoring-table"
            v-loading="loading"
            :row-class-name="tableRowClassName"
          >
            <el-table-column prop="pointNumber" label="点位位号" width="120" />
            <el-table-column prop="pointName" label="监测点名称" min-width="150" />
            <el-table-column prop="equipment" label="关联设备" min-width="120" />
            <el-table-column prop="substance" label="监测物质" min-width="120" />
            <el-table-column prop="alarmStatus" label="报警状态" wmin-width="100">
              <template #default="scope">
                <span :class="{ 'alarm-highlight': isAlarmStatus(scope.row.alarmStatus) }">
                  {{ scope.row.alarmStatus }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="realTimeValue" label="实时值" min-width="100">
              <template #default="scope">
                <span :class="{ 'alarm-highlight': isAlarmStatus(scope.row.alarmStatus) }">
                  {{ scope.row.realTimeValue }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="collectionTime" label="采集时间" min-width="180" />
            <el-table-column prop="connectionStatus" label="连接状态" min-width="100">
              <template #default="scope">
                <div class="connection-status">
                  <span 
                    :class="['status-dot', { 'connected': scope.row.connectionStatus === '已连接', 'disconnected': scope.row.connectionStatus === '未连接' }]"
                  ></span>
                  {{ scope.row.connectionStatus }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleAnalyze(scope.row)">
                  分析
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// 定义一个变量，用来存储锁定时的顺序
const lockedOrderIds = ref<number[]>([])
const emit = defineEmits<{
  (e: 'analyze', row: any): void
}>()
// 处理锁定开关变化
const handleLockChange = (val: boolean) => {
  if (val) {
    // 【关键】: 在锁定开启的瞬间，马上把当前的 filteredData 顺序存下来
    // 此时 computed 还没有因为 locked=true 而重排，所以顺序还是对的（报警置顶）
    lockedOrderIds.value = filteredData.value.map(item => item.id)
  } else {
    // 解锁时清空
    lockedOrderIds.value = []
  }
}
// 搜索筛选
const filters = ref({
  pointNumber: '',
  pointName: '',
  equipment: '',
  substance: '',
  alarmStatus: '',
  connectionStatus: '',
  locked: false
})

// 组织架构树
const treeSearch = ref('')
const organizationTree = ref([
  {
    id: 'company1',
    label: '总公司',
    children: [
      {
        id: 'workshop1',
        label: '第一车间',
        children: [
          {
            id: 'unit1',
            label: '装置一'
          },
          {
            id: 'unit2',
            label: '装置二'
          }
        ]
      },
      {
        id: 'workshop2',
        label: '第二车间',
        children: [
          {
            id: 'unit3',
            label: '装置三'
          }
        ]
      }
    ]
  }
])

const treeProps = {
  children: 'children',
  label: 'label'
}

// 数据概览卡片
const overviewCards = ref([
  { key: 'connected', label: '已连接', value: 120, type: 'connected', color: '#52c41a', icon: 'Check' },
  { key: 'disconnected', label: '未连接', value: 8, type: 'disconnected', color: '#d9d9d9', icon: 'Close' },
  { key: 'lowlow', label: '低低报', value: 2, type: 'low', color: '#faad14', icon: 'Warning' },
  { key: 'low', label: '低报', value: 5, type: 'low', color: '#faad14', icon: 'Warning' },
  { key: 'high', label: '高报', value: 3, type: 'high', color: '#f5222d', icon: 'Warning' },
  { key: 'highhigh', label: '高高报', value: 1, type: 'high', color: '#f5222d', icon: 'Warning' }
])

// 模拟数据
const leafNodeIds = ['unit1', 'unit2', 'unit3']
const substances = ['温度', '压力', '液位', '流量', '浓度']
const units = ['℃', 'MPa', '%', 'm³/h', 'ppm']
const equipments = ['反应釜1', '反应釜2', '储罐1', '储罐2', '管道1', '管道2', '换热器1', '泵1']

// 生成模拟数据的函数
const generateMockData = () => {
  const data = []
  for (let i = 1; i <= 200; i++) {
    const substanceIndex = Math.floor(Math.random() * substances.length)
    const substance = substances[substanceIndex]
    const unit = units[substanceIndex]
    const baseValue = substance === '温度' ? 80 : 
                     substance === '压力' ? 1.0 :
                     substance === '液位' ? 50 :
                     substance === '流量' ? 10 : 100
    const realTimeValue = parseFloat((baseValue + (Math.random() - 0.5) * baseValue * 0.5).toFixed(1))
    
    let alarmStatus = '正常'
    if (substance === '温度' && realTimeValue > 100) {
      alarmStatus = '高报'
    } else if (substance === '温度' && realTimeValue < 10) {
      alarmStatus = '低报'
    } else if (substance === '压力' && realTimeValue > 2.0) {
      alarmStatus = '高报'
    } else if (substance === '压力' && realTimeValue < 0.2) {
      alarmStatus = '低报'
    } else if (substance === '液位' && realTimeValue > 90) {
      alarmStatus = '高高报'
    } else if (substance === '液位' && realTimeValue < 10) {
      alarmStatus = '低低报'
    } else if (substance === '流量' && realTimeValue > 20) {
      alarmStatus = '高报'
    } else if (substance === '流量' && realTimeValue < 2) {
      alarmStatus = '低报'
    } else if (substance === '浓度' && realTimeValue > 200) {
      alarmStatus = '高报'
    } else if (substance === '浓度' && realTimeValue < 20) {
      alarmStatus = '低报'
    }
    
    data.push({
      id: i,
      pointNumber: `${substance === '温度' ? 'T' : 
                     substance === '压力' ? 'P' :
                     substance === '液位' ? 'L' :
                     substance === '流量' ? 'F' : 'C'}T-${String(i).padStart(3, '0')}`,
      pointName: `${substance}监测点${i}`,
      equipment: equipments[Math.floor(Math.random() * equipments.length)],
      substance: substance,
      alarmStatus: alarmStatus,
      realTimeValue: realTimeValue,
      unit: unit,
      collectionTime: new Date().toLocaleString(),
      connectionStatus: Math.random() > 0.1 ? '已连接' : '未连接',
      nodeId: leafNodeIds[Math.floor(Math.random() * leafNodeIds.length)]
    })
  }
  
  // 强制报警保底机制
  const alarmTypes = ['高报', '低报', '高高报', '低低报']
  const normalData = data.filter(item => item.alarmStatus === '正常')
  const alarmData = data.filter(item => item.alarmStatus !== '正常')
  
  // 如果报警条数不足5条，强制补足
  if (alarmData.length < 5) {
    const neededAlarms = 5 - alarmData.length
    
    for (let i = 0; i < neededAlarms; i++) {
      if (normalData.length === 0) break
      
      // 随机选择一条正常数据
      const randomIndex = Math.floor(Math.random() * normalData.length)
      const targetItem = normalData[randomIndex]
      
      // 随机选择一个报警类型
      const alarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)]
      
      // 根据报警类型和物质类型修改数值
      if (targetItem.substance === '温度') {
        if (alarmType === '高报' || alarmType === '高高报') {
          targetItem.realTimeValue = parseFloat((100 + Math.random() * 20).toFixed(1))
        } else {
          targetItem.realTimeValue = parseFloat((Math.random() * 10).toFixed(1))
        }
      } else if (targetItem.substance === '压力') {
        if (alarmType === '高报' || alarmType === '高高报') {
          targetItem.realTimeValue = parseFloat((2.0 + Math.random() * 1).toFixed(2))
        } else {
          targetItem.realTimeValue = parseFloat((Math.random() * 0.2).toFixed(2))
        }
      } else if (targetItem.substance === '液位') {
        if (alarmType === '高高报') {
          targetItem.realTimeValue = parseFloat((90 + Math.random() * 10).toFixed(1))
        } else if (alarmType === '高报') {
          targetItem.realTimeValue = parseFloat((80 + Math.random() * 10).toFixed(1))
        } else if (alarmType === '低低报') {
          targetItem.realTimeValue = parseFloat((Math.random() * 10).toFixed(1))
        } else {
          targetItem.realTimeValue = parseFloat((10 + Math.random() * 10).toFixed(1))
        }
      } else if (targetItem.substance === '流量') {
        if (alarmType === '高报' || alarmType === '高高报') {
          targetItem.realTimeValue = parseFloat((20 + Math.random() * 10).toFixed(1))
        } else {
          targetItem.realTimeValue = parseFloat((Math.random() * 2).toFixed(1))
        }
      } else if (targetItem.substance === '浓度') {
        if (alarmType === '高报' || alarmType === '高高报') {
          targetItem.realTimeValue = parseFloat((200 + Math.random() * 50).toFixed(1))
        } else {
          targetItem.realTimeValue = parseFloat((Math.random() * 20).toFixed(1))
        }
      }
      
      // 更新报警状态
      targetItem.alarmStatus = alarmType
      
      // 从正常数据中移除
      normalData.splice(randomIndex, 1)
    }
  }
  
  return data
}

const mockData = ref(generateMockData())

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(200)
const loading = ref(false)

// 树结构筛选
const currentFilterNodeId = ref<string>('')

// 过滤方法
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}

// 计算过滤后的数据
const filteredData = computed(() => {
  let result = []
  
  if (!currentFilterNodeId.value || currentFilterNodeId.value === 'company1') {
    // 如果未选中节点或选中根节点，显示所有数据
    result = [...mockData.value]
  } else if (leafNodeIds.includes(currentFilterNodeId.value)) {
    // 如果选中叶子节点，仅显示对应的数据
    result = mockData.value.filter(item => item.nodeId === currentFilterNodeId.value)
  } else {
    // 如果选中父节点，显示其下所有子节点的数据
    const childNodeIds = getAllChildNodeIds(currentFilterNodeId.value)
    result = mockData.value.filter(item => childNodeIds.includes(item.nodeId))
  }
  
  // 排序逻辑
  if (!filters.value.locked) {
    // 未锁定时：报警置顶排序
    result.sort((a, b) => {
      // 第一优先级：报警状态
      const aIsAlarm = a.alarmStatus !== '正常'
      const bIsAlarm = b.alarmStatus !== '正常'
      if (aIsAlarm && !bIsAlarm) return -1
      if (!aIsAlarm && bIsAlarm) return 1
      // 第二优先级：id（保持同类数据的内部顺序稳定）
      return a.id - b.id
    })
  } else {
    // 锁定时：仅按id排序（保持顺序稳定）
    result.sort((a, b) => a.id - b.id)
  }
  
  return result
})

// 方法
const handleSearch = () => {
  console.log('搜索条件:', filters.value)
  // 这里实现搜索逻辑
}

const handleNodeClick = (data: any) => {
  console.log('点击节点:', data)
  currentFilterNodeId.value = data.id
}

// 获取节点下所有子节点ID的函数
const getAllChildNodeIds = (nodeId: string): string[] => {
  const result: string[] = []
  
  const findChildren = (nodes: any[], parentId: string) => {
    for (const node of nodes) {
      if (node.id === parentId && node.children) {
        for (const child of node.children) {
          result.push(child.id)
          if (child.children) {
            findChildren(child.children, child.id)
          }
        }
        break
      }
      if (node.children) {
        findChildren(node.children, parentId)
      }
    }
  }
  
  findChildren(organizationTree.value, nodeId)
  return result
}

const handleCardClick = (key: string) => {
  console.log('点击卡片:', key)
  // 这里实现卡片点击筛选逻辑
}

const handleAnalyze = (row: any) => {
  console.log('分析:', row)
  emit('analyze', row)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
}

const handleCurrentChange = (current: number) => {
  currentPage.value = current
}

const isAlarmStatus = (status: string) => {
  return ['高报', '高高报', '低报', '低低报'].includes(status)
}

const tableRowClassName = ({ row }: { row: any }) => {
  if (row.alarmStatus !== '正常') {
    return 'alarm-row-danger'
  }
  return ''
}

// 模拟实时数据更新
onMounted(() => {
  setInterval(() => {
    if (!filters.value.locked) {
      // 模拟数据更新
      mockData.value.forEach(item => {
        // 随机微调realTimeValue（波动范围 +/- 5%）
        const 波动范围 = item.realTimeValue * 0.05
        item.realTimeValue = parseFloat((item.realTimeValue + (Math.random() - 0.5) * 波动范围 * 2).toFixed(1))
        item.collectionTime = new Date().toLocaleString()
        
        // 动态报警逻辑
        let alarmStatus = '正常'
        if (item.substance === '温度' && item.realTimeValue > 100) {
          alarmStatus = '高报'
        } else if (item.substance === '温度' && item.realTimeValue < 10) {
          alarmStatus = '低报'
        } else if (item.substance === '压力' && item.realTimeValue > 2.0) {
          alarmStatus = '高报'
        } else if (item.substance === '压力' && item.realTimeValue < 0.2) {
          alarmStatus = '低报'
        } else if (item.substance === '液位' && item.realTimeValue > 90) {
          alarmStatus = '高高报'
        } else if (item.substance === '液位' && item.realTimeValue < 10) {
          alarmStatus = '低低报'
        } else if (item.substance === '流量' && item.realTimeValue > 20) {
          alarmStatus = '高报'
        } else if (item.substance === '流量' && item.realTimeValue < 2) {
          alarmStatus = '低报'
        } else if (item.substance === '浓度' && item.realTimeValue > 200) {
          alarmStatus = '高报'
        } else if (item.substance === '浓度' && item.realTimeValue < 20) {
          alarmStatus = '低报'
        }
        item.alarmStatus = alarmStatus
      })
    }
  }, 1000)
})
</script>

<style scoped>
.realtime-monitoring {
  padding: 8px;
  background: #f5f7fa;
  min-height: 100vh;
}

.search-filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-form {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-input,
.filter-select {
  width: 180px;
}

.lock-switch {
  margin-left: 16px;
}

.main-content-area {
  display: flex;
  gap: 20px;
  height: calc(100vh - 250px);
}

.organization-tree {
  width: 280px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tree-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
}

.data-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

.data-table-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.monitoring-table {
  flex: 1;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e8e8e8;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.status-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.status-card:hover {
  transform: translateY(-2px);
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.status-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--status-color, #1890ff);
}

.card-content {
  position: relative;
  padding: 20px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
  color: #262626;
  font-family: 'Roboto', 'DIN', sans-serif;
  line-height: 1;
}

.card-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  opacity: 0.1;
}

.card-icon el-icon {
  font-size: 48px;
  color: var(--status-color, #1890ff);
}

.data-table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.monitoring-table {
  margin-bottom: 20px;
}

.alarm-highlight {
  color: #f56c6c;
  font-weight: bold;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d9d9d9;
}

.status-dot.connected {
  background: #67c23a;
}

.status-dot.disconnected {
  background: #d9d9d9;
}

/* 报警行样式 - 使用 :deep() 穿透 scoped 限制 */
:deep(.el-table .alarm-row-danger) {
  --el-table-tr-bg-color: #ffffff !important; /* 修改背景变量 */
  color: #f56c6c !important; /* 强制修改文字颜色 */
  font-weight: bold;
}

/* 强制修改单元格内的文字颜色（防止被 Element 默认样式覆盖） */
:deep(.el-table .alarm-row-danger td.el-table__cell) {
  color: #f56c6c !important;
}

/* 修复悬停时的背景色 */
:deep(.el-table .alarm-row-danger:hover > td.el-table__cell) {
  background-color: #fde2e2 !important;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 响应式调整 */
@media (max-width: 1400px) {
  .overview-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content-area {
    flex-direction: column;
  }

  .organization-tree {
    width: 100%;
    margin-bottom: 20px;
  }

  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
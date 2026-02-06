<template>
  <div class="alarm-shielding">
    <!-- 整体布局 -->
    <div class="layout-container">
      <!-- 左侧组织树 -->
      <div class="left-panel">
        <div class="tree-header">
          <h3>组织架构</h3>
          <el-input
            v-model="treeSearchQuery"
            placeholder="搜索节点"
            clearable
            size="small"
            prefix-icon="Search"
            class="tree-search"
          />
        </div>
        <el-tree
          v-model="selectedOrgNode"
          :data="orgTreeData"
          :props="treeProps"
          :filter-node-method="filterNode"
          default-expand-all
          node-key="id"
          @node-click="handleNodeClick"
          class="org-tree"
        >
          <template #default="{ node, data }">
            <span class="tree-node-label">{{ data.label }}</span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧内容区 -->
      <div class="right-panel">
        <!-- 数据概览 -->
        <div class="stats-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-card total" @click="resetFilter">
                <div class="stat-icon"><el-icon><Monitor /></el-icon></div>
                <div class="stat-info">
                  <div class="stat-label">总点位</div>
                  <div class="stat-num">{{ filteredStats.total }}</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card normal" @click="filterByStatus('normal')">
                <div class="stat-icon"><el-icon><CircleCheckFilled /></el-icon></div>
                <div class="stat-info">
                  <div class="stat-label">正常</div>
                  <div class="stat-num">{{ filteredStats.normal }}</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card shielded" @click="filterByStatus('shielded')">
                <div class="stat-icon"><el-icon><WarningFilled /></el-icon></div>
                <div class="stat-info">
                  <div class="stat-label">已屏蔽</div>
                  <div class="stat-num">{{ filteredStats.shielded }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 搜索筛选 -->
        <div class="search-section">
          <div class="search-toolbar">
            <div class="search-items">
              <el-input 
                v-model="searchForm.pointName" 
                placeholder="监测点名称"
                :prefix-icon="Search"
                clearable
                class="search-input"
              />
              
              <el-input 
                v-model="searchForm.pointId" 
                placeholder="监测点位号"
                :prefix-icon="Search"
                clearable
                class="search-input"
              />
              
              <el-input 
                v-model="searchForm.department" 
                placeholder="责任部门"
                :prefix-icon="Search"
                clearable
                class="search-input"
              />
              
              <el-input 
                v-model="searchForm.responsible" 
                placeholder="责任人"
                :prefix-icon="Search"
                clearable
                class="search-input"
              />
              
              <el-select 
                v-model="searchForm.status" 
                placeholder="状态" 
                clearable
                class="search-input"
              >
                <el-option label="全部" value="" />
                <el-option label="正常" value="normal" />
                <el-option label="屏蔽中" value="shielded" />
              </el-select>
            </div>
            
            <div class="action-buttons">
              <el-button type="primary" @click="handleSearch" class="search-btn">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearch" class="reset-btn">
                重置
              </el-button>
            </div>
          </div>
        </div>

        <!-- 核心列表 -->
        <div class="table-section">
          <el-table
            :data="paginatedPoints"
            style="width: 100%"
            border
          >
            <el-table-column type="index" label="序号" width="80" align="center" />
            <el-table-column prop="name" label="监测点名称" min-width="150" align="center"/>
            <el-table-column prop="id" label="点位位号" min-width="120" align="center"/>
            <el-table-column prop="process" label="所属工序" min-width="100" align="center"/>
            <el-table-column prop="department" label="责任部门" min-width="120" align="center"/>
            <el-table-column prop="responsible" label="责任人" min-width="100" align="center"/>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="scope">
                <span :class="['status-text', scope.row.status]">
                  {{ scope.row.status === 'normal' ? '正常' : '屏蔽中' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right" align="center">
              <template #default="scope">
                <el-button
                  v-if="scope.row.status === 'normal'"
                  type="primary"
                  size="small"
                  @click="openShieldDialog(scope.row)"
                  style="margin-right: 6px"
                >
                  屏蔽
                </el-button>
                <el-button
                  v-else
                  type="primary"
                  size="small"
                  @click="openUnshieldDialog(scope.row)"
                  style="margin-right: 6px"
                >
                  恢复
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="openOperationLogDialog(scope.row)"
                >
                  操作记录
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
              :total="filteredPoints.length"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 屏蔽确认弹窗 -->
    <el-dialog
      v-model="shieldDialogVisible"
      title="屏蔽确认"
      width="500px"
      append-to-body
    >
      <el-form :model="shieldForm" :rules="shieldRules" ref="shieldFormRef" label-width="120px">
        <el-form-item label="屏蔽原因" prop="reason">
          <el-select v-model="shieldForm.reason" placeholder="请选择" style="width: 100%">
            <el-option label="设备维护" value="设备维护" />
            <el-option label="传感器故障" value="传感器故障" />
            <el-option label="工艺调整" value="工艺调整" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计恢复时间">
          <el-date-picker
            v-model="shieldForm.expectedRestoreTime"
            type="datetime"
            placeholder="请选择"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="shieldForm.remark"
            type="textarea"
            placeholder="请输入备注"
            rows="3"
          />
        </el-form-item>
        <el-alert
          title="风险提示：屏蔽后将不再接收该点位的报警通知"
          type="warning"
          :closable="false"
          show-icon
          class="risk-alert"
        />
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="shieldDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmShield">确认屏蔽</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 解除屏蔽确认弹窗 -->
    <el-dialog
      v-model="unshieldDialogVisible"
      title="解除屏蔽"
      width="500px"
      append-to-body
    >
      <el-form :model="unshieldForm" :rules="unshieldRules" ref="unshieldFormRef" label-width="120px">
        <el-form-item label="解除原因" prop="reason">
          <el-input
            v-model="unshieldForm.reason"
            type="textarea"
            placeholder="请输入解除原因"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="unshieldDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUnshield">确认解除</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 操作记录弹窗 -->
    <el-dialog
      v-model="operationLogDialogVisible"
      title="操作记录"
      width="800px"
      append-to-body
    >
      <el-table
        :data="currentPointLogs"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="timestamp" label="操作时间" min-width="180" />
        <el-table-column prop="operationType" label="操作类型" width="100">
          <template #default="scope">
            <span>{{ scope.row.operationType === 'shield' ? '屏蔽' : '恢复' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" min-width="100" />
        <el-table-column prop="reason" label="操作原因" min-width="150" />
        <el-table-column prop="remark" label="备注" min-width="200" />
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="operationLogDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Monitor, CircleCheckFilled, WarningFilled } from '@element-plus/icons-vue'

// 组织树数据
const orgTreeData = ref([
  {
    id: 'company',
    label: '总公司',
    children: [
      {
        id: 'workshop1',
        label: '一车间',
        children: [
          {
            id: 'unit1-1',
            label: '1#装置'
          },
          {
            id: 'unit1-2',
            label: '2#装置'
          }
        ]
      },
      {
        id: 'workshop2',
        label: '二车间',
        children: [
          {
            id: 'unit2-1',
            label: '3#装置'
          },
          {
            id: 'unit2-2',
            label: '4#装置'
          }
        ]
      }
    ]
  }
])

// 树形控件配置
const treeProps = {
  children: 'children',
  label: 'label'
}

// 组织树搜索
const treeSearchQuery = ref('')
const selectedOrgNode = ref(['company'])

// 过滤节点方法
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

// 处理节点点击
const handleNodeClick = (data) => {
  selectedOrgNode.value = [data.id]
  // 这里可以根据选中的节点筛选数据
  console.log('选中节点:', data.id)
}

// 点位数据
const pointsData = ref([
  {
    id: 'TIC-101',
    name: '反应釜温度',
    process: '化学反应',
    department: '一车间',
    responsible: '张三',
    status: 'normal',
    orgId: 'unit1-1'
  },
  {
    id: 'PIC-102',
    name: '反应釜压力',
    process: '化学反应',
    department: '一车间',
    responsible: '李四',
    status: 'shielded',
    orgId: 'unit1-1'
  },
  {
    id: 'FIC-103',
    name: '进料流量',
    process: '原料处理',
    department: '一车间',
    responsible: '王五',
    status: 'normal',
    orgId: 'unit1-2'
  },
  {
    id: 'LIC-104',
    name: '液位',
    process: '化学反应',
    department: '二车间',
    responsible: '赵六',
    status: 'normal',
    orgId: 'unit2-1'
  },
  {
    id: 'AIC-105',
    name: '氧气含量',
    process: '产品精制',
    department: '二车间',
    responsible: '孙七',
    status: 'shielded',
    orgId: 'unit2-2'
  },
  {
    id: 'TIC-201',
    name: '精馏塔温度',
    process: '产品精制',
    department: '二车间',
    responsible: '周八',
    status: 'normal',
    orgId: 'unit2-1'
  },
  {
    id: 'PIC-202',
    name: '精馏塔压力',
    process: '产品精制',
    department: '二车间',
    responsible: '吴九',
    status: 'normal',
    orgId: 'unit2-1'
  },
  {
    id: 'FIC-203',
    name: '回流流量',
    process: '产品精制',
    department: '二车间',
    responsible: '郑十',
    status: 'shielded',
    orgId: 'unit2-2'
  }
])

// 操作日志数据
const operationLogs = ref([
  {
    pointId: 'PIC-102',
    timestamp: '2026-02-05 14:30:00',
    operationType: 'shield',
    operator: '张三',
    reason: '设备维护',
    remark: '定期维护'
  },
  {
    pointId: 'AIC-105',
    timestamp: '2026-02-04 10:15:00',
    operationType: 'shield',
    operator: '李四',
    reason: '传感器故障',
    remark: '传感器需要更换'
  },
  {
    pointId: 'FIC-203',
    timestamp: '2026-02-03 09:45:00',
    operationType: 'shield',
    operator: '王五',
    reason: '工艺调整',
    remark: '临时工艺调整'
  }
])

// 搜索表单
const searchForm = ref({
  pointName: '',
  pointId: '',
  department: '',
  responsible: '',
  status: ''
})

// 筛选后的点位数据
const filteredPoints = computed(() => {
  return pointsData.value.filter(point => {
    // 组织节点筛选
    const orgMatch = true // 简化处理，实际需要根据组织节点关系筛选
    
    // 搜索条件筛选
    const nameMatch = !searchForm.value.pointName || point.name.toLowerCase().includes(searchForm.value.pointName.toLowerCase())
    const idMatch = !searchForm.value.pointId || point.id.toLowerCase().includes(searchForm.value.pointId.toLowerCase())
    const deptMatch = !searchForm.value.department || point.department.toLowerCase().includes(searchForm.value.department.toLowerCase())
    const respMatch = !searchForm.value.responsible || point.responsible.toLowerCase().includes(searchForm.value.responsible.toLowerCase())
    const statusMatch = !searchForm.value.status || point.status === searchForm.value.status
    
    return orgMatch && nameMatch && idMatch && deptMatch && respMatch && statusMatch
  })
})

// 统计数据
const filteredStats = computed(() => {
  const total = filteredPoints.value.length
  const normal = filteredPoints.value.filter(p => p.status === 'normal').length
  const shielded = filteredPoints.value.filter(p => p.status === 'shielded').length
  
  return {
    total,
    normal,
    shielded
  }
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)

const paginatedPoints = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPoints.value.slice(start, end)
})

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

const resetSearch = () => {
  searchForm.value = {
    pointName: '',
    pointId: '',
    department: '',
    responsible: '',
    status: ''
  }
  currentPage.value = 1
}

// 状态筛选
const filterByStatus = (status) => {
  searchForm.value.status = status
  currentPage.value = 1
}

// 重置筛选
const resetFilter = () => {
  searchForm.value.status = ''
  currentPage.value = 1
}

// 屏蔽弹窗
const shieldDialogVisible = ref(false)
const shieldForm = ref({
  reason: '',
  expectedRestoreTime: '',
  remark: ''
})

const shieldRules = {
  reason: [{ required: true, message: '请选择屏蔽原因', trigger: 'change' }]
}

const shieldFormRef = ref(null)
const currentShieldPoint = ref(null)

const openShieldDialog = (point) => {
  currentShieldPoint.value = point
  shieldForm.value = {
    reason: '',
    expectedRestoreTime: '',
    remark: ''
  }
  shieldDialogVisible.value = true
}

const confirmShield = () => {
  if (shieldFormRef.value) {
    shieldFormRef.value.validate((valid) => {
      if (valid) {
        // 更新点位状态
        currentShieldPoint.value.status = 'shielded'
        
        // 记录操作日志
        operationLogs.value.push({
          pointId: currentShieldPoint.value.id,
          timestamp: new Date().toLocaleString('zh-CN'),
          operationType: 'shield',
          operator: '当前用户',
          reason: shieldForm.value.reason,
          remark: shieldForm.value.remark
        })
        
        shieldDialogVisible.value = false
      }
    })
  }
}

// 解除屏蔽弹窗
const unshieldDialogVisible = ref(false)
const unshieldForm = ref({
  reason: ''
})

const unshieldRules = {
  reason: [{ required: true, message: '请输入解除原因', trigger: 'blur' }]
}

const unshieldFormRef = ref(null)
const currentUnshieldPoint = ref(null)

const openUnshieldDialog = (point) => {
  currentUnshieldPoint.value = point
  unshieldForm.value = {
    reason: ''
  }
  unshieldDialogVisible.value = true
}

const confirmUnshield = () => {
  if (unshieldFormRef.value) {
    unshieldFormRef.value.validate((valid) => {
      if (valid) {
        // 更新点位状态
        currentUnshieldPoint.value.status = 'normal'
        
        // 记录操作日志
        operationLogs.value.push({
          pointId: currentUnshieldPoint.value.id,
          timestamp: new Date().toLocaleString('zh-CN'),
          operationType: 'unshield',
          operator: '当前用户',
          reason: unshieldForm.value.reason,
          remark: ''
        })
        
        unshieldDialogVisible.value = false
      }
    })
  }
}

// 操作记录弹窗
const operationLogDialogVisible = ref(false)
const currentPointLogs = ref([])

const openOperationLogDialog = (point) => {
  // 获取该点位的操作日志
  currentPointLogs.value = operationLogs.value
    .filter(log => log.pointId === point.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  
  operationLogDialogVisible.value = true
}

onMounted(() => {
  // 初始化数据
  console.log('AlarmShielding component mounted')
})
</script>

<style scoped>
.alarm-shielding {
  padding: 24px;
  background: #F5F7FA;
  min-height: 100vh;
}

/* 整体布局 */
.layout-container {
  display: flex;
  gap: 20px;
}

/* 左侧面板 */
.left-panel {
  width: 280px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  overflow: hidden;
}

.tree-header {
  padding: 16px;
  border-bottom: 1px solid #EBEEF5;
}

.tree-header h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.tree-search {
  width: 100%;
}

.org-tree {
  height: calc(100vh - 200px);
  overflow-y: auto;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  min-width: 0;
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  font-family: 'DIN Alternate', sans-serif;
}

/* 统计卡片配色 */
.stat-card.total .stat-icon {
  background: #E6F7FF;
  color: #409EFF;
}

.stat-card.normal .stat-icon {
  background: #F0F9EB;
  color: #67C23A;
}

.stat-card.shielded .stat-icon {
  background: #FEF0F0;
  color: #F56C6C;
}

/* 搜索区域 */
.search-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  margin-bottom: 16px;
}

.search-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 15px;
}

.search-items {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 180px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.search-btn {
  margin-right: 10px;
}

/* 表格区域 */
.table-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

/* 状态文本样式 */
.status-text {
  font-weight: 500;
}

.status-text.normal {
  color: #303133;
}

.status-text.shielded {
  color: #F56C6C;
  font-weight: 600;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 弹窗样式 */
.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.risk-alert {
  margin-top: 16px;
}

/* 确保弹窗在最顶层 */
.el-dialog {
  z-index: 2002 !important;
}

.el-dialog__wrapper {
  z-index: 2001 !important;
}

/* 组织树样式 */
.el-tree-node.is-current > .el-tree-node__content {
  background-color: #ECF5FF;
}

.el-tree-node__content {
  height: 36px;
}

.tree-node-label {
  font-size: 14px;
}

/* 统一固定列表头背景色 */
:deep(.el-table th.el-table__cell.is-right-fixed) {
  background-color: #F5F7FA !important;
}
</style>
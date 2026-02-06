<template>
  <div class="equipment-monitoring">
    <div class="stats-dashboard">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card total">
            <div class="stat-icon"><el-icon><Monitor /></el-icon></div>
            <div class="stat-info">
              <div class="stat-label">设备总数</div>
              <div class="stat-num">{{ stats.total }} <span class="unit">台</span></div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card normal">
            <div class="stat-icon"><el-icon><CircleCheckFilled /></el-icon></div>
            <div class="stat-info">
              <div class="stat-label">正常运行</div>
              <div class="stat-num">{{ stats.normal }} <span class="unit">台</span></div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card alarm">
            <div class="stat-icon"><el-icon><WarningFilled /></el-icon></div>
            <div class="stat-info">
              <div class="stat-label">异常报警</div>
              <div class="stat-num">{{ stats.alarm }} <span class="unit">台</span></div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card offline">
            <div class="stat-icon"><el-icon><RemoveFilled /></el-icon></div>
            <div class="stat-info">
              <div class="stat-label">离线设备</div>
              <div class="stat-num">{{ stats.offline }} <span class="unit">台</span></div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="page-toolbar">
      <div class="left-panel">
        <span class="last-update">数据实时同步中 <el-icon class="is-loading"><Loading /></el-icon></span>
      </div>
      <div class="right-panel">
        <el-input
          v-model="searchQuery"
          placeholder="搜索设备名称/位号"
          class="search-input"
          prefix-icon="Search"
          clearable
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" class="status-select" clearable>
          <el-option label="正常" value="normal" />
          <el-option label="报警" value="alarm" />
          <el-option label="离线" value="offline" />
        </el-select>
        <el-button type="primary" @click.stop="openAddDialog">
          <el-icon><Plus /></el-icon> 新增设备
        </el-button>
      </div>
    </div>
    
    <div class="equipment-grid">
      <EquipmentCard 
        v-for="item in filteredEquipmentList" 
        :key="item.id"
        v-bind="item"
      />
    </div>

    <!-- 新增设备弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增设备"
      width="800px"
      append-to-body
    >
      <el-form :model="equipmentForm" :rules="rules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="equipmentForm.name" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备位号" prop="id">
              <el-input v-model="equipmentForm.id" placeholder="请输入设备位号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属工序" prop="process">
              <el-select v-model="equipmentForm.process" placeholder="请选择所属工序" style="width: 100%;">
                <el-option label="原料处理" value="原料处理" />
                <el-option label="化学反应" value="化学反应" />
                <el-option label="产品精制" value="产品精制" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属单位" prop="unit">
              <el-select v-model="equipmentForm.unit" placeholder="请选择所属单位" style="width: 100%;">
                <el-option label="一车间" value="一车间" />
                <el-option label="二车间" value="二车间" />
                <el-option label="公用工程" value="公用工程" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备类型" prop="type">
              <el-select v-model="equipmentForm.type" placeholder="请选择设备类型" style="width: 100%;">
                <el-option label="容器" value="容器" />
                <el-option label="泵机" value="泵机" />
                <el-option label="塔器" value="塔器" />
                <el-option label="换热器" value="换热器" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="照片上传">
              <el-upload
                class="upload-demo"
                action="#"
                :auto-upload="false"
                :on-change="handleImageChange"
                :limit="1"
                list-type="picture-card"
              >
                <el-icon><Plus /></el-icon>
                <template #file-list>
                  <div v-if="equipmentForm.imageUrl" class="el-upload-list__item is-success">
                    <img :src="equipmentForm.imageUrl" alt="" class="el-upload-list__item-thumbnail" />
                    <span class="el-upload-list__item-actions">
                      <span class="el-upload-list__item-preview" @click="previewImage"></span>
                      <span class="el-upload-list__item-delete" @click="removeImage"></span>
                    </span>
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="关联点位">
              <el-button type="text" @click="openPointDialog">关联点位</el-button>
              <el-table :data="selectedPoints" style="width: 100%; margin-top: 10px">
                <el-table-column type="index" label="序号" width="80" />
                <el-table-column prop="name" label="监测点名称" />
                <el-table-column prop="id" label="监测点位号" />
                <el-table-column prop="type" label="监测类型" />
                <el-table-column prop="unit" label="单位" />
                <el-table-column prop="status" label="在线状态">
                  <template #default="scope">
                    <span :class="['status-tag', scope.row.status]">{{ scope.row.status === 'online' ? '在线' : '离线' }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="scope">
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removePoint(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEquipment">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 关联点位选择弹窗 -->
    <el-dialog
      v-model="pointDialogVisible"
      title="选择关联点位"
      width="800px"
      append-to-body
    >
      <el-table :data="availablePoints" style="width: 100%">
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="name" label="监测点名称" />
        <el-table-column prop="id" label="监测点位号" />
        <el-table-column prop="type" label="监测类型" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="status" label="在线状态">
          <template #default="scope">
            <span :class="['status-tag', scope.row.status]">{{ scope.row.status === 'online' ? '在线' : '离线' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="selectPoint(scope.row)"
              :disabled="isPointSelected(scope.row.id)"
            >
              {{ isPointSelected(scope.row.id) ? '已选' : '选择' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="pointDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSelectedPoints">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Plus, Search, Monitor, CircleCheckFilled, WarningFilled, RemoveFilled, Loading } from '@element-plus/icons-vue'
import EquipmentCard from './EquipmentCard.vue'

// 图片处理
const getImageUrl = (name) => new URL(`../assets/${name}`, import.meta.url).href

// 核心数据
const equipmentList = ref([
  {
    id: 'XV-18767',
    name: '反应精馏储罐',
    status: 'normal',
    data: [
      { label: '1#反应器温度', value: '32.0°C' },
      { label: '1#塔顶压力', value: '182.5Mpa' },
      { label: '2#反应器温度', value: '31.5°C' },
      { label: '2#塔顶压力', value: '181.2Mpa' }
    ],
    imageUrl: getImageUrl('aniya111.png')
  },
  {
    id: 'P-201',
    name: '循环水泵',
    status: 'alarm',
    data: [
      { label: '出口压力', value: '4.5MPa' },
      { label: '电机温度', value: '85.0°C' }, // 这里的温度过高，稍后模拟会让它变红
      { label: '流量', value: '120m³/h' },
      { label: '振动值', value: '4.2mm/s' }
    ],
    imageUrl: getImageUrl('wallhaven-7j9q1y.jpg')
  },
  {
    id: 'T-302',
    name: '精馏塔',
    status: 'normal',
    data: [
      { label: '塔顶温度', value: '78.0°C' },
      { label: '塔底温度', value: '120.0°C' },
      { label: '塔顶压力', value: '0.8MPa' },
      { label: '回流比', value: '3:1' }
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=distillation&image_size=square'
  },
  {
    id: 'E-401',
    name: '换热器',
    status: 'offline',
    data: [
      { label: '壳程入温', value: 'N/A' },
      { label: '壳程出温', value: 'N/A' },
      { label: '管程入温', value: 'N/A' },
      { label: '管程出温', value: 'N/A' }
    ],
    imageUrl: ''
  }
])

// --- 1. 统计计算逻辑 ---
const stats = computed(() => {
  const list = equipmentList.value
  return {
    total: list.length,
    normal: list.filter(i => i.status === 'normal').length,
    alarm: list.filter(i => i.status === 'alarm').length,
    offline: list.filter(i => i.status === 'offline').length
  }
})

// --- 2. 实时数据模拟引擎 ---
let timer = null

const startSimulation = () => {
  timer = setInterval(() => {
    equipmentList.value.forEach(device => {
      // 离线设备不更新
      if (device.status === 'offline') return

      device.data.forEach((item, index) => {
        // 使用正则提取数值和单位： "32.5°C" -> num=32.5, unit="°C"
        const match = item.value.match(/([\d\.]+)(.*)/)
        
        if (match) {
          let num = parseFloat(match[1])
          const unit = match[2]
          
          // 基础波动：随机加减 0.1~0.5
          const fluctuation = (Math.random() - 0.5)
          num += fluctuation

          // --- 报警逻辑 ---
          // 如果设备状态是 alarm，我们强制让第2个参数(索引1)变成红色，并模拟高数值
          if (device.status === 'alarm' && index === 1) { // 假设第2个参数报警
            item.isAlarm = true // 标记报警
            num = 95 + Math.random() * 5 // 模拟一个很高的异常值
          } else {
            item.isAlarm = false
          }

          // 重新组合，保留1位小数
          item.value = num.toFixed(1) + unit
        }
      })
    })
  }, 1000) // 每1秒刷新一次
}

// 生命周期
onMounted(() => {
  startSimulation()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 筛选逻辑
const searchQuery = ref('')
const statusFilter = ref('')
const filteredEquipmentList = computed(() => {
  let filtered = equipmentList.value
  if (statusFilter.value) filtered = filtered.filter(item => item.status === statusFilter.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q))
  }
  return filtered
})

// 弹窗状态
const addDialogVisible = ref(false)
const openAddDialog = () => {
  console.log('打开新增设备弹窗')
  addDialogVisible.value = true
}

// 表单引用
const formRef = ref(null)

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' }
  ],
  id: [
    { required: true, message: '请输入设备位号', trigger: 'blur' }
  ],
  process: [
    { required: true, message: '请选择所属工序', trigger: 'change' }
  ],
  unit: [
    { required: true, message: '请选择所属单位', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ]
}

// 设备表单数据
const equipmentForm = ref({
  name: '',
  id: '',
  process: '',
  unit: '',
  type: '',
  imageUrl: ''
})

// 关联点位数据
const selectedPoints = ref([])
const availablePoints = ref([
  {
    id: 'TIC-101',
    name: '反应釜温度',
    type: '温度',
    unit: '°C',
    status: 'online'
  },
  {
    id: 'PIC-102',
    name: '反应釜压力',
    type: '压力',
    unit: 'MPa',
    status: 'online'
  },
  {
    id: 'FIC-103',
    name: '进料流量',
    type: '流量',
    unit: 'm³/h',
    status: 'online'
  },
  {
    id: 'LIC-104',
    name: '液位',
    type: '液位',
    unit: '%',
    status: 'offline'
  },
  {
    id: 'AIC-105',
    name: '氧气含量',
    type: '分析',
    unit: '%',
    status: 'online'
  }
])

// 弹窗状态
const pointDialogVisible = ref(false)

// 打开关联点位选择弹窗
const openPointDialog = () => {
  pointDialogVisible.value = true
}

// 处理图片上传
const handleImageChange = (file) => {
  if (file && file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      equipmentForm.value.imageUrl = e.target.result
    }
    reader.readAsDataURL(file.raw)
  }
}

// 预览图片
const previewImage = () => {
  console.log('预览图片:', equipmentForm.value.imageUrl)
}

// 删除图片
const removeImage = () => {
  equipmentForm.value.imageUrl = ''
}

// 选择关联点位
const selectPoint = (point) => {
  if (!isPointSelected(point.id)) {
    selectedPoints.value.push({ ...point })
  }
}

// 移除关联点位
const removePoint = (point) => {
  const index = selectedPoints.value.findIndex(p => p.id === point.id)
  if (index > -1) {
    selectedPoints.value.splice(index, 1)
  }
}

// 检查点位是否已选择
const isPointSelected = (pointId) => {
  return selectedPoints.value.some(p => p.id === pointId)
}

// 保存选择的关联点位
const saveSelectedPoints = () => {
  pointDialogVisible.value = false
}

// 保存设备
const saveEquipment = () => {
  if (formRef.value) {
    formRef.value.validate((valid) => {
      if (valid) {
        console.log('保存设备:', equipmentForm.value)
        console.log('关联点位:', selectedPoints.value)
        
        // 先创建新设备对象
        const newEquipment = {
          id: equipmentForm.value.id,
          name: equipmentForm.value.name,
          status: 'normal',
          data: selectedPoints.value.map(point => ({
            label: point.name,
            value: '0' + point.unit
          })),
          imageUrl: equipmentForm.value.imageUrl || ''
        }
        
        // 添加到设备列表
        equipmentList.value.push(newEquipment)
        
        // 重置表单
        equipmentForm.value = {
          name: '',
          id: '',
          process: '',
          unit: '',
          type: '',
          imageUrl: ''
        }
        selectedPoints.value = []
        
        // 关闭弹窗
        addDialogVisible.value = false
      } else {
        console.log('表单验证失败')
        return false
      }
    })
  }
}
</script>

<style scoped>
.equipment-monitoring {
  padding: 24px;
  background: #F5F7FA;
  min-height: 100vh;
}

/* 统计卡片样式 */
.stats-dashboard { margin-bottom: 24px; }
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s;
  border: 1px solid #EBEEF5;
}
.stat-card:hover { transform: translateY(-2px); }
.stat-icon {
  width: 48px; height: 48px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}
.stat-info { display: flex; flex-direction: column; }
.stat-label { font-size: 14px; color: #909399; margin-bottom: 4px; }
.stat-num { font-size: 24px; font-weight: 700; color: #303133; font-family: 'DIN Alternate', sans-serif; }
.unit { font-size: 12px; font-weight: 400; color: #909399; margin-left: 4px; }

/* 统计卡片配色 */
.stat-card.total .stat-icon { background: #E6F7FF; color: #409EFF; }
.stat-card.normal .stat-icon { background: #F0F9EB; color: #67C23A; }
.stat-card.alarm .stat-icon { background: #FEF0F0; color: #F56C6C; }
.stat-card.offline .stat-icon { background: #F4F4F5; color: #909399; }

/* 工具栏 */
.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.last-update { font-size: 13px; color: #909399; display: flex; align-items: center; gap: 4px; }
.right-panel { display: flex; gap: 12px; }
.search-input { width: 220px; }
.status-select { width: 120px; }

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

/* 状态标签样式 */
.status-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.online {
  background: rgba(103, 194, 58, 0.2);
  color: #67C23A;
}

.status-tag.offline {
  background: rgba(144, 147, 153, 0.2);
  color: #909399;
}

/* 弹窗样式 */
.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 确保弹窗在最顶层 */
.el-dialog {
  z-index: 2002 !important;
}

.el-dialog__wrapper {
  z-index: 2001 !important;
}
</style>
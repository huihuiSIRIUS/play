<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Location, User, Plus, Download, Upload, Edit, Delete, Setting, UserFilled, EditPen } from '@element-plus/icons-vue'

interface ProcessPoint {
  id: number
  name: string
  pointCode: string
  opcCode: string
  type: string
  unit: string
  substance: string
  rangeMin: number
  rangeMax: number
  alarmType: string
  valueType: string
  location: string
  alarmConfig: string
  process: string
  department: string
  person: string
}

const mockData: ProcessPoint[] = []

// 生成 100 组随机数据
for (let i = 1; i <= 100; i++) {
  const types = ['温度', '压力', '流量', '液位']
  const departments = ['生产部', '设备部', '技术部', '安全部']
  const persons = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  const substances = ['水', '蒸汽', '空气', '油', '天然气']
  const locations = ['一号车间', '二号车间', '三号车间', '四号车间', '五号车间']
  const processes = ['预处理', '反应', '分离', '精制', '包装', '储存']
  
  const type = types[Math.floor(Math.random() * types.length)]
  const department = departments[Math.floor(Math.random() * departments.length)]
  const person = persons[Math.floor(Math.random() * persons.length)]
  const substance = substances[Math.floor(Math.random() * substances.length)]
  const location = locations[Math.floor(Math.random() * locations.length)]
  const process = processes[Math.floor(Math.random() * processes.length)]
  
  mockData.push({
    id: i,
    name: `${type}测点${i}`,
    pointCode: `${type.charAt(0)}-${String(i).padStart(3, '0')}`,
    opcCode: `OPC-${type.charAt(0)}-${String(i).padStart(3, '0')}`,
    type,
    unit: type === '温度' ? '℃' : type === '压力' ? 'MPa' : type === '流量' ? 'm³/h' : 'm',
    substance,
    rangeMin: 0,
    rangeMax: type === '温度' ? 100 : type === '压力' ? 10 : type === '流量' ? 100 : 5,
    alarmType: '工艺报警',
    valueType: 'double',
    location,
    alarmConfig: '阈值告警',
    process,
    department,
    person
  })
}

const dictionaries = {
  types: ['温度', '压力', '流量', '液位'],
  alarmTypes: ['工艺报警', '设备报警', '仪表报警', '安全报警'],
  valueTypes: ['long', 'double', 'boolean'],
  alarmConfigs: ['阈值告警'],
  processes: ['预处理', '反应', '分离', '精制', '包装', '储存'],
  departments: ['生产部', '设备部', '技术部', '安全部'],
  persons: {
    '生产部': ['张三', '李四', '王五'],
    '设备部': ['赵六', '钱七', '孙八'],
    '技术部': ['周九', '吴十', '郑十一'],
    '安全部': ['王十二', '冯十三', '陈十四']
  }
}

const searchParams = ref({
  name: '',
  pointCode: '',
  type: '',
  location: '',
  process: '',
  department: '',
  person: ''
})

const data = ref<ProcessPoint[]>(mockData)
const showAddModal = ref(false)
const showInstantAlarmModal = ref(false)
const showBatchDeadbandModal = ref(false)

// 动态弹窗标题
const modalTitle = ref('新增监测点')

// 复选框相关
const multipleSelection = ref<ProcessPoint[]>([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(mockData.length)

// 表单引用
const addFormRef = ref()
const instantAlarmFormRef = ref()
const batchDeadbandFormRef = ref()

// 新增监测点表单
const addForm = reactive({
  id: 0, // 将 id 初始化为数字类型
  name: '',
  pointCode: '',
  opcCode: '',
  type: '',
  substance: '',
  rangeMin: '',
  rangeMax: '',
  alarmType: '',
  dataType: '',
  location: '',
  alarmConfig: '',
  process: '',
  department: '',
  person: '',
  hhNotifier: [],
  hNotifier: [],
  llNotifier: [],
  lNotifier: [],
  deadband: '',
  alarmDelay: '',
  collectService: '',
  // 报警阈值相关
  hhValue: '',
  hhAlarmLevel: '',
  hValue: '',
  hAlarmLevel: '',
  lValue: '',
  lAlarmLevel: '',
  llValue: '',
  llAlarmLevel: ''
})

// 瞬时报警设置表单
const instantAlarmForm = reactive({
  delayTime: ''
})

// 批量死区修改表单
const batchDeadbandForm = reactive({
  deadbandValue: ''
})

const handleSearch = () => {
  console.log('搜索参数:', searchParams.value)
}

const handleReset = () => {
  searchParams.value = {
    name: '',
    pointCode: '',
    type: '',
    location: '',
    process: '',
    department: '',
    person: ''
  }
}

const handleAdd = () => {
  modalTitle.value = '新增监测点'

  // 重置表单数据
  if (addFormRef.value) {
    addFormRef.value.resetFields()
  }

  showAddModal.value = true
}

const handleImport = () => {
  console.log('导入')
}

const handleExport = () => {
  console.log('导出')
}

const handleInstantAlarm = () => {
  showInstantAlarmModal.value = true
}

const handleBatchDeadband = () => {
  showBatchDeadbandModal.value = true
}

const handleEdit = (id: number) => {
  const row = data.value.find(item => item.id === id)
  if (row) {
    modalTitle.value = '编辑监测点' // 修改标题

    // 数据回显：将行数据赋值给表单对象
    Object.assign(addForm, row)

    showAddModal.value = true // 打开弹窗
  }
}

const handleDelete = (id: number) => {
  data.value = data.value.filter(item => item.id !== id)
}

const tableHeaderColor = ({ column }: { column: any }) => {
  if (column.label === '操作') {
    return { backgroundColor: '#e6f7ff', color: '#1890ff' }
  }
}

// 保存新增监测点
const handleSaveAdd = () => {
  if (!addFormRef.value) return
  
  addFormRef.value.validate((valid: boolean, fields: any) => {
    if (valid) {
      // 模拟保存操作
      console.log('保存表单数据:', addForm)
      
      if (modalTitle.value === '编辑监测点') {
        // 编辑操作：更新现有数据
        const index = data.value.findIndex(item => item.id === addForm.id)
        if (index !== -1) {
          // 手动构建符合 ProcessPoint 接口的对象
          data.value[index] = {
            id: addForm.id,
            name: addForm.name,
            pointCode: addForm.pointCode,
            opcCode: addForm.opcCode,
            type: addForm.type,
            unit: data.value[index].unit, // 保留原有 unit 值
            substance: addForm.substance,
            rangeMin: Number(addForm.rangeMin),
            rangeMax: Number(addForm.rangeMax),
            alarmType: addForm.alarmType,
            valueType: addForm.dataType,
            location: addForm.location,
            alarmConfig: addForm.alarmConfig,
            process: addForm.process,
            department: addForm.department,
            person: addForm.person
          }
        }
      } else {
        // 新增操作：生成新的监测点
        const newPoint: ProcessPoint = {
          id: Date.now(),
          name: addForm.name,
          pointCode: addForm.pointCode,
          opcCode: addForm.opcCode,
          type: addForm.type,
          unit: '', // 根据类型自动生成，这里简化处理
          substance: addForm.substance,
          rangeMin: Number(addForm.rangeMin),
          rangeMax: Number(addForm.rangeMax),
          alarmType: addForm.alarmType,
          valueType: addForm.dataType,
          location: addForm.location,
          alarmConfig: addForm.alarmConfig,
          process: addForm.process,
          department: addForm.department,
          person: addForm.person
        }
        
        // 添加到数据列表
        data.value.unshift(newPoint)
      }
      
      // 关闭弹窗
      showAddModal.value = false
      
      // 重置表单
      if (addFormRef.value) {
        addFormRef.value.resetFields()
      }
      
      console.log('保存成功！')
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

// 保存瞬时报警设置
const handleSaveInstantAlarm = () => {
  if (!instantAlarmFormRef.value) return
  
  instantAlarmFormRef.value.validate((valid: boolean, fields: any) => {
    if (valid) {
      console.log('保存瞬时报警设置:', instantAlarmForm)
      showInstantAlarmModal.value = false
      if (instantAlarmFormRef.value) {
        instantAlarmFormRef.value.resetFields()
      }
      console.log('保存成功！')
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

// 保存批量死区修改
const handleSaveBatchDeadband = () => {
  if (!batchDeadbandFormRef.value) return
  
  batchDeadbandFormRef.value.validate((valid: boolean, fields: any) => {
    if (valid) {
      console.log('保存批量死区修改:', batchDeadbandForm)
      showBatchDeadbandModal.value = false
      if (batchDeadbandFormRef.value) {
        batchDeadbandFormRef.value.resetFields()
      }
      console.log('保存成功！')
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

// 处理复选框选择变化
const handleSelectionChange = (val: ProcessPoint[]) => {
  multipleSelection.value = val
  console.log('选中的项:', multipleSelection.value)
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
}

// 处理当前页码变化
const handleCurrentChange = (current: number) => {
  currentPage.value = current
}

// 计算当前页显示的数据
const getCurrentPageData = () => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.value.slice(start, end)
}

// 表单验证规则
const addFormRules = {
  name: [{ required: true, message: '请输入监测点名称', trigger: 'blur' }],
  pointCode: [{ required: true, message: '请输入监测点位号', trigger: 'blur' }],
  opcCode: [{ required: true, message: '请输入OPC位号', trigger: 'blur' }],
  type: [{ required: true, message: '请选择监测类型', trigger: 'change' }],
  substance: [{ required: true, message: '请输入监测物质', trigger: 'blur' }],
  rangeMin: [{ required: true, message: '请输入量程下限', trigger: 'blur' }],
  rangeMax: [{ required: true, message: '请输入量程上限', trigger: 'blur' }],
  alarmType: [{ required: true, message: '请选择报警种类', trigger: 'change' }],
  collectService: [{ required: true, message: '请选择采集服务', trigger: 'change' }],
  dataType: [{ required: true, message: '请选择数据类型', trigger: 'change' }],
  location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
  alarmConfig: [{ required: true, message: '请选择报警类型', trigger: 'change' }],
  process: [{ required: true, message: '请选择所属工序', trigger: 'change' }],
  department: [{ required: true, message: '请选择责任单位', trigger: 'change' }],
  person: [{ required: true, message: '请选择责任人', trigger: 'change' }],
  hhNotifier: [{ required: true, message: '请选择HH抄送人', trigger: 'change' }],
  hNotifier: [{ required: true, message: '请选择H抄送人', trigger: 'change' }],
  llNotifier: [{ required: true, message: '请选择LL抄送人', trigger: 'change' }],
  lNotifier: [{ required: true, message: '请选择L抄送人', trigger: 'change' }],
  deadband: [{ required: true, message: '请输入死区值', trigger: 'blur' }],
  alarmDelay: [{ required: true, message: '请输入报警延时', trigger: 'blur' }],
  hhValue: [{ required: true, message: '请输入HH限值', trigger: 'blur' }],
  hhAlarmLevel: [{ required: true, message: '请选择HH告警级别', trigger: 'change' }],
  hValue: [{ required: true, message: '请输入H限值', trigger: 'blur' }],
  hAlarmLevel: [{ required: true, message: '请选择H告警级别', trigger: 'change' }],
  lValue: [{ required: true, message: '请输入L限值', trigger: 'blur' }],
  lAlarmLevel: [{ required: true, message: '请选择L告警级别', trigger: 'change' }],
  llValue: [{ required: true, message: '请输入LL限值', trigger: 'blur' }],
  llAlarmLevel: [{ required: true, message: '请选择LL告警级别', trigger: 'change' }]
}

// 瞬时报警设置验证规则
const instantAlarmFormRules = {
  delayTime: [{ required: true, message: '请输入延迟时间', trigger: 'blur' }]
}

// 批量死区修改验证规则
const batchDeadbandFormRules = {
  deadbandValue: [{ required: true, message: '请输入死区值', trigger: 'blur' }]
}
</script>

<template>
  <div class="process-points">
      <div class="search-toolbar">
        <div class="search-items">
          <el-input 
            v-model="searchParams.name" 
            placeholder="监测点名称"
            :prefix-icon="Search"
            clearable
            class="search-input"
          />
          
          <el-input 
            v-model="searchParams.pointCode" 
            placeholder="监测点位号"
            :prefix-icon="Search"
            clearable
            class="search-input"
          />
          
          <el-select 
            v-model="searchParams.type" 
            placeholder="监测类型" 
            clearable
            class="search-input"
          >
            <el-option 
              v-for="type in dictionaries.types" 
              :key="type" 
              :label="type" 
              :value="type"
            />
          </el-select>
          
          <el-input 
            v-model="searchParams.location" 
            placeholder="监测位置"
            :prefix-icon="Location"
            clearable
            class="search-input"
          />
          
          <el-select 
            v-model="searchParams.process" 
            placeholder="所属工序" 
            clearable
            class="search-input"
          >
            <el-option 
              v-for="process in dictionaries.processes" 
              :key="process" 
              :label="process" 
              :value="process"
            />
          </el-select>
          
          <el-select 
            v-model="searchParams.department" 
            placeholder="责任单位" 
            clearable
            class="search-input"
          >
            <el-option 
              v-for="dept in dictionaries.departments" 
              :key="dept" 
              :label="dept" 
              :value="dept"
            />
          </el-select>
          
          <el-select 
            v-model="searchParams.person" 
            placeholder="责任人" 
            clearable
            class="search-input"
          >
            <template v-for="(persons, dept) in dictionaries.persons" :key="dept">
              <el-option 
                v-for="person in persons" 
                :key="person"
                :label="person" 
                :value="person"
              />
            </template>
          </el-select>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="handleSearch" class="search-btn">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset" class="reset-btn">
            重置
          </el-button>
        </div>
      </div>
    

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd" class="btn-primary-highlight">
        <el-icon><Plus /></el-icon>
        新增
      </el-button>
      <div class="toolbar-divider"></div>
      <el-button type="default" plain @click="handleImport">
        <el-icon><Upload /></el-icon>
        导入
      </el-button>
      <el-button type="default" plain @click="handleExport">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
      <el-button type="default" plain @click="handleInstantAlarm">
        <el-icon><Setting /></el-icon>
        瞬时报警设置
      </el-button>
      <el-button type="default" plain @click="handleBatchDeadband">
        <el-icon><Setting /></el-icon>
        批量死区修改
      </el-button>
    </div>

    <div class="card">
      <el-table 
        :data="getCurrentPageData()" 
        stripe 
        border 
        class="industrial-table"
        :header-cell-style="tableHeaderColor"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" label="监测点名称" min-width="120" show-overflow-tooltip align="center" />
        <el-table-column prop="pointCode" label="监测点位号" min-width="120" show-overflow-tooltip align="center" />
        <el-table-column prop="opcCode" label="OPC位号" min-width="120" show-overflow-tooltip align="center" />
        <el-table-column prop="type" label="监测类型" width="100" align="center" />
        <el-table-column prop="unit" label="单位" width="60" align="center" />
        <el-table-column prop="substance" label="监测物质" width="100" align="center" />
        <el-table-column prop="rangeMin" label="量程下限" width="100" align="center" />
        <el-table-column prop="rangeMax" label="量程上限" width="100" align="center" />
        <el-table-column prop="alarmType" label="报警种类" width="100" show-overflow-tooltip align="center" />
        <el-table-column prop="valueType" label="数值类型" width="100" align="center" />
        <el-table-column prop="location" label="监测位置" min-width="120" show-overflow-tooltip align="center" />
        <el-table-column prop="alarmConfig" label="报警类型" width="100" show-overflow-tooltip align="center" />
        <el-table-column prop="process" label="所属工序" width="100" show-overflow-tooltip align="center" />
        <el-table-column prop="department" label="责任单位" width="100" show-overflow-tooltip align="center" />
        <el-table-column prop="person" label="责任人" width="80" align="center" />
        <el-table-column label="操作" min-width="160" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons-row">
              <el-button size="small" @click="handleEdit(row.id)" class="table-action-btn table-action-edit">
                <el-icon><EditPen /></el-icon>
                编辑
              </el-button>
              <el-button size="small" @click="handleDelete(row.id)" class="table-action-btn table-action-delete">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog v-model="showAddModal" :title="modalTitle" width="850px" top="5vh" class="custom-dialog">
      <div>
        <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-position="top">
          <h4 class="modal-section-title">基础信息</h4>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="监测点名称" prop="name">
                <el-input v-model="addForm.name" placeholder="请输入监测点名称" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="监测点位号" prop="pointCode">
                <el-input v-model="addForm.pointCode" placeholder="请输入监测点位号" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="OPC位号" prop="opcCode">
                <el-input v-model="addForm.opcCode" placeholder="请输入OPC位号" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="监测类型" prop="type">
                <el-select v-model="addForm.type" placeholder="请选择监测类型" style="width: 100%">
                  <el-option 
                    v-for="type in dictionaries.types" 
                    :key="type" 
                    :label="type" 
                    :value="type"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="量程下限" prop="rangeMin">
                <el-input v-model="addForm.rangeMin" type="number" placeholder="请输入量程下限" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="量程上限" prop="rangeMax">
                <el-input v-model="addForm.rangeMax" type="number" placeholder="请输入量程上限" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="监测物质" prop="substance">
                <el-input v-model="addForm.substance" placeholder="请输入监测物质" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报警种类" prop="alarmType">
                <el-select v-model="addForm.alarmType" placeholder="请选择报警种类" style="width: 100%">
                  <el-option 
                    v-for="type in dictionaries.alarmTypes" 
                    :key="type" 
                    :label="type" 
                    :value="type"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="采集服务" prop="collectService">
                <el-select v-model="addForm.collectService" placeholder="请选择采集服务" style="width: 100%">
                  <el-option label="模拟采集服务" value="模拟采集服务" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="数据类型" prop="dataType">
                <el-select v-model="addForm.dataType" placeholder="请选择数据类型" style="width: 100%">
                  <el-option 
                    v-for="type in dictionaries.valueTypes" 
                    :key="type" 
                    :label="type" 
                    :value="type"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="安装位置" prop="location">
                <el-input v-model="addForm.location" placeholder="请输入安装位置" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <h4 class="modal-section-title">报警阈值</h4>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="报警类型" prop="alarmConfig">
                <el-select v-model="addForm.alarmConfig" placeholder="请选择报警类型" style="width: 100%">
                  <el-option 
                    v-for="config in dictionaries.alarmConfigs" 
                    :key="config" 
                    :label="config" 
                    :value="config"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <!-- 仅当报警类型选择为阈值告警时显示四个限值 -->
          <template v-if="addForm.alarmConfig === '阈值告警'">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="HH限值" prop="hhValue">
                  <el-input v-model="addForm.hhValue" type="number" placeholder="HH限值" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="选择告警级别" prop="hhAlarmLevel">
                  <el-select v-model="addForm.hhAlarmLevel" placeholder="请选择告警级别" style="width: 100%">
                    <el-option label="一级告警" value="一级告警" />
                    <el-option label="二级告警" value="二级告警" />
                    <el-option label="三级告警" value="三级告警" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="H限值" prop="hValue">
                  <el-input v-model="addForm.hValue" type="number" placeholder="H限值" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="选择告警级别" prop="hAlarmLevel">
                  <el-select v-model="addForm.hAlarmLevel" placeholder="请选择告警级别" style="width: 100%">
                    <el-option label="一级告警" value="一级告警" />
                    <el-option label="二级告警" value="二级告警" />
                    <el-option label="三级告警" value="三级告警" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="L限值" prop="lValue">
                  <el-input v-model="addForm.lValue" type="number" placeholder="L限值" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="选择告警级别" prop="lAlarmLevel">
                  <el-select v-model="addForm.lAlarmLevel" placeholder="请选择告警级别" style="width: 100%">
                    <el-option label="一级告警" value="一级告警" />
                    <el-option label="二级告警" value="二级告警" />
                    <el-option label="三级告警" value="三级告警" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="LL限值" prop="llValue">
                  <el-input v-model="addForm.llValue" type="number" placeholder="LL限值" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="选择告警级别 *" prop="llAlarmLevel">
                  <el-select v-model="addForm.llAlarmLevel" placeholder="请选择告警级别" style="width: 100%">
                    <el-option label="一级告警" value="一级告警" />
                    <el-option label="二级告警" value="二级告警" />
                    <el-option label="三级告警" value="三级告警" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </template>

          <h4 class="modal-section-title">管理信息</h4>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="所属工序 *" prop="process">
                <el-select v-model="addForm.process" placeholder="请选择所属工序" style="width: 100%">
                  <el-option 
                    v-for="process in dictionaries.processes" 
                    :key="process" 
                    :label="process" 
                    :value="process"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="责任单位 *" prop="department">
                <el-select v-model="addForm.department" placeholder="请选择责任单位" style="width: 100%">
                  <el-option 
                    v-for="dept in dictionaries.departments" 
                    :key="dept" 
                    :label="dept" 
                    :value="dept"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="责任人 *" prop="person">
                <el-select v-model="addForm.person" placeholder="请选择责任人" style="width: 100%"><template v-for="(persons, dept) in dictionaries.persons" :key="dept">
                    <el-option 
                      v-for="person in persons" 
                      :key="person"
                      :label="person" 
                      :value="person"
                    />
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="HH抄送人" prop="hhNotifier">
                <el-select v-model="addForm.hhNotifier" multiple placeholder="请选择HH抄送人" style="width: 100%">
                  <template v-for="(persons, dept) in dictionaries.persons" :key="dept">
                    <el-option 
                      v-for="person in persons" 
                      :key="person"
                      :label="person" 
                      :value="person"
                    />
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="H抄送人" prop="hNotifier">
                <el-select v-model="addForm.hNotifier" multiple placeholder="请选择H抄送人" style="width: 100%">
                  <template v-for="(persons, dept) in dictionaries.persons" :key="dept">
                    <el-option 
                      v-for="person in persons" 
                      :key="person"
                      :label="person" 
                      :value="person"
                    />
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="LL抄送人" prop="llNotifier">
                <el-select v-model="addForm.llNotifier" multiple placeholder="请选择LL抄送人" style="width: 100%">
                  <template v-for="(persons, dept) in dictionaries.persons" :key="dept">
                    <el-option 
                      v-for="person in persons" 
                      :key="person"
                      :label="person" 
                      :value="person"
                    />
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="L抄送人" prop="lNotifier">
                <el-select v-model="addForm.lNotifier" multiple placeholder="请选择L抄送人" style="width: 100%"><template v-for="(persons, dept) in dictionaries.persons" :key="dept">
                    <el-option 
                      v-for="person in persons" 
                      :key="person"
                      :label="person" 
                      :value="person"
                    />
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <h4 class="modal-section-title">其他设置</h4>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="死区值(%)" prop="deadband">
                <el-input v-model="addForm.deadband" type="number" placeholder="请输入死区值" style="width: 100%">
                  <template #append>%</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报警延时(S)" prop="alarmDelay">
                <el-input v-model="addForm.alarmDelay" type="number" placeholder="请输入报警延时" style="width: 100%">
                  <template #append>S</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAdd">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showInstantAlarmModal" title="瞬时报警设置" width="400px">
      <el-form ref="instantAlarmFormRef" :model="instantAlarmForm" :rules="instantAlarmFormRules" label-position="left" label-width="120px">
        <el-form-item label="延迟时间" prop="delayTime">
          <el-input v-model="instantAlarmForm.delayTime" type="number" placeholder="请输入延迟时间">
            <template #append>S</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInstantAlarmModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveInstantAlarm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showBatchDeadbandModal" title="批量死区修改" width="400px">
      <el-form ref="batchDeadbandFormRef" :model="batchDeadbandForm" :rules="batchDeadbandFormRules" label-position="left" label-width="120px">
        <el-form-item label="死区值（量程百分比）" prop="deadbandValue">
          <el-input v-model="batchDeadbandForm.deadbandValue" type="number" placeholder="请输入死区值">
            <template #append>%</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchDeadbandModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveBatchDeadband">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.process-points {
  padding: 8px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.search-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
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

.toolbar {
  background: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-divider {
  width: 1px;
  height: 32px;
  background-color: #e4e7ed;
  margin: 0 10px;
}

.btn-primary-highlight {
  background-color: #1890ff;
  border-color: #1890ff;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.industrial-table {
  width: 100%;
  font-size: 14px;
}

.industrial-table th {
  background-color: #fafafa;
  font-weight: 600;
  color: #303133;
  text-align: center;
}

.industrial-table td {
  text-align: center;
  padding: 12px 8px;
}

.action-buttons-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.table-action-btn {
  padding: 4px 12px;
  font-size: 12px;
}

.table-action-edit {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.table-action-delete {
  color: #f56c6c;
  border-color: #fbc4c4;
  background-color: #fef0f0;
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
}

.custom-dialog .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
}

.modal-section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 15px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.modal-section-title:first-child {
  margin-top: 0;
}

@media (max-width: 1200px) {
  .search-input {
    width: 150px;
  }
  
  .search-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    align-items: center;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .process-points {
    padding: 10px;
  }
  
  .search-items {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .toolbar {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .industrial-table {
    font-size: 12px;
  }
  
  .industrial-table td {
    padding: 8px 4px;
  }
}
</style>
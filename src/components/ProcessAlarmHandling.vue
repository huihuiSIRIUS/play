<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Download, Check, Edit, View } from '@element-plus/icons-vue'

interface ProcessAlarm {
  id: number
  name: string
  pointCode: string
  process: string
  department: string
  alarmType: string
  alarmContent: string
  alarmLevel: string
  alarmTime: string
  alarmEndTime: string
  processTime: string
  processor: string
  alarmReason: string
  processMeasure: string
}

const mockData: ProcessAlarm[] = []

// 生成 100 组随机数据
for (let i = 1; i <= 100; i++) {
  const alarmTypes = ['温度', '压力', '流量', '液位']
  const alarmContents = ['高高报', '高报', '低报', '低低报']
  const alarmLevels = ['一级告警', '二级告警', '三级告警']
  const departments = ['生产部', '设备部', '技术部', '安全部']
  const persons = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  const processes = ['预处理', '反应', '分离', '精制', '包装', '储存']
  
  const alarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)]
  const alarmContent = alarmContents[Math.floor(Math.random() * alarmContents.length)]
  const alarmLevel = alarmLevels[Math.floor(Math.random() * alarmLevels.length)]
  const department = departments[Math.floor(Math.random() * departments.length)]
  const person = persons[Math.floor(Math.random() * persons.length)]
  const process = processes[Math.floor(Math.random() * processes.length)]
  
  // 生成随机时间
  const baseTime = new Date()
  const alarmTime = new Date(baseTime.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
  const alarmEndTime = new Date(alarmTime.getTime() + Math.random() * 24 * 60 * 60 * 1000)
  const processTime = Math.random() > 0.5 ? new Date(alarmEndTime.getTime() + Math.random() * 24 * 60 * 60 * 1000) : ''
  
  mockData.push({
    id: i,
    name: `${alarmType}测点${i}`,
    pointCode: `${alarmType.charAt(0)}-${String(i).padStart(3, '0')}`,
    process,
    department,
    alarmType,
    alarmContent,
    alarmLevel,
    alarmTime: alarmTime.toLocaleString(),
    alarmEndTime: alarmEndTime.toLocaleString(),
    processTime: processTime ? processTime.toLocaleString() : '',
    processor: processTime ? person : '',
    alarmReason: '',
    processMeasure: ''
  })
}

const dictionaries = {
  processes: ['预处理', '反应', '分离', '精制', '包装', '储存'],
  departments: ['生产部', '设备部', '技术部', '安全部'],
  alarmTypes: ['温度', '压力', '流量', '液位'],
  alarmContents: ['高高报', '高报', '低报', '低低报'],
  alarmLevels: ['一级告警', '二级告警', '三级告警'],
  alarmReasons: [
    '传感器损坏',
    '线路短路',
    '参数设置错误',
    '温度过高',
    '压力异常',
    '流量不稳定',
    '液位异常',
    '系统故障'
  ]
}

const searchParams = ref({
  name: '',
  pointCode: '',
  process: '',
  department: '',
  alarmType: '',
  alarmContent: '',
  alarmLevel: '',
  alarmTime: '',
  alarmEndTime: '',
  processTime: '',
  processor: ''
})

const data = ref<ProcessAlarm[]>(mockData)
const showProcessModal = ref(false)
const showDetailModal = ref(false)
const currentAlarm = ref<ProcessAlarm | null>(null)

// 复选框相关
const multipleSelection = ref<ProcessAlarm[]>([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(mockData.length)

// 表单引用
const processFormRef = ref()

// 处理表单
const processForm = reactive({
  alarmReason: '',
  processMeasure: ''
})

const handleSearch = () => {
  console.log('搜索参数:', searchParams.value)
}

const handleReset = () => {
  searchParams.value = {
    name: '',
    pointCode: '',
    process: '',
    department: '',
    alarmType: '',
    alarmContent: '',
    alarmLevel: '',
    alarmTime: '',
    alarmEndTime: '',
    processTime: '',
    processor: ''
  }
}

const handleAllProcess = () => {
  console.log('全部处理')
}

const handleBatchProcess = () => {
  console.log('批量处理')
  if (multipleSelection.value.length > 0) {
    currentAlarm.value = multipleSelection.value[0]
    showProcessModal.value = true
  }
}

const handleExport = () => {
  console.log('导出')
}

const handleProcess = (alarm: ProcessAlarm) => {
  currentAlarm.value = alarm
  processForm.alarmReason = ''
  processForm.processMeasure = ''
  showProcessModal.value = true
}

const handleDetail = (alarm: ProcessAlarm) => {
  currentAlarm.value = alarm
  showDetailModal.value = true
}

const handleSaveProcess = () => {
  if (!processFormRef.value) return
  
  processFormRef.value.validate((valid: boolean, fields: any) => {
    if (valid && currentAlarm.value) {
      // 模拟保存操作
      console.log('保存处理数据:', processForm)
      
      const index = data.value.findIndex(item => item.id === currentAlarm.value?.id)
      if (index !== -1) {
        data.value[index] = {
          ...data.value[index],
          alarmReason: processForm.alarmReason,
          processMeasure: processForm.processMeasure,
          processTime: new Date().toLocaleString(),
          processor: '当前用户'
        }
      }
      
      // 关闭弹窗
      showProcessModal.value = false
      
      console.log('保存成功！')
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

// 处理复选框选择变化
const handleSelectionChange = (val: ProcessAlarm[]) => {
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
const processFormRules = {
  alarmReason: [{ required: true, message: '请选择报警原因', trigger: 'change' }],
  processMeasure: [{ required: true, message: '请输入处理措施', trigger: 'blur' }]
}
</script>

<template>
  <div class="process-alarm-handling">
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
            v-model="searchParams.alarmType" 
            placeholder="报警种类" 
            clearable
            class="search-input"
          >
            <el-option 
              v-for="type in dictionaries.alarmTypes" 
              :key="type" 
              :label="type" 
              :value="type"
            />
          </el-select>
          
          <el-select 
            v-model="searchParams.alarmContent" 
            placeholder="报警内容" 
            clearable
            class="search-input"
          >
            <el-option 
              v-for="content in dictionaries.alarmContents" 
              :key="content" 
              :label="content" 
              :value="content"
            />
          </el-select>
          
          <el-select 
            v-model="searchParams.alarmLevel" 
            placeholder="报警级别" 
            clearable
            class="search-input"
          >
            <el-option 
              v-for="level in dictionaries.alarmLevels" 
              :key="level" 
              :label="level" 
              :value="level"
            />
          </el-select>
          
          <el-input 
            v-model="searchParams.alarmTime" 
            placeholder="报警时间"
            clearable
            class="search-input"
          />
          
          <el-input 
            v-model="searchParams.alarmEndTime" 
            placeholder="消警时间"
            clearable
            class="search-input"
          />
          
          <el-input 
            v-model="searchParams.processTime" 
            placeholder="处理时间"
            clearable
            class="search-input"
          />
          
          <el-input 
            v-model="searchParams.processor" 
            placeholder="处理人"
            clearable
            class="search-input"
          />
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
      <el-button type="primary" @click="handleAllProcess" class="btn-primary-highlight">
        <el-icon><Check /></el-icon>
        全部处理
      </el-button>
      <el-button type="primary" @click="handleBatchProcess" class="btn-primary-highlight">
        <el-icon><Check /></el-icon>
        批量处理
      </el-button>
      <el-button type="default" plain @click="handleExport">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
    </div>

    <div class="card">
      <div class="table-container">
        <el-table 
          :data="getCurrentPageData()" 
          stripe 
          border 
          class="industrial-table"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="name" label="监测点名称" min-width="120" show-overflow-tooltip align="center" />
          <el-table-column prop="pointCode" label="监测点位号" min-width="120" show-overflow-tooltip align="center" />
          <el-table-column prop="process" label="所属工序" width="100" align="center" />
          <el-table-column prop="department" label="责任单位" width="100" align="center" />
          <el-table-column prop="alarmType" label="报警种类" width="100" align="center" />
          <el-table-column prop="alarmContent" label="报警内容" width="100" align="center" />
          <el-table-column prop="alarmLevel" label="报警级别" width="100" align="center" />
          <el-table-column prop="alarmTime" label="报警时间" min-width="150" align="center" />
          <el-table-column prop="alarmEndTime" label="消警时间" min-width="150" align="center" />
          <el-table-column prop="processTime" label="处理时间" min-width="150" align="center" />
          <el-table-column prop="processor" label="处理人" width="100" align="center" />
          <el-table-column label="操作" min-width="160" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons-row">
                <el-button size="small" @click="handleProcess(row)" class="table-action-btn table-action-process">
                  <el-icon><Edit /></el-icon>
                  处理
                </el-button>
                <el-button size="small" @click="handleDetail(row)" class="table-action-btn table-action-detail">
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
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

    <!-- 处理弹窗 -->
    <el-dialog v-model="showProcessModal" title="处理" width="850px" top="5vh" class="custom-dialog">
      <div>
        <el-form ref="processFormRef" :model="processForm" :rules="processFormRules" label-position="top">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="监测点名称">
                <el-input :value="currentAlarm?.name" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="监测点位号">
                <el-input :value="currentAlarm?.pointCode" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="所属工序">
                <el-input :value="currentAlarm?.process" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="责任单位">
                <el-input :value="currentAlarm?.department" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="报警种类">
                <el-input :value="currentAlarm?.alarmType" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报警内容">
                <el-input :value="currentAlarm?.alarmContent" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="报警级别">
                <el-input :value="currentAlarm?.alarmLevel" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报警时间">
                <el-input :value="currentAlarm?.alarmTime" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="消警时间">
                <el-input :value="currentAlarm?.alarmEndTime" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处理时间">
                <el-input :value="new Date().toLocaleString()" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="处理人">
                <el-input value="当前用户" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="报警原因" prop="alarmReason">
                <el-select v-model="processForm.alarmReason" placeholder="请选择报警原因" style="width: 100%">
                  <el-option 
                    v-for="reason in dictionaries.alarmReasons" 
                    :key="reason" 
                    :label="reason" 
                    :value="reason"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="处理措施" prop="processMeasure">
                <el-input 
                  v-model="processForm.processMeasure" 
                  type="textarea" 
                  placeholder="请输入处理措施" 
                  rows="4"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showProcessModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveProcess">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetailModal" title="详情" width="850px" top="5vh" class="custom-dialog">
      <div>
        <el-form label-position="top">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="监测点名称">
                <el-input :value="currentAlarm?.name" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="监测点位号">
                <el-input :value="currentAlarm?.pointCode" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="所属工序">
                <el-input :value="currentAlarm?.process" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="责任单位">
                <el-input :value="currentAlarm?.department" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="报警种类">
                <el-input :value="currentAlarm?.alarmType" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报警内容">
                <el-input :value="currentAlarm?.alarmContent" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="报警级别">
                <el-input :value="currentAlarm?.alarmLevel" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报警时间">
                <el-input :value="currentAlarm?.alarmTime" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="消警时间">
                <el-input :value="currentAlarm?.alarmEndTime" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处理时间">
                <el-input :value="currentAlarm?.processTime" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="处理人">
                <el-input :value="currentAlarm?.processor" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="报警原因">
                <el-input :value="currentAlarm?.alarmReason" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="处理措施">
                <el-input 
                  :value="currentAlarm?.processMeasure" 
                  type="textarea" 
                  disabled 
                  rows="4"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.process-alarm-handling {
 padding: 8px;
  width: 100%;
}

.table-container {
  overflow-x: auto;
}

.table-action-process {
  background-color: #ecf5ff;
  color: #409EFF;
}

.table-action-process:hover {
  background-color: #c6e2ff;
}

.table-action-detail {
  background-color: #f0f9eb;
  color: #67c23a;
}

.table-action-detail:hover {
  background-color: #c3e6cb;
}
.search-toolbar {
  display: flex;
  justify-content: space-between !important; 
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 15px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-left: auto; /* 这一句是右对齐的关键 */
}
</style>
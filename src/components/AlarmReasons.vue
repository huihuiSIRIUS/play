<template>
  <div class="process-points">

    <!-- 多条件查询区 -->
    <div class="search-toolbar">
        <div class="search-items">
          <el-select 
            v-model="searchForm.category" 
            placeholder="报警原因分类" 
            clearable
            class="search-input"
          >
            <el-option 
              v-for="category in categories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id"
            />
          </el-select>
          
          <el-input 
            v-model="searchForm.detail" 
            placeholder="报警详细原因"
            clearable
            class="search-input"
          />
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="handleSearch" class="search-btn">
            搜索
          </el-button>
        </div>
    </div>

    <!-- 工具栏功能操作 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd" class="btn-primary-highlight">
        <el-icon><Plus /></el-icon> 新增
      </el-button>
      <div class="toolbar-divider"></div>
      <el-button type="default" plain @click="handleImport">
        <el-icon><Upload /></el-icon> 导入
      </el-button>
      <el-button type="default" plain @click="handleExport">
        <el-icon><Download /></el-icon> 导出
      </el-button>
      <el-button type="default" plain @click="handleCategoryDict">
        <el-icon><CollectionTag /></el-icon> 一级字典分类
      </el-button>
    </div>

    <!-- 核心数据表 -->
    <div class="card">
      <el-table 
        :data="alarmReasonsData" 
        class="industrial-table"
        stripe
        border
        :header-cell-style="tableHeaderColor"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="category" label="报警原因分类" min-width="180" show-overflow-tooltip align="center" />
        <el-table-column prop="detail" label="报警详细原因" min-width="300" show-overflow-tooltip align="center" />
        <el-table-column label="操作" min-width="160" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons-row">
              <el-button size="small" @click="handleEdit(scope.row)" class="table-action-btn table-action-edit">
                <el-icon><EditPen /></el-icon>
                编辑
              </el-button>
              <el-button size="small" @click="handleDelete(scope.row.id)" class="table-action-btn table-action-delete">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 翻页功能 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增报警原因' : '编辑报警原因'"
      width="500px"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef">
        <el-form-item label="报警原因分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择">
            <el-option 
              v-for="category in categories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="报警详细原因" prop="detail">
          <el-input v-model="formData.detail" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 一级分类字典弹窗 -->
    <el-dialog
      v-model="categoryDialogVisible"
      title="一级分类字典"
      width="600px"
    >
      <div class="category-dialog-content">
        <div class="category-header">
          <el-button type="primary" @click="addCategory">
            <el-icon><Plus /></el-icon> 新增
          </el-button>
        </div>
        <el-table 
          :data="categories" 
          style="width: 100%"
          border
        >
          <el-table-column type="index" label="序号" width="80" />
          <el-table-column prop="name" label="一级分类" min-width="200">
            <template #default="scope">
              <el-input 
                v-if="editingCategoryId === scope.row.id" 
                v-model="scope.row.name" 
                size="small"
                @blur="saveCategory(scope.row)"
              />
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <template v-if="editingCategoryId === scope.row.id">
                <el-button type="primary" size="small" @click="saveCategory(scope.row)">
                  保存
                </el-button>
                <el-button type="danger" size="small" @click="cancelEditCategory">
                  取消
                </el-button>
              </template>
              <template v-else>
                <el-button size="small" @click="editCategory(scope.row.id)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="deleteCategory(scope.row.id)">
                  删除
                </el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Upload, Download, CollectionTag, EditPen, Delete } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  category: '',
  detail: ''
})
// 【新增】控制表头颜色的函数
const tableHeaderColor = ({ column }: { column: any }) => {
  if (column.label === '操作') {
    return { backgroundColor: '#e6f7ff', color: '#1890ff' }
  }
}
// 分类数据
const categories = ref([
  { id: 1, name: '设备故障' },
  { id: 2, name: '操作失误' },
  { id: 3, name: '环境因素' },
  { id: 4, name: '其他原因' }
])

// 报警原因数据
const alarmReasonsData = ref([
  { id: 1, category: '设备故障', detail: '传感器损坏' },
  { id: 2, category: '设备故障', detail: '线路短路' },
  { id: 3, category: '操作失误', detail: '参数设置错误' },
  { id: 4, category: '环境因素', detail: '温度过高' },
  { id: 5, category: '其他原因', detail: '系统异常' }
])

// 分页数据
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 5
})

// 弹窗控制
const dialogVisible = ref(false)
const categoryDialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')

// 表单数据
const formData = reactive({
  id: '',
  category: '',
  detail: ''
})

// 表单验证规则
const formRules = {
  category: [{ required: true, message: '请选择报警原因分类', trigger: 'change' }],
  detail: [{ required: true, message: '请输入报警详细原因', trigger: 'blur' }]
}

const formRef = ref()

// 分类编辑状态
const editingCategoryId = ref<number | null>(null)

// 搜索方法
const handleSearch = () => {
  // 实际项目中这里会调用API
  console.log('搜索参数:', searchForm)
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(formData, { id: '', category: '', detail: '' })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

// 删除
const handleDelete = (id: number) => {
  // 实际项目中这里会调用API
  console.log('删除ID:', id)
  // 模拟删除
  const index = alarmReasonsData.value.findIndex(item => item.id === id)
  if (index > -1) {
    alarmReasonsData.value.splice(index, 1)
    pagination.total--
  }
}

// 提交表单
const handleSubmit = () => {
  // 实际项目中这里会调用API
  console.log('提交数据:', formData)
  dialogVisible.value = false
}

// 导入
const handleImport = () => {
  // 实际项目中这里会打开文件选择器
  console.log('导入Excel')
}

// 导出
const handleExport = () => {
  // 实际项目中这里会调用API导出Excel
  console.log('导出Excel')
}

// 一级字典分类
const handleCategoryDict = () => {
  categoryDialogVisible.value = true
}

// 新增分类
const addCategory = () => {
  const newCategory = { id: Date.now(), name: '' }
  categories.value.unshift(newCategory)
  editingCategoryId.value = newCategory.id
}

// 编辑分类
const editCategory = (id: number) => {
  editingCategoryId.value = id
}

// 保存分类
const saveCategory = (row: any) => {
  editingCategoryId.value = null
  console.log('保存分类:', row)
}

// 取消编辑分类
const cancelEditCategory = () => {
  editingCategoryId.value = null
}

// 删除分类
const deleteCategory = (id: number) => {
  const index = categories.value.findIndex(item => item.id === id)
  if (index > -1) {
    categories.value.splice(index, 1)
  }
}

// 分页方法
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  console.log('每页条数:', size)
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  console.log('当前页码:', current)
}
</script>
<style scoped>
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

<template>
  <div class="version-list">
    <h2>版本列表</h2>
    
    <el-card class="version-card">
      <template #header>
        <div class="card-header">
          <span>版本更新记录</span>
          <el-button type="primary" size="small" @click="refreshVersions">
            <el-icon><Refresh /></el-icon>
            刷新列表
          </el-button>
        </div>
      </template>
      
      <div v-if="loading" class="loading-state">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>正在加载版本列表...</span>
      </div>
      
      <div v-else-if="error" class="error-state">
        <el-icon class="error-icon"><Warning /></el-icon>
        <span>{{ error }}</span>
      </div>
      
      <div v-else>
        <el-table :data="versions" style="width: 100%">
          <el-table-column prop="version" label="版本号" width="150" />
          <el-table-column prop="date" label="更新日期" width="120" />
          <el-table-column prop="content" label="更新内容" min-width="300" />
        </el-table>
        
        <div v-if="versions.length === 0" class="empty-state">
          <el-icon class="empty-icon"><Document /></el-icon>
          <span>暂无版本记录</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Refresh, 
  Loading, 
  Warning, 
  Document 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 类型定义
interface Version {
  version: string
  date: string
  content: string
}

// 响应式数据
const versions = ref<Version[]>([])
const loading = ref(false)
const error = ref('')

// 方法
const refreshVersions = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 从changelog.json读取版本信息
    // 动态导入以确保每次刷新都获取最新数据
    const { default: updatedChangelog } = await import('../assets/changelog.json')
    
    // 转换为Version类型
    versions.value = updatedChangelog.map((item: any) => ({
      version: item.version,
      date: item.date,
      content: item.content
    }))
  } catch (err: any) {
    error.value = err.message
    ElMessage.error(`获取版本列表失败: ${err.message}`)
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  refreshVersions()
})
</script>

<style scoped>
.version-list {
  padding: 20px;
  min-height: 100%;
  background: #f5f7fa;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  border-radius: 8px;
}

.loading-state {
  background-color: #f0f9ff;
  color: #1989fa;
}

.error-state {
  background-color: #fef0f0;
  color: #f56c6c;
}

.empty-state {
  background-color: #fafafa;
  color: #909399;
}

.loading-icon,
.error-icon,
.empty-icon {
  margin-right: 10px;
  font-size: 24px;
}

.el-table {
  margin-top: 20px;
}

.el-table-column {
  text-align: center;
}

.el-table__header-wrapper .el-table-column__label {
  font-weight: 600;
  color: #606266;
}
</style>

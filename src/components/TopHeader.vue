<template>
  <header class="top-header">
    <div class="header-left">
      <div class="logo-container" @click="handleLogoUpload">
        <input
          ref="logoInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleLogoChange"
        />
        <img v-if="logoData" :src="logoData" class="logo-image" alt="Logo" />
        <div v-else class="logo-placeholder">
          <el-icon :size="24"><Picture /></el-icon>
        </div>
      </div>
      <div class="system-name">工艺报警管理系统</div>
    </div>

    <div class="header-right">
      <el-popover
        placement="bottom-end"
        :width="280"
        trigger="click"
        @show="isEditingName = false"
      >
        <template #reference>
          <div class="user-info" @click="handleUserClick">
            <div class="avatar-container">
              <img v-if="avatarData" :src="avatarData" class="avatar-image" alt="Avatar" />
              <div v-else class="avatar-placeholder">
                <el-icon :size="20"><User /></el-icon>
              </div>
            </div>
            <div class="user-name">{{ userName }}</div>
          </div>
        </template>

        <div class="user-profile-panel">
          <div class="profile-header">
            <div class="profile-avatar" @click="handleAvatarUpload">
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
              />
              <img v-if="avatarData" :src="avatarData" class="avatar-image" alt="Avatar" />
              <div v-else class="avatar-placeholder">
                <el-icon :size="32"><User /></el-icon>
              </div>
              <div class="avatar-edit-hint">
                <el-icon><Camera /></el-icon>
              </div>
            </div>
          </div>

          <div class="profile-info">
            <div class="info-label">用户名</div>
            <el-input
              v-if="isEditingName"
              v-model="userName"
              size="small"
              class="username-input"
              @blur="handleUserNameBlur"
              @keyup.enter="handleUserNameBlur"
              ref="usernameInput"
            />
            <div v-else class="username-display" @click="handleUserNameEdit">
              {{ userName }}
              <el-icon class="edit-icon"><Edit /></el-icon>
            </div>
          </div>

          <div class="profile-actions">
            <el-button type="primary" size="small" @click="handleSaveProfile">
              保存更改
            </el-button>
            <el-button size="small" @click="handleCancelEdit">
              取消
            </el-button>
          </div>
        </div>
      </el-popover>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Picture, User, Camera, Edit } from '@element-plus/icons-vue'

const logoData = ref('')
const avatarData = ref('')
const userName = ref('Admin User')
const isEditingName = ref(false)
const logoInput = ref<HTMLInputElement>()
const avatarInput = ref<HTMLInputElement>()
const usernameInput = ref()

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const handleLogoUpload = () => {
  logoInput.value?.click()
}

const handleLogoChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    try {
      const base64 = await convertFileToBase64(file)
      logoData.value = base64
      localStorage.setItem('app_logo', base64)
    } catch (error) {
      console.error('Logo upload failed:', error)
    }
  }
}

const handleAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    try {
      const base64 = await convertFileToBase64(file)
      avatarData.value = base64
      localStorage.setItem('app_avatar', base64)
    } catch (error) {
      console.error('Avatar upload failed:', error)
    }
  }
}

const handleUserClick = () => {
  console.log('User clicked')
}

const handleUserNameEdit = () => {
  isEditingName.value = true
  nextTick(() => {
    usernameInput.value?.focus()
  })
}

const handleUserNameBlur = () => {
  isEditingName.value = false
}

const handleSaveProfile = () => {
  localStorage.setItem('app_username', userName.value)
  isEditingName.value = false
}

const handleCancelEdit = () => {
  isEditingName.value = false
}

onMounted(() => {
  const savedLogo = localStorage.getItem('app_logo')
  if (savedLogo) {
    logoData.value = savedLogo
  }

  const savedAvatar = localStorage.getItem('app_avatar')
  if (savedAvatar) {
    avatarData.value = savedAvatar
  }

  const savedUserName = localStorage.getItem('app_username')
  if (savedUserName) {
    userName.value = savedUserName
  }
})
</script>

<style scoped>
.top-header {
  height: 64px;
  background: linear-gradient(135deg, #7C4DFF 0%, #7B1FA2 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-container {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.logo-container:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.logo-container .logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-container .logo-placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.system-name {
  font-size: 20px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
}

.avatar-container {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-container .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-container .avatar-placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.user-profile-panel {
  padding: 20px;
}

.profile-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
}

.profile-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar .avatar-placeholder {
  color: #909399;
}

.avatar-edit-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.profile-info {
  margin-bottom: 20px;
}

.info-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.username-display {
  font-size: 14px;
  color: #303133;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.username-display:hover {
  background: #e4e7ed;
}

.username-display .edit-icon {
  color: #909399;
  font-size: 14px;
}

.username-input {
  width: 100%;
}

.profile-actions {
  display: flex;
  gap: 12px;
}

.profile-actions .el-button {
  flex: 1;
}
</style>
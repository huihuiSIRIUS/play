<template>
  <aside class="modern-sidebar">
    <nav class="sidebar-menu">
      <div
        v-for="item in menuItems"
        :key="item.key"
        class="menu-item-container"
      >
        <!-- 一级菜单 -->
        <div
          v-if="!item.children"
          :class="['menu-item', { active: activeMenu === item.key }]"
          @click="handleMenuClick(item.key)"
        >
          <el-icon class="menu-icon">
            <component :is="item.icon" />
          </el-icon>
          <span class="menu-text">{{ item.label }}</span>
        </div>
        
        <!-- 带二级菜单的一级菜单 -->
        <div v-else class="menu-item-with-children">
          <div
            :class="['menu-item parent-menu', { active: isParentActive(item) }]"
            @click="toggleSubMenu(item.key)"
          >
            <el-icon class="menu-icon">
              <component :is="item.icon" />
            </el-icon>
            <span class="menu-text">{{ item.label }}</span>
            <el-icon class="menu-arrow" :class="{ rotated: expandedMenus.includes(item.key) }">
              <ArrowRight />
            </el-icon>
          </div>
          
          <!-- 二级菜单 -->
          <div
            v-if="expandedMenus.includes(item.key)"
            class="sub-menu"
          >
            <div
              v-for="child in item.children"
              :key="child.key"
              :class="['sub-menu-item', { active: activeMenu === child.key }]"
              @click.stop="handleMenuClick(child.key)"
            >
              <span class="sub-menu-text">{{ child.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import {
  DataAnalysis,
  Monitor,
  Warning,
  Check,
  Document,
  ArrowRight
} from '@element-plus/icons-vue'
import { ref, computed } from 'vue'

interface MenuItem {
  key: string
  label: string
  icon: any
  children?: MenuItem[]
}

const props = defineProps<{
  activeMenu: string
}>()

const emit = defineEmits<{
  (e: 'menu-click', key: string): void
}>()

const expandedMenus = ref<string[]>([])

const menuItems: MenuItem[] = [
  { key: 'numeric-lab', label: '数值实验室', icon: DataAnalysis },
  { key: 'process-points', label: '工艺测点', icon: Monitor },
  { key: 'alarm-reasons', label: '报警原因发生库', icon: Warning },
  { key: 'realtime-monitoring', label: '实时监测', icon: Monitor },
  { key: 'equipment-monitoring', label: '设备监测管理', icon: Monitor },
  { key: 'alarm-shielding', label: '报警屏蔽管理', icon: Warning },
  { key: 'condition-adaptive', label: '工况自适应', icon: DataAnalysis },
  { key: 'process-alarm-handling', label: '工艺告警处理', icon: Check },
  {
    key: 'alarm-analysis',
    label: '报警分析',
    icon: DataAnalysis,
    children: [
      { key: 'alarm-count-analysis', label: '报警次数分析', icon: '' },
      { key: 'alarm-duration-analysis', label: '报警时长分析', icon: '' },
      { key: 'flood-alarm-analysis', label: '泛滥报警分析', icon: '' },
      { key: 'jitter-alarm-analysis', label: '抖动报警分析', icon: '' },
      { key: 'instant-alarm-analysis', label: '瞬时报警分析', icon: '' },
      { key: 'stale-alarm-analysis', label: '陈旧报警分析', icon: '' }
    ]
  },
  { key: 'version-list', label: '版本列表', icon: Document }
]

const handleMenuClick = (key: string) => {
  emit('menu-click', key)
}

const toggleSubMenu = (key: string) => {
  const index = expandedMenus.value.indexOf(key)
  if (index > -1) {
    expandedMenus.value.splice(index, 1)
  } else {
    expandedMenus.value.push(key)
  }
}

const isParentActive = (item: MenuItem) => {
  if (!item.children) return false
  return item.children.some(child => child.key === props.activeMenu)
}
</script>

<style scoped>
.modern-sidebar {
  width: 240px;
  height: calc(100vh - 64px);
  background: linear-gradient(180deg, #7C4DFF 0%, #7B1FA2 100%);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
}

.modern-sidebar::-webkit-scrollbar {
  width: 4px;
}

.modern-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.modern-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.modern-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.sidebar-menu {
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item-container {
  width: 100%;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.parent-menu {
  justify-content: space-between;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: white;
  border-radius: 0 2px 2px 0;
  transition: height 0.3s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

.menu-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 500;
}

.menu-item.active::before {
  height: 24px;
}

.menu-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.menu-text {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.menu-arrow {
  font-size: 16px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.menu-arrow.rotated {
  transform: rotate(90deg);
}

.sub-menu {
  margin-left: 16px;
  margin-top: 4px;
  margin-bottom: 4px;
  padding-left: 16px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  animation: slideDown 0.3s ease;
}

.sub-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.sub-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

.sub-menu-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-weight: 500;
}

.sub-menu-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 200px;
  }
}
</style>
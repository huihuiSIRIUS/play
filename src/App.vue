<script setup lang="ts">
import { ref } from 'vue'
import NumericLab from './components/NumericLab.vue'
import ProcessPoints from './components/ProcessPoints.vue'
import AlarmReasons from './components/AlarmReasons.vue'
import RealTimeMonitoring from './components/RealTimeMonitoring.vue'
import RealTimeMonitoringAnalysis from './components/RealTimeMonitoringAnalysis.vue'
import ProcessAlarmHandling from './components/ProcessAlarmHandling.vue'
import VersionList from './components/VersionList.vue'
import AlarmCountAnalysis from './components/AlarmCountAnalysis.vue'
import AlarmDurationAnalysis from './components/AlarmDurationAnalysis.vue'
import FloodAlarmAnalysis from './components/FloodAlarmAnalysis.vue'
import JitterAlarmAnalysis from './components/JitterAlarmAnalysis.vue'
import InstantAlarmAnalysis from './components/InstantAlarmAnalysis.vue'
import StaleAlarmAnalysis from './components/StaleAlarmAnalysis.vue'
import EquipmentMonitoring from './components/EquipmentMonitoring.vue'
import AlarmShielding from './components/AlarmShielding.vue'
import ConditionAdaptive from './components/ConditionAdaptive.vue'
import TopHeader from './components/TopHeader.vue'
import ModernSidebar from './components/ModernSidebar.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ElConfigProvider } from 'element-plus'

const activeMenu = ref<string>('numeric-lab')

const handleMenuClick = (menu: string) => {
  activeMenu.value = menu
}

const handleAnalyze = (row: any) => {
  console.log('跳转到分析页面:', row)
  activeMenu.value = 'realtime-monitoring-analysis'
}

const handleBack = () => {
  console.log('返回实时监测页面')
  activeMenu.value = 'realtime-monitoring'
}
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container">
      <TopHeader />

      <div class="main-content">
        <ModernSidebar :active-menu="activeMenu" @menu-click="handleMenuClick" />

        <main class="main">
          <NumericLab v-if="activeMenu === 'numeric-lab'" />
          <ProcessPoints v-if="activeMenu === 'process-points'" />
          <AlarmReasons v-if="activeMenu === 'alarm-reasons'" />
          <RealTimeMonitoring v-if="activeMenu === 'realtime-monitoring'" @analyze="handleAnalyze" />
          <EquipmentMonitoring v-if="activeMenu === 'equipment-monitoring'" />
          <AlarmShielding v-if="activeMenu === 'alarm-shielding'" />
          <ConditionAdaptive v-if="activeMenu === 'condition-adaptive'" />
          <RealTimeMonitoringAnalysis v-if="activeMenu === 'realtime-monitoring-analysis'" @back="handleBack" />
          <ProcessAlarmHandling v-if="activeMenu === 'process-alarm-handling'" />
          <AlarmCountAnalysis v-if="activeMenu === 'alarm-count-analysis'" />
          <AlarmDurationAnalysis v-if="activeMenu === 'alarm-duration-analysis'" />
          <FloodAlarmAnalysis v-if="activeMenu === 'flood-alarm-analysis'" />
          <JitterAlarmAnalysis v-if="activeMenu === 'jitter-alarm-analysis'" />
          <InstantAlarmAnalysis v-if="activeMenu === 'instant-alarm-analysis'" />
          <StaleAlarmAnalysis v-if="activeMenu === 'stale-alarm-analysis'" />
          <VersionList v-if="activeMenu === 'version-list'" />
        </main>
      </div>
    </div>
  </el-config-provider>
</template>

<style scoped>
.app-container {
 display: flex;
  flex-direction: column;
  /* 🔴 关键修改 1：把 min-height 改为 height，并禁止溢出 */
  /* min-height: 100vh;  <-- 删掉这句 */
  height: 100vh;      /* <-- 改成这句：强制高度等于屏幕 */
  overflow: hidden;   /* <-- 加上这句：禁止整个页面出现滚动条 */
  background: #f5f7fa;
}

.main-content {
 display: flex;
  flex: 1;
  /* 确保这个容器不会被子元素撑大 */
  overflow: hidden;
}

.main {
 flex: 1;
  padding: 0;
  
  /* 🔴 关键修改 2：只允许这里滚动 */
  overflow-y: auto; 
  height: 100%; /* 确保占满父容器高度 */
  
  background: #f5f7fa;
}

.main::-webkit-scrollbar {
  width: 6px;
}

.main::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.main::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.main::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
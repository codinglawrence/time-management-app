<template>
  <div class="more-page">
    <div class="custom-nav-bar">
      <div class="nav-left">
        <van-icon name="menu" class="nav-icon" />
      </div>
      <div class="nav-title">更多</div>
      <div class="nav-right">
        <van-icon name="ellipsis" class="nav-icon" />
      </div>
    </div>
    
    <div class="more-content">
      <van-cell-group class="menu-section">
        <van-cell 
          title="报告[待完成]" 
          class="menu-item"
          :border="false"
        >
          <template #icon>
            <van-icon name="data-analysis" size="20" />
          </template>
          <template #right>
            <van-icon name="arrow" />
          </template>
        </van-cell>
        <van-cell 
          title="设置[待完成]" 
          class="menu-item"
          :border="false"
        >
          <template #icon>
            <van-icon name="settings" size="20" />
          </template>
          <template #right>
            <van-icon name="arrow" />
          </template>
        </van-cell>
        <van-cell 
          title="登录/同步[待完成]" 
          class="menu-item"
          :border="false"
        >
          <template #icon>
            <van-icon name="cloud-upload" size="20" />
          </template>
          <template #right>
            <van-icon name="arrow" />
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group class="menu-section">
        <van-cell 
          title="帮助" 
          class="menu-item"
          :border="false"
        >
          <template #icon>
            <van-icon name="question-circle" size="20" />
          </template>
          <template #right>
            <van-icon name="arrow" />
          </template>
        </van-cell>
        <van-cell 
          title="关于" 
          class="menu-item"
          :border="false"
          @click="showAboutDialog"
        >
          <template #icon>
            <van-icon name="info-circle" size="20" />
          </template>
          <template #right>
            <van-icon name="arrow" />
          </template>
        </van-cell>
      </van-cell-group>
      

    </div>
  </div>
</template>

<script setup lang="ts">
import { showDialog } from 'vant'

// 显示关于对话框
const showAboutDialog = () => {
  showDialog({
    title: '关于',
    message: 'coded by lawrence\ninspired by wave\nversion 1.0.0',
    theme: 'round-button',
  }).then(() => {
    // on close
  })
}
</script>

<style scoped>
.more-page {
  height: 100%;
  background-color: #F9F9FB;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif;
  display: flex;
  flex-direction: column;
}

.more-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.custom-nav-bar {
  background-color: #6366F1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-title {
  color: #ffffff;
  font-size: 17px;
  font-weight: 500;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  letter-spacing: -0.5px;
}

.nav-right {
  display: flex;
  align-items: center;
}

.nav-icon {
  font-size: 20px;
  color: #ffffff;
}

.menu-section {
  background-color: white;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.menu-item {
  padding: 16px;
  transition: all 0.3s ease;
}

.menu-item:active {
  background-color: #F9F9FB;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>
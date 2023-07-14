<template>
  <Layout>
    <template #aside-ads-after>
      <img :src="webSiteLogo" />
    </template>
  </Layout>
</template>

<script lang='ts' setup>
import DefaultTheme from 'vitepress/theme'
import { webSiteLogo } from '../utils/constant'

const { Layout } = DefaultTheme
</script>

<style scoped>
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
<script setup lang='ts'>

import '@/assets/card.styl'
import { CubeTransparentIcon } from '@heroicons/vue/24/outline'
import LogoutButton from '@/components/buttons/LogoutButton.vue'

</script>

<template lang='pug'>
.home-card.card
  .home-card-nav-buttons-container
    RouterLink.home-nav-card(to='schemas')
      CubeTransparentIcon.icon
      .home-nav-card-title Схемы
  LogoutButton.home-card-button
</template>

<style lang='stylus'>
.home-card.card
  height 300px
  border-radius 16px
  justify-content center
  align-items center

  .home-nav-card
    padding 1rem 2rem
    display inline-block
    background-color var(--color-card-mute)
    border-radius 16px
    cursor default

    &:hover
      background-color var(--color-card-hover)

    .icon
      margin-bottom 1rem
      width 3.5rem

    .home-nav-card-title
      font-weight 500
      text-align center

  .home-card-button.icon-button.logout
    position absolute
    left 16px
    bottom 16px
</style>
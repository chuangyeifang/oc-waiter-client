<template>
  <div class="chat-main">
    <oc-chat-info />
    <oc-chat-pane />
    <oc-chat-message />
  </div>
</template>

<style scoped>
.chat-main {
    display: flex;
    width: 100%;
    flex-direction: column;
    flex: 1;
    background-color: #fff;
    border: 1px solid #e5e5e5;
    border-top: 0;
}
</style>

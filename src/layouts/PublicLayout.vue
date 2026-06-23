<template>
  <v-app>
    <v-main class="public-layout">
      <v-container class="public-layout__container" fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.public-layout {
  background:
    radial-gradient(circle at top left, var(--color-primary-soft), transparent 32rem),
    radial-gradient(circle at bottom right, var(--color-accent-soft), transparent 30rem),
    linear-gradient(180deg, var(--color-surface-soft) 0%, var(--color-bg) 100%);
}

.public-layout__container {
  min-height: 100vh;
  padding: var(--space-5);
}

@media (min-width: 760px) {
  .public-layout__container {
    display: grid;
    align-items: center;
    padding-block: var(--space-8);
  }
}
</style>

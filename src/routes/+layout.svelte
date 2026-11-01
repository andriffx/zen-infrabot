<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<div class="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
  {@render children()}
</div>

<script lang="ts">
  import LocalFilePicker from '$lib/Components/LocalFilePicker.svelte';
  import Footer from '$lib/Components/Footer.svelte';

  function handleFiles(files: File[]) {
    console.log(files);
  }
</script>

<svelte:head>
  <title>Cropybara</title>
</svelte:head>

<main>
  <div></div>
  <LocalFilePicker onFiles={handleFiles} />
  <div class="footer">
    <Footer />
  </div>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
  }

  .footer {
    margin-bottom: 3em;
  }

  @supports (height: 100dvh) {
    /** vh unit computes the viewport size without factoring in the toolbar height */
    main {
      height: 100dvh;
    }
  }
</style>

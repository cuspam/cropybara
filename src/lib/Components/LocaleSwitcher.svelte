<script lang="ts">
  import { m } from '$lib/paraglide/messages.js';
  import { getLocale, setLocale, locales } from '$lib/paraglide/runtime';
</script>

{#each locales as locale (locale)}
  {#if getLocale() !== locale}
    <a
      href={`#locale-${locale}`}
      onclick={(e) => {
        e.preventDefault();
        setLocale(locale);
      }}
      >{`LocaleSwitcher_Locale_${locale}` in m ? m[`LocaleSwitcher_Locale_${locale}`]() : locale}</a
    >
  {/if}
{/each}

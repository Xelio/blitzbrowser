<script lang="ts">
  import { page } from '$app/state';
  import * as Breadcrumb from '$lib/components/ui/breadcrumb';

  let breadcrumb_items: { title: string; href?: string }[] = $state([]);

  $effect(() => {
    if (page.url.pathname === '/') {
      breadcrumb_items = [{ title: 'Browsers', href: '/' }];
      return;
    }

    const path = page.url.pathname.split('/');

    if (path.length === 4 && path[3] === 'live-view') {
      breadcrumb_items = [
        { title: 'Browsers', href: '/' },
        { title: path[2], href: '/' },
        { title: 'Live View' },
      ];
    }
  });
</script>

<Breadcrumb.Root>
  <Breadcrumb.List>
    {#each breadcrumb_items as item, index}
      {#if item.href}
        <Breadcrumb.Item class="hidden md:block">
          <Breadcrumb.Link href={item.href}>
            {item.title}
          </Breadcrumb.Link>
        </Breadcrumb.Item>
      {:else}
        <Breadcrumb.Item>
          <Breadcrumb.Page>{item.title}</Breadcrumb.Page>
        </Breadcrumb.Item>
      {/if}
      {#if index + 1 < breadcrumb_items.length}
        <Breadcrumb.Separator />
      {/if}
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>

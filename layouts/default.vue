<template>
	<div class="header-back">
		<page-header />
		<Nuxt />
	</div>
</template>

<script>
import colorScheme from "@/mixins/color-scheme";

export default {
	name: "Default",
	mixins: [colorScheme]
}
</script>

<style>
@import '@mdi/font/css/materialdesignicons.min.css';
</style>

<script setup lang="ts">
interface Props {
	navOpen: boolean;
	isDark?: boolean;
}

const { navOpen, isDark } = defineProps<Props>();

const emit = defineEmits<{
	(e: 'click'): void;
}>();

const showtip = ref<boolean>(false);

import { useFloating, offset, autoUpdate } from '@floating-ui/vue';
import { ref } from 'vue';

const reference = ref<HTMLElement>();
const float = ref<HTMLElement>();

const { floatingStyles } = useFloating(reference, float, {
	placement: 'right',
	middleware: [offset(14)],
	whileElementsMounted: autoUpdate,
});
</script>

<template>
	<button
		ref="reference"
		class="navbutton"
		:class="{ expanded: navOpen }"
		label="Toggle Dark Mode"
		type="button"
		@blur="showtip = false"
		@click="emit('click')"
		@focus="showtip = true"
		@mouseenter="showtip = true"
		@mouseleave="showtip = false"
	>
		<div class="spinner-outer">
			<span aria-hidden="true" class="material-symbols-rounded icon" :class="{ up: isDark }"> wb_sunny </span>
			<span aria-hidden="true" class="material-symbols-rounded icon" :class="{ up: !isDark }"> dark_mode </span>
		</div>
		<span class="label label-large" :style="{ color: isDark ? '#fff' : '#000' }">{{
			'Switch to ' + (isDark ? 'Light' : 'Dark') + ' Mode'
		}}</span>
	</button>
	<div
		ref="float"
		aria-hidden="true"
		class="float label-large"
		:class="{ shown: !navOpen && showtip }"
		:style="floatingStyles"
	>
		{{ 'Switch to ' + (isDark ? 'Light' : 'Dark') + ' Mode' }}
	</div>
</template>

<style scoped>
.navbutton {
	position: relative;
	top: -4px;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	flex-shrink: 0;
	gap: var(--padding-xs, 8px);
	border: none;
	width: 100%;
	height: 48px;
	padding: var(--padding-s, 12px);
	border-radius: var(--radius-m, 8px);
	background: transparent;
	overflow: hidden;
	transition-property: background-color, width, color;
	cursor: pointer;
	&.active {
		background: var(--navigation-active, #0a4869);
	}
	&:hover {
		background: var(--navigation-hover, #0a4869);
	}
	&:active {
		background: var(--navigation-pressed, #103b52);
	}
	&:focus-visible {
		position: relative;
		z-index: 1;
		outline: 4px solid var(--navigation-focus, #3f89b0);
		outline-offset: 2px;
	}

	&.expanded {
		& .label {
			color: var(--navigation-text, #fff);
		}
	}
}

.spinner-outer {
	height: 24px;
	width: 24px;
	flex-shrink: 0;

	position: relative;
}

.icon {
	top: 0px;
	left: 0px;
	position: absolute;
	color: var(--navigation-icon, #8aabd1);
	transform-origin: 50% 150%;
	transform: rotate(180deg);
	animation: goout 0.3s var(--JCA);
	&.up {
		animation: comein 0.3s var(--JCA);
		transform: rotate(0deg);
	}
}

@keyframes comein {
	0% {
		transform: rotate(180deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
@keyframes goout {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(180deg);
	}
}

.label {
	color: transparent;
	overflow: hidden;
	white-space: nowrap;
	padding: 0px var(--padding-2xs, 4px);
	width: 100%;
	text-align: start;
}

.navbutton:hover .label:hover {
	color: var(--navigation-text, #fff);
}

.float {
	opacity: 0;
	pointer-events: none;
	display: flex;
	padding: var(--padding-2xs, 4px) var(--padding-xs, 8px);
	align-items: center;
	min-width: max-content;
	gap: 8px;
	border-radius: var(--radius-s, 4px);
	background: var(--background-inverted, #122336);
	box-shadow: 0px 8px 16px 0px var(--surface-elevation-12, rgba(30, 30, 31, 0.12));
	color: var(--text-inverted-white, #fff);
	transition-property: background-color, color, opacity;
	&.shown {
		opacity: 1;
	}
}
</style>

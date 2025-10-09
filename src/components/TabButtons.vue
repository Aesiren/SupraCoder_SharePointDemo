<script lang="ts" setup>
import { ref } from 'vue';
import { useGeneralStore } from '@/stores/generalStore';

// ==================== //
//      Tab Buttons     //
// ==================== //

// ===== Props
// id: optional
// tabindex: optional, if you want to remove from or modify tab order
// top: option boolean, add 'top' to attributes to make icons appear above the labels.
// secondary: optional boolean, add 'secondary' to attributes to get the clearer variant.
// 		note: 'top' is only active when 'secondary' is off.
// tabs: required Array<{ icon: string; label: string; value: string }>, defines tab number and content
// width: optional string, overrides flex to set a shared width amongst tabs
// aria-controls: optional string, indicates what element is being controlled by the tabs.

// ===== v-model: string
// The modeled variable will receive the clicked tab value and control the active state of the tabs.

export interface TabDef {
	icon?: string;
	label: string;
	value: string;
}

interface Props {
	id?: string;
	tabindex?: string;
	top?: boolean;
	secondary?: boolean;
	tabs: Array<TabDef>;
	ariaControls?: string;
}

const props = defineProps<Props>();
const model = defineModel<string>();
const generalStore = useGeneralStore();

const getTabHoverStyle = () => ({
	background: generalStore.isDark
		? 'var(--ADS-neutral-subtle-hover, #174880)'
		: 'var(--ADS-neutral-subtle-hover, #cdd0d1)',
});

const hoveredTab = ref<number | null>(null);
</script>

<template>
	<div
		:id="props.id"
		class="wrapper"
		:style="{
			'--tabs-count': props.tabs.length,
		}"
	>
		<button
			v-for="(tab, index) in props.tabs"
			:key="index"
			:aria-controls="props.ariaControls"
			class="tab"
			:class="{ secondary: props.secondary, active: model === tab.value }"
			:tabindex="props.tabindex || '0'"
			type="button"
			@click="model = tab.value"
			@mouseover="hoveredTab = index"
			@mouseleave="hoveredTab = null"
			:style="hoveredTab === index ? getTabHoverStyle() : {}"
		>
			<div class="tab-inner" :class="{ top: props.top && !props.secondary }">
				<span class="label">
					{{ tab.label }}
				</span>
			</div>
		</button>
	</div>
</template>

<style scoped>
.material-symbols-outlined {
	font-family: 'Material Symbols Outlined';
	font-weight: normal;
	font-style: normal;
	font-size: 24px;
	line-height: 1;
	letter-spacing: normal;
	text-transform: none;
	display: inline-block;
	white-space: nowrap;
	word-wrap: normal;
	direction: ltr;
	font-feature-settings: 'liga';
	-webkit-font-feature-settings: 'liga';
	-webkit-font-smoothing: antialiased;
	user-select: none;
	color: var(--icon-default);
}

.wrapper {
	display: grid;
	justify-content: stretch;
	height: auto;
	width: 100%;
	grid-template-columns: repeat(var(--tabs-count), 1fr);
}

@media (max-width: 768px) {
	.wrapper {
		display: grid;
		grid-template-columns: repeat(var(--tabs-count), 1fr);
		width: 100%;
	}
}

.tab-inner {
	padding: 12px 0 9px 0;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	border-bottom: 3px solid rgba(0, 0, 0, 0);
	transition: all 0.2s ease-out;
}

.tab-inner.top {
	flex-direction: column;
	padding: 4px 0 5px 0;
}

.label {
	padding: var(--padding-2xs);
	color: var(--text-default);
	font-size: var(--font-size-2xs);
	font-weight: var(--wt-medium);
	line-height: 150%;
	text-align: center;
}

.tab {
	flex: 1 1 33.33%;
	padding: 0 var(--padding-m);
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	border: none;
	cursor: pointer;
	transition: border 0.2s ease-out;
	width: 200px;
	min-width: 140px;
	min-width: fit-content;
	width: 100%;
	box-sizing: border-box;
	background: transparent;
	border-bottom: 3px solid transparent;
}

.tab.active {
	border-bottom: 3px solid var(--text-default);
}

.tab.secondary {
	background-color: transparent;
	padding: 0px;
}

.tab.secondary > .tab-inner {
	width: 100%;
	padding: 8px 16px 5px 16px;
}

.tab {
	&:hover {
		/* Using a computed style for hover background */
		@include getTabHoverStyle();
	}
}

.tab:focus-visible {
	outline: 4px solid var(--focus-default);
	outline-offset: 2px;
	z-index: 1;
}

/* First Tab: Round the top left corners */
.tab:first-child {
	border-top-left-radius: 4px;
}

/* Last Tab: Round the top right corners */
.tab:last-child {
	border-top-right-radius: 4px;
}

/* Make the buttons responsive when screen width is smaller */
@media (max-width: 768px) {
	.tab {
		min-width: auto;
		padding: 0 var(--padding-xs);
	}
}

@media (max-width: 480px) {
	.tab {
		min-width: auto;
		padding: 0 var(--padding-xs);
	}

	.label {
		font-size: var(--font-size-xs);
	}
}
</style>

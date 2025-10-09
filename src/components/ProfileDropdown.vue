<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { AtlasIcon } from '@sscatlas/atlas-design-system-vue';

const props = defineProps<{
    open: boolean;
    isDark: boolean;
    currentRole: 'rater' | 'ratee';
}>();
const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'switch-role', role: 'rater' | 'ratee'): void;
    (e: 'toggle-dark'): void;
}>();

const modalRef = ref<HTMLElement | null>(null);

function handleClickOutside(event: MouseEvent) {
    if (modalRef.value && !modalRef.value.contains(event.target as Node)) {
        emit('close');
    }
}

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
});
onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});

watch(() => props.open, (val) => {
    if (val) {
        setTimeout(() => {
            modalRef.value?.focus();
        }, 0);
    }
});

function getProfileUrl() {
    return '#'; // TODO: Replace with real profile URL
}
</script>

<template>
    <div class="profile-modal" v-if="open" ref="modalRef" tabindex="-1" @mousedown.stop @click.stop>
        <div class="profile-modal-content">
            <a class="profile-link" :href="getProfileUrl()" target="_blank" rel="noopener noreferrer">
                View My Profile
            </a>
            <hr class="divider" />
            <div class="profile-section">
                <div class="profile-section-label">Switch Role</div>
                <button class="role-btn" :class="{ active: currentRole === 'rater' }"
                    @click="$emit('switch-role', 'rater')">
                    <AtlasIcon v-if="currentRole === 'rater'">check_circle</AtlasIcon>
                    <AtlasIcon v-else>circle</AtlasIcon>
                    Rater Role (Supervisor)
                </button>
                <button class="role-btn" :class="{ active: currentRole === 'ratee' }"
                    @click="$emit('switch-role', 'ratee')">
                    <AtlasIcon v-if="currentRole === 'ratee'">check_circle</AtlasIcon>
                    <AtlasIcon v-else>circle</AtlasIcon>
                    Ratee Role (Subordinate)
                </button>
            </div>
            <hr class="divider" />
            <div class="darkmode-section">
                <label class="switch">
                    <input type="checkbox" :checked="isDark" @change.stop="$emit('toggle-dark')" />
                    <span class="slider"></span>
                </label>
                <span>Switch to Dark Mode</span>
            </div>
        </div>
    </div>
</template>



<style scoped lang="css">
.profile-modal {
    position: absolute;
    top: 90px;
    right: 28px;
    z-index: 1000;
    border-radius: var(--radius-l, 16px);
    background: var(--background-default, #FFF);
    box-shadow: 0px 4px 12px 0px var(--ads-surface-elevation-16, rgba(30, 30, 31, 0.16));
    min-width: 260px;
    outline: none;
}

.profile-modal-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px 20px 20px 20px;
}

.profile-link {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-default, #1E1E1F);
    text-decoration: none;
    font-weight: 500;
    font-size: 1rem;
    transition: color 0.2s;
}

.profile-link:hover {
    color: var(--link-hover, #103b52);
}

.external-icon {
    font-size: 18px;
    vertical-align: middle;
}

.profile-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    color: var(--text-default, #1E1E1F);
    text-overflow: ellipsis;
    font-family: var(--font-primary, "Roboto Flex");
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 150%;
    /* 24px */
    letter-spacing: 0.1px;
}

.profile-section-label {
    font-weight: 600;
    margin-bottom: 2px;
}

.role-btn {
    background: transparent;
    color: var(--text-default, #222);
    border: none;
    border-radius: var(--radius-m, 8px);
    padding: 8px 12px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
}

.darkmode-section {
    flex-direction: row;
    align-items: center;
    display: flex;
    gap: 12px;
    font-weight: 500;
}

.switch {
    position: relative;
    display: inline-block;
    width: 38px;
    height: 22px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--neutral-subtle-default, #ccc);
    border-radius: 22px;
    transition: background 0.2s;
}

.switch input:checked+.slider {
    background-color: var(--primary, #0a4869);
}

.slider:before {
    position: absolute;
    content: '';
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background-color: #fff;
    border-radius: 50%;
    transition: transform 0.2s;
}

.switch input:checked+.slider:before {
    transform: translateX(16px);
}
</style>

<template>
  <!-- Tutorial Modal -->
  <ModalBase 
    v-if="uiStore.activeModal === 'tutorial'" 
    @close="uiStore.hideModal"
    title="Welcome to the Vectoverse!"
  >
    <TutorialModal />
  </ModalBase>

  <!-- Analysis Modal -->
  <ModalBase 
    v-if="uiStore.activeModal === 'analysis'" 
    @close="uiStore.hideModal"
    title="🔬 Advanced Analysis"
  >
    <AnalysisModal />
  </ModalBase>

  <!-- Upload Help Modal -->
  <ModalBase 
    v-if="uiStore.activeModal === 'uploadHelp'" 
    @close="uiStore.hideModal"
    title="📁 Vector Matrix Upload Guide"
  >
    <UploadHelpModal />
  </ModalBase>

  <!-- Activation Help Modal -->
  <ModalBase 
    v-if="uiStore.activeModal === 'activationHelp'" 
    @close="uiStore.hideModal"
    title="🔌 Neural Activation Functions Guide"
  >
    <ActivationHelpModal />
  </ModalBase>

  <!-- Add Vector Modal -->
  <ModalBase 
    v-if="uiStore.activeModal === 'addVector'" 
    @close="uiStore.hideModal"
    title="➕ Add Custom Vector"
  >
    <AddVectorModal />
  </ModalBase>

  <!-- Export Modal -->
  <ModalBase 
    v-if="uiStore.activeModal === 'export'" 
    @close="uiStore.hideModal"
    title="💾 Export Data"
  >
    <ExportModal />
  </ModalBase>

  <!-- Presets Modal -->
  <ModalBase 
    v-if="uiStore.activeModal === 'presets'" 
    @close="uiStore.hideModal"
    title="📁 Vector Matrix Presets"
  >
    <PresetsModal @close="uiStore.hideModal" />
  </ModalBase>

  <!-- Keyboard Shortcuts Modal -->
  <ModalBase 
    v-if="uiStore.activeModal === 'shortcuts'" 
    @close="uiStore.hideModal"
    title="⌨️ Keyboard Shortcuts"
  >
    <ShortcutsModal />
  </ModalBase>

  <!-- Error/Success Notifications -->
  <Notification 
    v-if="uiStore.hasSuccess"
    type="success"
    :message="uiStore.successMessage"
    @close="uiStore.hideSuccess"
  />

  <ErrorNotification
    v-if="uiStore.hasError"
    :notification="uiStore.errorDetails"
    @close="uiStore.hideError"
  />

  <!-- Other Modals -->
  <SettingsModal />
  <VectorComparisonModal />
</template>

<script setup>
import { useUIStore } from '../stores/uiStore'
import ModalBase from './modals/ModalBase.vue'
import TutorialModal from './modals/TutorialModal.vue'
import AnalysisModal from './modals/AnalysisModal.vue'
import UploadHelpModal from './modals/UploadHelpModal.vue'
import ActivationHelpModal from './modals/ActivationHelpModal.vue'
import ShortcutsModal from './modals/ShortcutsModal.vue'
import AddVectorModal from './modals/AddVectorModal.vue'
import ExportModal from './modals/ExportModal.vue'
import PresetsModal from './modals/PresetsModal.vue'
import Notification from './Notification.vue'
import ErrorNotification from './ErrorNotification.vue'
import SettingsModal from './modals/SettingsModal.vue'
import VectorComparisonModal from './modals/VectorComparisonModal.vue'

const uiStore = useUIStore()
</script> 
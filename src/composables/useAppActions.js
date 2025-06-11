import { ref } from 'vue'
import { useVectorStore } from '@/stores/vectorStore'
import { useUIStore } from '@/stores/uiStore'

export function useAppActions() {
    const vectorStore = useVectorStore()
    const uiStore = useUIStore()

    const exportData = () => {
        try {
            const data = {
                vectors: vectorStore.vectors,
                config: {
                    dimensions: vectorStore.dimensions,
                    forceType: vectorStore.forceType,
                    activationFunction: vectorStore.activationFunction
                },
                timestamp: new Date().toISOString()
            }
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `vectoverse-export-${Date.now()}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            
            uiStore.showSuccess('Data exported successfully')
        } catch (error) {
            console.error('Export error:', error)
            uiStore.showError('Failed to export data')
        }
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }

    return {
        exportData,
        toggleFullscreen
    }
} 
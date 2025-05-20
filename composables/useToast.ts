import { toast } from 'vue-sonner'
import { useColorMode } from '@vueuse/core'

export default function useToast() {
  const mode = useColorMode()

  const show = {
    success: (message: string, action?: { label: string, onClick: () => void }) =>
      toast.success(message, {
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined,
        invert: mode.value === 'dark'
      }),

    error: (message: string, action?: { label: string, onClick: () => void }) =>
      toast.error(message, {
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined,
        invert: mode.value === 'dark'
      }),

    warning: (message: string, action?: { label: string, onClick: () => void }) =>
      toast.warning(message, {
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined,
        invert: mode.value === 'dark'
      }),

    info: (message: string, action?: { label: string, onClick: () => void }) =>
      toast(message, {
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined,
        invert: mode.value === 'dark'
      }),

    loading: (message: string) =>
      toast.loading(message, {
        invert: mode.value === 'dark'
      }),

    promise: <T>(promise: Promise<T>, options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
      action?: { label: string, onClick: () => void }
    }) =>
      toast.promise(promise, {
        ...options,
        action: options.action ? {
          label: options.action.label,
          onClick: options.action.onClick
        } : undefined,
        invert: mode.value === 'dark'
      })
  }

  const dismiss = (id?: string) => toast.dismiss(id)
  const dismissAll = () => toast.dismiss()

  return {
    show,
    dismiss,
    dismissAll
  }
}

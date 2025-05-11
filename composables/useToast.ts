import { toast } from 'vue-sonner'

export function useToast() {
  const show = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    warning: (message: string) => toast.warning(message),
    info: (message: string) => toast(message),
    loading: (message: string) => toast.loading(message),
    promise: (promise: Promise<any>, options: {
      loading: string
      success: string | ((data: any) => string)
      error: string | ((error: Error) => string)
    }) => toast.promise(promise, options)
  }

  const dismiss = (id?: string) => toast.dismiss(id)

  return {
    show,
    dismiss
  }
}

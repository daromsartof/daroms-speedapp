import { haptic } from '@daroms/lib/haptics'
import { Toast, toast as tamaguiToast } from 'tamagui'

/**
 * @catalog Toast
 * @props <Toaster /> monté une fois à la racine (AppProvider le fait) ; notify.success|error|info(message)
 * @example notify.success(t('todos.saved'))
 */
export function Toaster() {
  return (
    <Toast position="top-center" duration={3500} swipeDirection="up">
      <Toast.Viewport>
        <Toast.List />
      </Toast.Viewport>
    </Toast>
  )
}

/** Notifications courtes avec retour haptique assorti. */
export const notify = {
  success(message: string, description?: string) {
    haptic('success')
    return tamaguiToast.success(message, { description })
  },
  error(message: string, description?: string) {
    haptic('error')
    return tamaguiToast.error(message, { description })
  },
  info(message: string, description?: string) {
    return tamaguiToast(message, { description })
  },
  dismiss: (id?: string | number) => tamaguiToast.dismiss(id),
}

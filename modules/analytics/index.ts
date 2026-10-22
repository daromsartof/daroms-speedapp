import { defineModule } from '@daroms/app'

import { AnalyticsProvider } from './AnalyticsProvider'
import { analyticsConfig } from './config'

export default defineModule({
  slug: 'analytics',
  config: analyticsConfig,
  Provider: AnalyticsProvider,
})

export { flush, track, trackScreen } from './tracker'

import { defineModule } from '@daroms/app'

import { {{camel}}Config } from './config'
import en from './locales/en.json'
import fr from './locales/fr.json'

export default defineModule({
  slug: '{{slug}}',
  config: {{camel}}Config,
  locales: { fr: { {{camel}}: fr }, en: { {{camel}}: en } },
})

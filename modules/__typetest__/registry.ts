// Vérification de typage : tous les modules du cœur entrent dans un registre d'app.
import type { ModuleRegistry } from '@daroms/app'

import aiChat from '../ai-chat'
import analytics from '../analytics'
import auth from '../auth'
import camera from '../camera'
import maps from '../maps'
import onboarding from '../onboarding'
import payments from '../payments'
import push from '../push'
import settings from '../settings'

export const registry: ModuleRegistry = [aiChat, analytics, auth, camera, maps, onboarding, payments, push, settings]

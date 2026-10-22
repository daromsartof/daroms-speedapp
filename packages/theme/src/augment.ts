// Le type de config est identique pour toutes les marques (seules les valeurs changent) :
// le déclarer ici type tokens et thèmes partout, dans le cœur comme dans les apps.
import type { DaromsTamaguiConfig } from './config'

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends DaromsTamaguiConfig {}
}

declare module '@tamagui/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends DaromsTamaguiConfig {}
}

export {}

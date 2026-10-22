import { {{queryHook}} } from './api'

/** Logique de l'écran {{Name}} : données serveur + état local. */
export function use{{Name}}Screen() {
  const query = {{queryHook}}()
  return { query }
}

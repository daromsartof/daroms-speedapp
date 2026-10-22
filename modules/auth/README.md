# Module auth

Connexion Supabase : e-mail + mot de passe, Apple (jeton natif), Google (OAuth PKCE). Gate de connexion, profil, suppression de compte.

- Activer : `bun daroms module add auth` (ajoute routes `(auth)/*`, migration `profiles`, edge function `delete-account`).
- Config (`manifest.modules.auth`) : `providers` (`email`, `apple`, `google`), `requireAuth`.
- Supabase : activer les fournisseurs Apple et Google dans Auth > Providers ; ajouter `<scheme>://**` aux URL de redirection.
- Déployer la fonction : `bunx supabase functions deploy delete-account`.
- Profil : `useProfile()` ; déconnexion : `signOut()`.

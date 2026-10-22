# Module push

Notifications push Expo. Requiert `auth` (jeton rattaché à l'utilisateur).

- Activer : `bun daroms module add push` (migration `push_tokens`, edge function `send-push`).
- Build de dev requis (pas d'Expo Go) ; projet EAS requis pour le jeton (`bun daroms build development`).
- Envoyer : `POST /functions/v1/send-push` avec `Authorization: Bearer <service_role>` et `{ user_id, title, body, url }` (depuis le serveur uniquement).
- `url` (ex. `/todos/42`) est ouverte au toucher de la notification.

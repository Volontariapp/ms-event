## Domaine ms-event

Gère les Events (sorties bénévolat), leurs Tags et leurs Requirements (besoins en
ressources/bénévoles). Entités (via `@volontariapp/domain-event`, package npm partagé
qui porte tout le domaine : entities, services, repositories Postgres, value-objects,
géocoding) :

- `EventEntity` : title/description, startAt/endAt, location (géocodée), type
  (`EventType`: SOCIAL/ECOLOGY), state (`EventState`: DRAFT/PUBLISHED/IN_PROGRESS/
  FINISHED/CANCELLED), `saga_status` (`SagaStatus`), awardedImpactScore,
  maxParticipants/currentParticipants, organizerId, tags[], requirements[].
- `RequirementEntity` : name, quantity/currentQuantity, isSystem, createdBy/updatedBy.
- `TagEntity` : slug, name, balise, updatedBy.

Ce repo (ms-event) ne contient PAS la logique domaine (services/repos) : elle vit dans
le package npm `@volontariapp/domain-event`. ms-event fournit uniquement les controllers
gRPC, DTOs/transformers, migrations DB (schema + triggers), et l'intégration outbox.

## Outbox / événements

- `event_queue` (CDC via triggers Postgres `EVENTS_TRIGGER`, `REQUIREMENTS_TRIGGER`,
  `TAGS_TRIGGER`, `EVENT_TAGS_TRIGGER` importés de `@volontariapp/domain-event`,
  installés dans la migration `SetupEventTriggers`) : capture insert/update/delete sur
  `events`, `requirements`, `tags`, `event_tags` avec payload `{before, after}`. C'est le
  mécanisme d'outbox transactionnel pour publier les changements de state du domaine
  Event.
- `jobs_outbox` (table `JobsOutboxModel`, via `@volontariapp/outbox`) : utilisé
  uniquement comme fallback. Dans `BaseCommandController.withFallback`, si une commande
  gRPC (`createEvent`, `updateEvent`, `changeEventState`, `manageRequirements`,
  `deleteEvent`) échoue avec une erreur non-client (pas 400/404/409), un job de type
  `JobMessagingType.FALLBACK_CREATE_EVENT` (ou UPDATE/CHANGE_EVENT_STATE/
  MANAGE_REQUIREMENTS/DELETE_EVENT) est poussé vers la queue `EventsQueue.FALLBACK_EVENTS`
  avec `emitter: 'ms-event'`, puis l'erreur `FALLBACK_ACTIVATED` est renvoyée à l'appelant.
- ms-event ne consomme aucun événement domaine (pas de `@Processor`/worker BullMQ dans
  `src/`) ; il ne fait que produire vers `event_queue`/`jobs_outbox`.

## gRPC exposé (proto `volontariapp.event`, proto-registry/proto/volontariapp/event)

- `EventCommandService` : CreateEvent, UpdateEvent (avec `update_mask`), ChangeEventState,
  ManageRequirements (add/remove requirement, oneof), DeleteEvent.
- `EventQueryService` : GetEvent, GetEventsByIds, SearchEvents (recherche avancée:
  zone géo, types, tag_slugs, statuts, pagination), ListRequirements,
  GetUserCreatedEvents, GetUserParticipatedEvents, GetUserWishedEvents.
- `TagCommandService` : CreateTag, UpdateTag, DeleteTag.
- `TagQueryService` : GetTags.

## Dépendance gRPC sortante

`SocialParticipationQueryClientService` (client gRPC vers le service de participation,
package `SOCIAL_PACKAGE`) interroge `ParticipationQueryServiceClient` pour résoudre les
ids d'events créés/participés/souhaités par un user, avant que ms-event ne récupère les
`EventEntity` correspondantes en local (findById). Propage un `x-internal-token` en
metadata gRPC.

## Règles métier observées

- `ManageRequirements` : erreur `REQUIREMENT_NOT_FOUND` si `remove.requirementId` ne
  correspond à aucun requirement existant sur l'event.
- La suppression de requirement ne passe pas par `updatedBy` (limitation connue,
  commentée dans le code : "event updates do not have updatedBy yet").
- Géocoding avec stratégie primaire OpenStreetMap + fallback Google Maps
  (`GeocodingService` composé avec `OpenStreetMapStrategy`/`GoogleMapsStrategy`,
  désactivé en env de test).
- Les erreurs client (400/404/409) ne déclenchent jamais de fallback outbox ; seules les
  erreurs serveur/inattendues le font.

---

## 🚀 RTK - Rust Token Killer (Optimized)

All shell commands (`git`, `npm`, `jest`, etc.) are automatically proxied via `rtk` for 80% token savings.

- **Direct Usage:** `rtk gain` (analytics), `rtk discover` (missed savings).
- **Files:** Use `rtk read <file>`, `rtk ls`, `rtk find`, `rtk grep` for compressed agent output.

# Microservice Event (ms-event)

## Project Overview & Value Proposition

Le microservice **`ms-event`** est le cœur du système de volontariat de la plateforme Volontariapp. Il permet de gérer le cycle de vie complet des événements de volontariat : création, inscription des participants, annulation et gestion des quotas.

Pensé comme un service interne accessible uniquement en gRPC, il interagit de manière fluide avec le reste du système (l'API Gateway pour les requêtes entrantes, les autres microservices de manière asynchrone) en s'appuyant sur une architecture de type Event-Driven et Domain-Driven Design (DDD).

## Key Features

- **Gestion des Événements** : Cycle de vie des missions de volontariat et des inscriptions.
- **Communication gRPC** : Définition formelle des endpoints dans `proto-registry`.
- **Validation Déléguée (RBAC)** : Traitement basé sur le Token Interne de sécurité issu de l'API Gateway.
- **Pattern Outbox Transactionnel** : Insertion simultanée en base des changements d'état (ex: `EventCreated`, `UserRegistered`) et des événements asynchrones à destination des `outbox-runners`.
- **Couplage Métier Isolé (DRY)** : Utilise `@volontariapp/domain-event` importé depuis le registre interne `npm-packages`.

## Tech Stack & Dependencies

| Composant                 | Technologie                     | Usage / Rôle                                                 |
| :------------------------ | :------------------------------ | :----------------------------------------------------------- |
| **Framework Base**        | NestJS                          | Structure et injection de dépendances.                       |
| **Logique Métier**        | `@volontariapp/domain-event`    | Paquet interne encapsulant DDD et accès TypeORM.             |
| **Persistance**           | PostgreSQL & TypeORM            | Gestion relationnelle avec contraintes d'intégrité strictes. |
| **Messagerie Asynchrone** | BullMQ / `@volontariapp/outbox` | Résilience de l'Event-Driven Architecture (Outbox Runners).  |
| **Communication RPC**     | gRPC (`@grpc/grpc-js`)          | Transport bas niveau inter-services.                         |

## Getting Started

### Prérequis

- **Node.js** (>= 24.14.0)
- **Package Manager** : Yarn v4 (`corepack enable`)
- Dépendances d'infrastructures locales opérationnelles (Redis, PostgreSQL).

### Installation & Exécution

```bash
cd ms-event
yarn install

# Lancement en mode développement avec Hot-Reload
yarn start:dev

# Migrations de base de données
yarn migration:generate
yarn migration:run:dev
```

## Testing & CI/CD

Les tests d'intégration E2E reposent sur des instances conteneurisées à la volée (via `ci-tools`). L'intégration et le déploiement continu s'articulent autour de GitHub Actions et ArgoCD pour le déploiement GitOps Kubernetes.

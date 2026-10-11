# 🍫 ChocoPlus

[![Electron](https://img.shields.io/badge/Electron-33.4.11-blue.svg)](https://www.electronjs.org/)
[![Angular](https://img.shields.io/badge/Angular-18.2.0-red.svg)](https://angular.io/)
[![.NET](https://img.shields.io/badge/.NET-9.0-purple.svg)](https://dotnet.microsoft.com/)
[![License](https://img.shields.io/badge/License-Open_Source-yellow.svg)]()

**ChocoPlus** est une application desktop multimédia sophistiquée pour cinéphiles, développée avec Electron, Angular et C#. Elle offre une expérience de navigation et de visionnage de films et séries avec un lecteur vidéo intégré basé sur VLC.

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités principales](#-fonctionnalités-principales)
- [Téléchargements et mode hors ligne](#-téléchargements-et-mode-hors-ligne)
- [Architecture](#-architecture)
- [Modèle de données](#-modèle-de-données)
- [Internationalisation](#-internationalisation-i18n)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Développement](#-développement)
- [Build et déploiement](#-build-et-déploiement)
- [Structure du projet](#-structure-du-projet)
- [Technologies utilisées](#-technologies-utilisées)

## 🎬 Vue d'ensemble

ChocoPlus est une plateforme complète de gestion et de visionnage de contenu multimédia qui combine :
- Une interface moderne développée avec **Angular 18** et **Material Design**
- Un système de backend sécurisé avec authentification par tokens JWT
- Un lecteur vidéo natif haute performance développé en **C# .NET 9** utilisant **LibVLC**
- Une base de données relationnelle avec système de licences, sélections et categories

### Caractéristiques distinctives

- **Architecture hybride** : Interface Electron/Angular + Lecteur natif C#/WinForms
- **Sélections dynamiques** : Création de sélections thématiques de films/séries par type de page
- **Streaming HLS** : Support du streaming adaptatif avec hls.js (Fonctionnalité obsolète)
- **Téléchargement et mode hors ligne** : Films et épisodes téléchargés sur le disque, consultables et lisibles sans connexion
- **Authentification sécurisée** : Stockage sécurisé des tokens avec Keytar
- **Graphiques interactifs** : Visualisation d'un graphe avec D3.js et de plusieurs statistiques personnelles
- **Multilingue** : Interface disponible en français, anglais et japonais

## ✨ Fonctionnalités principales

### Gestion des utilisateurs
- **Inscription avec validation admin** : Les nouveaux comptes doivent être approuvés
- **Authentification JWT** : Connexion sécurisée avec refresh tokens
- **Profils personnalisés** : Photo de profil, informations personnelles
- **Gestion des rôles** : ADMIN, USER, FAMILY, NOT_ACTIVATE, SUSPENDED (seuls ADMIN et FAMILY peuvent télécharger des médias)

### Navigation et catalogue
- **Page Accueil** : Actualités avec News en vedette et sélections de films ou séries à la une = catalogue de film par réalisateur
- **Page Films** : Catalogue aléatoire avec vidéo tournante (NewsVideoRunning)
- **Page Séries** : Catalogue de série aléatoire, avec organisation par saisons et épisodes avec vidéo tournante
- **Page Recherche** : Moteur de recherche avancé par titre + affichage des plus grandes licenses de studio ou de saga
- **Page du Catalogue** : Visualisation du catalogue complet, avec la possibilité de trier et de filtrer le contenu selon la catégorie, la date, le type de média ...
- **Page Édition** (Admin uniquement) : Gestion complète des médias, licences, sélections, news, librarie ...

### Système de contenu
- **Licences** : Regroupement de contenu par licence (ex: MCU, Star Wars, Quentin Tarantino)
  - Chaque licence contient des **sélections** ordonnées
  - Peut avoir son propre logo, icône et fond d'écran
- **Sélections** : Collections thématiques de films/séries
  - Affichées sur les pages Accueil, Films et Séries
  - Ordre personnalisable via `orderIndex`
- **News** : Actualité en vedette sur la page d'accueil avec média associé
- **NewsVideoRunning** : Vidéo tournante sur les pages Films et Séries

### Lecteur vidéo (ChocoPlayer)
- **Lecteur natif C#** : Performance optimale avec LibVLCSharp
- **Sous-titres** : Support multi-langues synchronisé
- **Reprises de lecture** : Système de statistiques pour continuer où vous vous êtes arrêté
- **Lecture locale prioritaire** : Un film ou un épisode téléchargé est lu depuis le disque plutôt qu'en streaming
- **Contrôles personnalisés** : Interface overlay avec gestion plein écran
- **Communication IPC** : Coordination avec l'interface Electron

### Statistiques et graphiques
- **Graphiques dynamiques** : Visualisation avec D3.js
  - Répartition des films/séries
  - Statistiques par licence
  - Distribution par catégorie
  - Évolution de la bibliothèque
  - Diagramme fromage des catégories les plus visionnées
  - Statistique de nombre d'heure de visionnage par date
- **Suivi de visionnage** : État NOT_WATCHED, IN_PROGRESS ou FINISHED par média/épisode

## 📥 Téléchargements et mode hors ligne

Les films et les épisodes peuvent être téléchargés sur le disque pour être regardés sans connexion.

> **Accès** : les téléchargements sont réservés aux rôles **ADMIN** et **FAMILY**. Pour les autres rôles, les boutons de téléchargement et l'accès à la page Téléchargements ne sont pas affichés.

Tout le travail sur les fichiers (téléchargement, annulation, suppression, lecture des métadonnées) est fait par le **Main Process** (`app.js`). L'interface Angular le pilote par IPC.

### Pages

- **Page Téléchargements** (`/downloads`) : liste des médias téléchargés, progression en cours, historique, répartition de l'espace disque et suppression
- **Mode hors ligne** (`/offline-app`) : version de l'application utilisable sans connexion, limitée aux contenus téléchargés

### Stockage sur le disque

Les téléchargements sont rangés dans le dossier `userData` d'Electron (`%APPDATA%/ChocoPlus/downloads` sous Windows) :

```
downloads/
├── <movieId>/                    # Film
│   ├── metadata.json             # { media, info, videoPath }
│   ├── images/                   # Posters, fond, logo
│   └── <fichier vidéo>
│
└── <seriesId>/                   # Série
    ├── metadata.json             # { media, info } (sans vidéo)
    ├── images/                   # Posters de la série et des saisons
    └── <seasonId>/
        └── <episodeId>/
            ├── metadata.json     # { episode, videoPath }
            ├── images/           # Poster de l'épisode
            └── <fichier vidéo>
```

- Le nom du fichier vidéo vient de l'en-tête `Content-Disposition` de l'API. À défaut, il est déduit du `Content-Type` (`.mkv` par défaut).
- La vidéo est d'abord écrite dans un fichier `.part`, renommé une fois le téléchargement complet.
- Les images sont téléchargées localement et référencées en `file:///` dans les métadonnées.
- Les champs propres à l'affichage en ligne (crédits, catégories, progression…) sont retirés avant l'écriture du `metadata.json`.

### Déroulement d'un téléchargement

1. L'interface récupère les métadonnées du média auprès de l'API, puis appelle `download-media`.
2. Le Main Process télécharge les images, puis la vidéo depuis `download/download-movie/<id>` ou `download/download-episode/<id>` (avec le token JWT et la clé secrète de l'API).
3. La progression est envoyée à l'interface avec l'événement `download-progress` : au plus une fois toutes les 500 ms ou à chaque point de pourcentage, puis `percent: 100` à la fin. L'interface en déduit la vitesse et le temps restant.
4. Pour un épisode, les métadonnées de la série ne sont téléchargées que si elles ne sont pas déjà sur le disque.

### Annulation

- `cancel-download` interrompt le téléchargement en cours (`AbortController`). Il attend que les fichiers partiels soient supprimés, puis renvoie `{ key, fileName }`.
- `fileName` est le nom du fichier vidéo s'il était connu, sinon le titre du film ou le nom de l'épisode.
- Si l'annulation arrive pendant que l'interface récupère encore les métadonnées, elle est mise en attente. Le `download-media` qui suit est alors ignoré, et l'annulation renvoie le nom tiré de ses métadonnées. Sans `download-media` au bout de 30 secondes, elle renvoie `fileName: null`.
- Après un échec ou une annulation, seul le dossier de l'épisode est supprimé. Les dossiers de la saison et de la série ne sont supprimés que s'ils sont vides et qu'aucun autre épisode de la même série n'est en cours de téléchargement.

### Suppression

`delete-download` supprime un film, une série, une saison ou un épisode. Une saison sans épisode et une série sans saison sont supprimées automatiquement. Le résultat contient :
- `entries` : la liste des éléments supprimés (`{ key, fileName, episode }`)
- `media` : les métadonnées du média concerné
- `hasNoEpisode` : pour un épisode, `true` si sa saison n'a plus aucun épisode (sinon `null`)

Les suppressions ne sont jamais interrompues, pour ne pas laisser un dossier à moitié supprimé.

### Saisons d'une série téléchargée

`list-downloads` et `download-media` renvoient les séries avec leurs saisons formatées :
- `hasNoEpisodes` : la saison n'a aucun épisode téléchargé
- `isClicked` : la saison sélectionnée à l'ouverture, celle de l'épisode créé ou mis à jour le plus récemment

### Progression hors ligne

Quand ChocoPlayer signale une progression (`UPDATE_PROGRESS`), elle est aussi écrite dans le `metadata.json` du film ou de l'épisode téléchargé (`watchProgress`, `stateProgress`, `updatedAt`). Un média est considéré comme terminé à partir de 93 % de visionnage. `get-last-watched-episode` utilise ces dates pour retrouver le dernier épisode regardé d'une série.

### Fermeture et rechargement

À la fermeture de l'application ou lors d'un `reload-app`, les téléchargements en cours sont annulés (fichiers partiels supprimés) et les suppressions en cours sont attendues avant de continuer.

### IPC disponibles

| Canal | Rôle |
|-------|------|
| `download-media` | Télécharge un film ou un épisode (et les métadonnées de la série si besoin) |
| `cancel-download` | Annule un téléchargement et renvoie `{ key, fileName }` |
| `download-progress` | Événement de progression envoyé à l'interface |
| `delete-download` | Supprime un film, une série, une saison ou un épisode |
| `list-downloads` | Liste les médias téléchargés, du plus ancien au plus récent |
| `download-is-empty` | Indique si aucun média n'est téléchargé |
| `is-media-downloaded` | Indique si un film ou une série est téléchargé |
| `is-episode-downloaded` | Indique si un épisode est téléchargé |
| `get-media-info` | Renvoie les informations (`info`) d'un média téléchargé |
| `get-all-episodes` | Renvoie les épisodes téléchargés d'une saison, triés par numéro |
| `get-last-watched-episode` | Renvoie le dernier épisode regardé d'une série téléchargée |
| `get-storage-info` | Renvoie l'espace disque total et libre, la taille des téléchargements et celle du cache |

## 🏗️ Architecture

ChocoPlus utilise une architecture hybride particulière :

```
┌─────────────────────────────────────────────┐
│           Electron Container                │
│  ┌────────────────────────────────────────┐ │
│  │      Angular 18 Application            │ │
│  │  (Interface utilisateur principale)    │ │
│  │                                     |──────────────
│  │  - Routing & Navigation                │ │        │
│  │  - Material Design Components          │ │        │
│  │  - Services & Module Management        │ │        │
│  │  - API Communication (HTTP/JWT)        │ │        │
│  └────────────────────────────────────────┘ │        │
│                     │                       │        │
│                     │ IPC Communication     │        │
│                     ▼                       │        │
│  ┌────────────────────────────────────────┐ │        │
│  │         Main Process (Node.js)         │ │        │
│  │  - Window Management                   │ │        │
│  │  - Secure Token Storage (Keytar)       │ │        │
│  │  - File System Operations              │ │        │
│  │  - Downloads & Offline Storage         │ │        │
│  │  - Process Spawning                    │ │        │
│  └────────────────────────────────────────┘ │        │
└─────────────────────────────────────────────┘        │
                     │                                 │
                     │ Spawns                          │
                     ▼                                 │
        ┌──────────────────────────┐                   │
        │   ChocoPlayer (C#/.NET)  │                   │
        │                          │                   │
        │  - LibVLCSharp           │                   │
        │  - WinForms UI           │                   │
        │  - Video Playback        │                   │
        │  - Subtitle Rendering    │                   │
        │  - Controls Overlay      │                   │
        └──────────────────────────┘                   │
                     │ ────────────────────────────────│
                     │
                     ▼
              ┌────────────┐
              │  API REST  │
              │  (Backend) │
              └────────────┘
                     │
                     ▼
           ┌───────────────────┐
           │      MariaDB      │
           └───────────────────┘
```

## 📊 Modèle de données

### Relations principales

```
User (Utilisateurs)
  └── User_Media_List (Listes personnelles)
  └── Stat_User (Statistiques de visionnage)

Library (Bibliothèque contenant le chemin d'un répertoire)
  └── Media_Library (Médiathèque contenant le chemin des fichiers des médias et leurs metadonnées)
      └── Media (Films et Séries)
          ├── Translation_Title (Titres traduits)
          ├── Media_Category (Catégories/Genres)
          ├── Media_Credit (Acteurs/Réalisateurs et autres)
          ├── Media_Poster (Posters multiples)
          ├── Keyword (Mots-clés)
          ├── Similar_Title (Suggestions)
  
  Pour les séries :
  └── Season (Saisons)
      └── Episode (Épisodes)
          └── Stream_Series (Flux vidéo et sous-titres)

License (Licences thématiques - MCU, Disney, etc.)
  ├── License_Media (Médias associés)
  └── License_Selection (Sélections associées)
      └── Selection (Collections thématiques)
          ├── Selection_Media (Médias de la sélection)
          └── Selection_Page (Configuration d'affichage)

News (Actualités page d'accueil)
  └── Media (Média associé)

News_Video_Running (Vidéos tournantes Films/Séries)
  └── Media (Média associé)
```

### Entités clés

- **Media** : Entité centrale (Films et Séries) avec `mediaType` ENUM
- **License** : Regroupe du contenu thématique (ex: Marvel Cinematic Universe)
- **Selection** : Collection ordonnée de médias affichée dans les différentes pages
- **Poster** : Entité réutilisable pour tous les visuels (logos, fonds, affiches)
- **Episode/Season** : Organisation hiérarchique des séries
- **ChocoPlayerModel** : Url vers les flux vidéo et sous-titres + token d'accès

### Flux de données pour l'affichage

1. **Page Accueil** :
   - Récupère les `License` actives
   - Pour chaque licence, récupère les `Selection` via `License_Selection` (ordonnées par `orderIndex`)
   - Pour chaque sélection, récupère les `Media` via `Selection_Media`
   - Affiche une `News` en vedette en haut

2. **Page Films** :
   - Même système de sélections que l'accueil
   - Affiche une `News_Video_Running` en haut

3. **Page Séries** :
   - Même système de sélections
   - Affiche une `News_Video_Running` en haut

4. **Page Utilisateur** (Interface multi-onglets) :

   **Onglet Statistiques** :
   - Récupère les `Stat_User` pour l'utilisateur connecté
   - Affiche l'historique de visionnage (films et épisodes)
   - Filtrage par plage de dates personnalisable
   - Affiche l'état de progression : IN PROGRESS ou FINISHED
   - Liaison avec les tables `Media` (pour les films) et `Episode` (pour les séries)

   **Onglet Rapport de Bug** :
   - Formulaire de signalement avec 3 champs requis :
     - **Sujet** : Titre du problème rencontré
     - **Page concernée** : Localisation du bug (Accueil, Films, Séries, etc.)
     - **Description** : Détails du problème
   - Envoi par API REST au backend pour traitement par les admins

   **Onglet Graphiques** :
   - Visualisation interactive avec D3.js de toutes les données de la plateforme :
     - Nombre total de films et séries (`Media` avec `mediaType`)
     - Distribution par catégories (`Category` via `Media_Category`)
     - Répartition par licences (`License` via `License_Media`)
     - Nombre de sélections disponibles (`Selection`)
   - Graphiques en temps réel basés sur les données complètes de la base

   **Onglet Informations Personnelles** :
   - Modification des données utilisateur depuis la table `User` :
     - **Pseudo** : Changement du nom d'utilisateur (avec validation unicité)
     - **Mot de passe** : Mise à jour sécurisée (hashage bcrypt)
     - **Photo de profil** : Sélection depuis `Profil_Photo` ou upload
     - **Date de naissance** : Modification du champ `dateBorn`
     - **Langue** : Modification de la langue du système (français, anglais, japonais)
   - Validation et mise à jour via API REST

   **Onglet Documentation** :
   - Visualisation de la documentation/notice d'utilisation principale de ChocoPlus en format PDF

   **Onglet Administration** (Visible uniquement pour `role = 'ADMIN'`) :
   - Liste complète de tous les utilisateurs de la table `User`
   - Affichage : pseudo, email, rôle actuel, date de création
   - Actions disponibles par utilisateur :
     - **Changer le rôle** : Sélection parmi ADMIN, USER, FAMILY, NOT_ACTIVATE, SUSPENDED
     - **Activer un compte** : Passage de NOT_ACTIVATE à USER/FAMILY
       - Déclenche l'envoi automatique d'un email de confirmation
     - **Suspendre** : Passage en SUSPENDED (blocage de l'accès)
   - Mise à jour en temps réel via API REST avec notification email

## 🌍 Internationalisation (i18n)

ChocoPlus supporte plusieurs langues via **@ngx-translate/core**. La langue peut être changée à tout moment depuis les paramètres du profil utilisateur.

### Langues disponibles

| Drapeau | Langue | Code |
|---------|--------|------|
| 🇫🇷 | Français | `fr` |
| 🇬🇧 | English | `en` |
| 🇯🇵 | 日本語 | `ja` |

### Gestion des traductions

Les fichiers de traduction sont organisés par langue dans le répertoire `public/i18n/` :

```
public/
└── i18n/
    ├── fr.json      # Français
    ├── en.json      # Anglais (langue par défaut)
    └── ja.json      # Japonais
```

Chaque fichier contient l'ensemble des clés de traduction organisées par domaine fonctionnel (`LAUNCH`, `MENU`, `EDITION`, `BUTTON`, etc.). Le fichier `en.json` sert de référence — toute nouvelle clé doit y être ajoutée en premier.

### Fonctionnement

La langue est chargée au démarrage depuis les préférences de l'utilisateur et appliquée globalement via `TranslateService`. En l'absence de préférence enregistrée, l'application utilise l'anglais par défaut.

```typescript
readonly availableLangs: LangOption[] = [
  { code: SupportedLang.fr, label: 'Français', flag: '🇫🇷' },
  { code: SupportedLang.en, label: 'English',  flag: '🇬🇧' },
  { code: SupportedLang.ja, label: '日本語',   flag: '🇯🇵' },
];
```

### Ajouter une nouvelle langue

1. Créer le fichier de traduction `public/i18n/<code>.json` en se basant sur `en.json`
2. Ajouter une entrée dans `availableLangs` avec le code ISO 639-1 correspondant
3. Vérifier que toutes les clés sont bien traduites avant de déployer

> **Note** : Utiliser le code **langue** ISO 639-1 (ex: `ja` pour japonais) et non le code **pays** ISO 3166-1 (ex: `jp`).

## 🔧 Prérequis

### Logiciels requis

- **Node.js** : 18.x ou supérieur
- **npm** : 9.x ou supérieur
- **.NET SDK** : 9.0 ou supérieur
- **Angular** : 18.0 ou supérieur
- **Visual Studio 2022** ou **VS Code** avec extension C#

### Système d'exploitation

- **Windows 10/11** (requis pour ChocoPlayer en .NET Windows Forms)

## 📥 Installation

### 1. Cloner le repository

```bash
git clone <repository-url>
cd ChocoPlus
```

### 2. Installer les dépendances Angular/Electron

```bash
npm install
```

### 3. Compiler le projet ChocoPlayer (C#)

```bash
cd ChocoPlayer
dotnet build --configuration Debug
cd ..
```

Cela créera l'exécutable dans : `ChocoPlayer/bin/Debug/net9.0-windows/ChocoPlayer.exe`

## ⚙️ Configuration

### Fichier .env

ChocoPlus utilise un fichier `.env` pour gérer les variables d'environnement sensibles et la configuration de l'API. Ce fichier doit être créé à la racine du projet.

#### Création du fichier .env

Créez un fichier `.env` à la racine avec le contenu suivant :
```env
# URL de l'API backend
API_URL=http://localhost:3000

# Clés de sécurité pour l'authentification API
HEADER_SECRET_API=SF76KE6eNKz9Y6hQYFtz7fC8h3XG8848KQNPmergSF76KE6eNKz9Y6hQYFtz7fC8h3XG8848KQNPmerg
HEADER_NAME_FIELD_SECRET_API=X-API-Secret-Key-Choco-Plus
```

#### Variables disponibles

| Variable | Description | Exemple |
|----------|-------------|---------|
| `API_URL` | URL de base de l'API REST backend | `http://localhost:3000` ou `https://api.chocoplus.com` |
| `HEADER_SECRET_API` | Clé secrète pour l'authentification des requêtes API | Chaîne aléatoire sécurisée |
| `HEADER_NAME_FIELD_SECRET_API` | Nom du header HTTP contenant la clé secrète | `X-API-Secret-Key-Choco-Plus` |

#### Fonctionnement

Les variables d'environnement sont chargées au démarrage de l'application via le processus principal d'Electron et transmises de manière sécurisée à l'interface Angular :

1. **Main Process** (app.js) : Charge le `.env` avec `dotenv` et transmet les variables via `additionalArguments`
2. **Preload Script** (preload.js) : Récupère les arguments et les expose via `contextBridge`
3. **Angular** (environment.ts) : Accède aux variables de manière synchrone via `window.electron`

```typescript
// Exemple d'utilisation dans environment.ts
const apiUrl: string = window.electron?.apiUrl || 'http://localhost:3000';
const headerSecret: string = window.electron?.headerSecret || 'default-secret';
const headerName: string = window.electron?.headerName || 'X-API-Secret-Key';
```

#### Sécurité

⚠️ **Important** :
- Le fichier `.env` est inclus dans `.gitignore` et ne doit **jamais** être commité
- Pour la production, le fichier `.env` est copié dans les ressources de l'application packagée
- Les utilisateurs finaux peuvent modifier le `.env` à côté de l'exécutable pour pointer vers leur propre instance d'API
- Les clés secrètes doivent être régénérées pour chaque environnement (dev, staging, production)

#### Configuration pour le build

Lors de la création de l'exécutable, le fichier `.env` est automatiquement inclus grâce à la configuration `electron-builder` dans `package.json` :

```json
"extraResources": [
  {
    "from": ".env",
    "to": ".env"
  }
]
```

L'application packagée recherchera le `.env` dans cet ordre de priorité :
1. À côté de l'exécutable (pour les utilisateurs finaux)
2. Dans le dossier `resources` de l'application
3. Utilisation des valeurs par défaut si aucun fichier n'est trouvé

### Variables d'environnement

```typescript
const apiUrl: string = '';
const headerSecret: string = '';
const headerName: string = '';

export const environment = {
    apiUrlAuth: apiUrl + '/auth',
    apiUrlMedia: apiUrl + '/media',
    apiUrlMovie: apiUrl + '/movie',
    apiUrlSeries: apiUrl + '/series',
    apiUrlSelection: apiUrl + '/selection',
    apirUrlLicense: apiUrl + '/license',
    apiUrlStream: apiUrl + '/stream',
    apiUrlUser: apiUrl + '/user',
    apiUrlCategory: apiUrl + '/category',
    apiUrlTmdb: apiUrl + '/tmdb',
    apiUrlSimilarTitle: apiUrl + '/similar-title',
    apiProfilPicture: apiUrl + '/profil-photo',
    apiSupport: apiUrl + '/support',
    apiNews: apiUrl + '/news',
    apiUrlNewsVideoRunning: apiUrl + '/news-video-running',
    apiUrlStatUser: apiUrl + '/stat-user',
    apiUrlDocumentation: apiUrl + '/documentation',
    apiUrlCredit: apiUrl + '/credit',
    apiUrlVersion: apiUrl + '/version',
    apiUrlLibrary: apiUrl + '/library',
    access_token: 'access_token',
    HEADER_SECRET_API: headerSecret,
    HEADER_NAME_FIELD_SECRET_API: headerName
}
```

### Configuration de l'API

L'application nécessite une API REST pour :
- Authentification JWT (login/register/refresh)
- CRUD des médias, licences, sélections ...
- Gestion des utilisateurs
- Récupération des statistiques

## 🚀 Développement

### Lancer l'application en mode développement

```bash
npm run watch

npm run electron:dev
```

Ou en une seule commande :

```bash
npm start
```

### Scripts disponibles

```bash
npm run ng           # CLI Angular
npm start            # Build Angular + Lancer Electron
npm run build        # Build production Angular
npm run watch        # Build Angular en mode watch
npm test             # Tests unitaires
npm run electron:dev # Lancer Electron uniquement
npm run dist         # Créer l'exécutable distributable
```

### Développement du ChocoPlayer

```bash
cd ChocoPlayer
dotnet run
```

## 📦 Build et déploiement

### Préparer le build de production

#### 1. Compiler ChocoPlayer en Release

```bash
cd ChocoPlayer
dotnet publish --configuration Release --runtime win-x64 --self-contained false
```

#### 2. Copier les fichiers compilés

Copier **TOUS** les fichiers du dossier `ChocoPlayer/bin/Debug/net9.0-windows/` (ou `Release`) vers :

```
resources/ChocoPlayer/
```

Cette étape est **cruciale** : Electron Builder inclura automatiquement le dossier `resources/ChocoPlayer` dans l'application packagée via la configuration `extraResources` du `package.json`.

#### 3. Créer l'exécutable Electron

```bash
npx electron-builder --win
```

L'installateur NSIS sera créé dans `dist/`.

### Configuration electron-builder

Le fichier `package.json` contient la configuration complète :

```json
"build": {
  "appId": "com.choco.plus",
  "productName": "ChocoPlus",
  "files": [
    "dist/**/*",
    "app.js",
    "preload.js",
    "package.json"
  ],
  "extraResources": [
    {
      "from": "resources/ChocoPlayer",
      "to": "ChocoPlayer",
      "filter": ["**/*"]
    },
    {
      "from": ".env",
      "to": ".env"
    }
  ],
  "win": {
    "icon": "icon.ico",
    "target": "nsis"
  }
}
```

### Chemins d'exécution

- **Développement** : `__dirname/ChocoPlayer/bin/Debug/net9.0-windows/ChocoPlayer.exe`
- **Production** : `process.resourcesPath/ChocoPlayer/ChocoPlayer.exe`

## 📁 Structure du projet

```
ChocoPlus/
├── src/                          # Application Angular
│   ├── app/
│   │   ├── components/          # Composants UI
│   │   ├── services/            # Services (API, Auth, State)
│   │   ├── guards/              # Route Guards
│   │   ├── models/              # Interfaces TypeScript
│   │   └── pages/               # Pages principales
│   │       ├── home/            # Page d'accueil
│   │       ├── movies/          # Page films
│   │       ├── series/          # Page séries
│   │       ├── search/          # Page recherche
│   │       └── edit/            # Page édition (admin)
│   └── environments/            # Configuration environnement
│
├── public/                      # Ressources publiques
│   └── i18n/                    # Fichiers de traduction
│       ├── fr.json              # Français (langue par défaut)
│       ├── en.json              # Anglais
│       └── ja.json              # Japonais
│
├── ChocoPlayer/                 # Projet C# .NET 9
│   ├── Forms/                   # WinForms UI
│   ├── Models/                  # Modèles de données
│   ├── Services/                # Logique métier
│   ├── Controls/                # Contrôles personnalisés
│   ├── icons/                   # Icônes du lecteur
│   ├── ChocoPlayer.csproj
│   └── Program.cs
│
├── resources/                   # Ressources pour le build
│   └── ChocoPlayer/             # ⚠️ Copier les fichiers compilés ici pour prod
│
├── dist/                        # Build Angular (généré)
├── node_modules/                # Dépendances Node.js
│
├── app.js                       # Main process Electron
├── preload.js                   # Preload script
├── package.json                 # Configuration npm/Electron
├── tsconfig.json                # Configuration TypeScript
├── angular.json                 # Configuration Angular CLI
├── icon.ico                     # Icône de l'application
└── README.md                    # Ce fichier
```

## 🛠️ Technologies utilisées

### Frontend (Electron/Angular)

| Technologie | Version | Usage |
|------------|---------|-------|
| Electron | 33.4.11 | Container desktop multiplateforme |
| Angular | 18.2.0 | Framework frontend |
| Angular Material | 17.0.0 | Composants UI Material Design |
| Angular CDK | 17.0.0 | Component Dev Kit |
| TypeScript | 5.5.2 | Langage de programmation |
| RxJS | 7.8.0 | Programmation réactive |
| D3.js | 7.9.0 | Visualisation de données |
| @ngx-translate/core | — | Internationalisation (i18n) |

### Backend Integration

| Technologie | Version | Usage |
|------------|---------|-------|
| @auth0/angular-jwt | 5.2.0 | Gestion JWT tokens |
| keytar | 7.9.0 | Stockage sécurisé des credentials |
| electron-store | 10.1.0 | Stockage local persistant |

### Lecteur vidéo (C#/.NET)

| Technologie | Version | Usage |
|------------|---------|-------|
| .NET | 9.0 | Framework applicatif |
| WinForms | 9.0 | Interface utilisateur native |
| LibVLCSharp | 3.9.5 | Wrapper VLC pour .NET |
| LibVLCSharp.WinForms | 3.9.5 | Intégration WinForms |
| VideoLAN.LibVLC.Windows | 3.0.23 | Bibliothèque VLC native |
| SkiaSharp | 3.119.1 | Graphiques 2D |
| Svg | 3.4.7 | Rendu SVG |

### Build & Dev Tools

| Outil | Usage |
|-------|-------|
| Angular CLI | 18.2.2 | Outils de développement Angular |
| electron-builder | 26.0.12 | Packaging et distribution |
| Jasmine/Karma | 5.x | Tests unitaires |

## 🔐 Sécurité

- **Tokens JWT** : Authentification stateless avec refresh tokens
- **Keytar** : Stockage sécurisé des tokens dans le gestionnaire de credentials du système
- **Context Isolation** : Isolation du contexte Electron pour la sécurité
- **Validation côté serveur** : Toutes les opérations critiques sont validées par l'API

## 📝 Notes importantes

### Communication Electron ↔ ChocoPlayer

Lors du lancement de ChocoPlayer, Electron transmet :
- Position et état de la fenêtre (x, y, maximized, fullscreen)
- Token d'authentification (récupéré via Keytar)
- Informations du média à lire
- Configuration du streaming
- Le chemin du fichier vidéo local (`Url`) si le film ou l'épisode est téléchargé : il est alors lu en priorité
- Pour une série, la liste des épisodes téléchargés (`EpisodesStorage`)

En retour, ChocoPlayer écrit des messages sur sa sortie standard, lus ligne par ligne par Electron :

| Message | Rôle |
|---------|------|
| `LAUNCHING`, `NETWORK_SLOWDOWN`, `STREAMING`, `CLOSED` | État du lecteur, relayé à l'interface (`choco-player-status`) |
| `NEW_EPISODE_ID : <id>` | Passage à un autre épisode dans le lecteur |
| `UPDATE_PROGRESS : MOVIE : <mediaId> : <progress>` | Progression d'un film |
| `UPDATE_PROGRESS : EPISODE : <seriesId> : <seasonId> : <episodeId> : <progress>` | Progression d'un épisode |

La progression est relayée à l'interface (`WatchProgress`, `StateProgress`) et enregistrée dans les métadonnées si le média est téléchargé.

### Gestion des processus

- Une seule instance de ChocoPlus peut être ouverte : une deuxième tentative de lancement remet la fenêtre existante au premier plan
- ChocoPlayer est un processus enfant spawné par Electron, et un seul lecteur tourne à la fois
- Les lancements sont mis en file d'attente : relancer le même média ne fait rien, lancer un autre média ferme d'abord le lecteur en cours
- ChocoPlayer est d'abord fermé proprement (`taskkill` sans `/F`), puis de force après 3 secondes s'il ne s'est pas arrêté
- À la fermeture de la fenêtre, Electron attend la fin de ChocoPlayer ; à la fermeture de l'app ou lors d'un rechargement, il attend aussi l'annulation des téléchargements et la fin des suppressions en cours

### Streaming vidéo

Les vidéos sont servies via :
- **Chemins locaux/réseau** pour le lecteur natif (VLC)
- Support des sous-titres multi-langues (SRT, VTT)
- La langue de l'audio et des sous-titres choisis sont sauvegardés pour une meilleure expérience utilisateur

## 🤝 Contribution

Ce projet est Open source.

## 📄 License

Projet Open source - Aucun droit réservé

---

**Développé avec ❤️ et 🍫 par l'équipe ChocoPlus**

*Version 2.0.0 - Mai 2026*

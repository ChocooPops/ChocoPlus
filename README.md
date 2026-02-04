# 🍫 ChocoPlus

[![Electron](https://img.shields.io/badge/Electron-33.4.11-blue.svg)](https://www.electronjs.org/)
[![Angular](https://img.shields.io/badge/Angular-18.2.0-red.svg)](https://angular.io/)
[![.NET](https://img.shields.io/badge/.NET-9.0-purple.svg)](https://dotnet.microsoft.com/)
[![License](https://img.shields.io/badge/License-Private-yellow.svg)]()

**ChocoPlus** est une application desktop multimédia sophistiquée pour cinéphiles, développée avec Electron et Angular. Elle offre une expérience de navigation et de visionnage de films et séries avec un lecteur vidéo intégré haute performance basé sur VLC.

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités principales](#-fonctionnalités-principales)
- [Architecture](#-architecture)
- [Modèle de données](#-modèle-de-données)
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
- Une base de données relationnelle complexe avec système de licences, sélections et categories

### Caractéristiques distinctives

- **Architecture hybride** : Interface Electron/Angular + Lecteur natif C#/WinForms
- **Sélections dynamiques** : Création de collections thématiques de films/séries
- **Streaming HLS** : Support du streaming adaptatif avec hls.js (Fonctionnalité obsolète)
- **Authentification sécurisée** : Stockage sécurisé des tokens avec Keytar
- **Graphiques interactifs** : Visualisation d'un graphe avec D3.js

## ✨ Fonctionnalités principales

### Gestion des utilisateurs
- **Inscription avec validation admin** : Les nouveaux comptes doivent être approuvés
- **Authentification JWT** : Connexion sécurisée avec refresh tokens
- **Profils personnalisés** : Photo de profil, informations personnelles
- **Gestion des rôles** : ADMIN, USER, FAMILY, NOT_ACTIVATE, SUSPENDED

### Navigation et catalogue
- **Page Accueil** : Actualités avec News en vedette et sélections de films ou séries à la une = catalogue de film par réalisateur
- **Page Films** : Catalogue aléatoire avec vidéo tournante (NewsVideoRunning)
- **Page Séries** : Catalogue de série aléatoire, avec organisation par saisons et épisodes avec vidéo tournante
- **Page Recherche** : Moteur de recherche avancé par titre + affichage des plus grandes licenses de studio ou de saga
- **Page Édition** (Admin uniquement) : Gestion complète des médias, licences, sélections

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
- **Contrôles personnalisés** : Interface overlay avec gestion plein écran
- **Communication IPC** : Coordination avec l'interface Electron

### Statistiques et graphiques
- **Graphiques dynamiques** : Visualisation avec D3.js
  - Répartition des films/séries
  - Statistiques par licence
  - Distribution par catégorie
  - Évolution de la bibliothèque
- **Suivi de visionnage** : État IN PROGRESS ou FINISHED par média/épisode

## 🏗️ Architecture

ChocoPlus utilise une architecture hybride unique :

```
┌─────────────────────────────────────────────┐
│           Electron Container                 │
│  ┌────────────────────────────────────────┐ │
│  │      Angular 18 Application            │ │
│  │  (Interface utilisateur principale)     │ │
│  │                                         │ │
│  │  - Routing & Navigation                │ │
│  │  - Material Design Components          │ │
│  │  - Services & State Management         │ │
│  │  - API Communication (HTTP/JWT)        │ │
│  └────────────────────────────────────────┘ │
│                     │                        │
│                     │ IPC Communication      │
│                     ▼                        │
│  ┌────────────────────────────────────────┐ │
│  │         Main Process (Node.js)         │ │
│  │  - Window Management                    │ │
│  │  - Secure Token Storage (Keytar)       │ │
│  │  - File System Operations              │ │
│  │  - Process Spawning                    │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
                     │
                     │ Spawns
                     ▼
        ┌──────────────────────────┐
        │   ChocoPlayer (C#/.NET)  │
        │                          │
        │  - LibVLCSharp          │
        │  - WinForms UI          │
        │  - Video Playback       │
        │  - Subtitle Rendering   │
        │  - Controls Overlay     │
        └──────────────────────────┘
                     │
                     │
                     ▼
              ┌───────────┐
              │  API REST │
              │  (Backend)│
              └───────────┘
                     │
                     ▼
           ┌──────────────────┐
           │  MariaDB / MySQL │
           └──────────────────┘
```

## 📊 Modèle de données

### Relations principales

```
User (Utilisateurs)
  └── User_Media_List (Listes personnelles)
  └── Stat_User (Statistiques de visionnage)

Media (Films et Séries)
  ├── Translation_Title (Titres traduits)
  ├── Media_Category (Catégories/Genres)
  ├── Media_Staff (Acteurs/Réalisateurs)
  ├── Media_Poster (Posters multiples)
  ├── Keyword (Mots-clés)
  ├── Similar_Title (Suggestions)
  └── Stream_Movie (Flux vidéo et sous-titres)
  
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
- **Stream_Movie/Stream_Series** : Chemins vers les flux vidéo et sous-titres

### Flux de données pour l'affichage

1. **Page Accueil** :
   - Récupère les `License` actives
   - Pour chaque licence, récupère les `Selection` via `License_Selection` (ordonnées par `orderIndex`)
   - Pour chaque sélection, récupère les `Media` via `Selection_Media`
   - Affiche une `News` en vedette en haut

2. **Page Films** :
   - Récupère les `License` avec `mediaType = 'MOVIE'`
   - Même système de sélections que l'accueil
   - Affiche une `News_Video_Running` en haut

3. **Page Séries** :
   - Récupère les `License` avec `mediaType = 'SERIES'`
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
   - Validation et mise à jour via API REST
   
   **Onglet Administration** (Visible uniquement pour `role = 'ADMIN'`) :
   - Liste complète de tous les utilisateurs de la table `User`
   - Affichage : pseudo, email, rôle actuel, date de création
   - Actions disponibles par utilisateur :
     - **Changer le rôle** : Sélection parmi ADMIN, USER, FAMILY, NOT_ACTIVATE, SUSPENDED
     - **Activer un compte** : Passage de NOT_ACTIVATE à USER/FAMILY
       - Déclenche l'envoi automatique d'un email de confirmation
     - **Suspendre** : Passage en SUSPENDED (blocage de l'accès)
   - Mise à jour en temps réel via API REST avec notification email
   
## 🔧 Prérequis

### Logiciels requis

- **Node.js** : 18.x ou supérieur
- **npm** : 9.x ou supérieur
- **.NET SDK** : 9.0 ou supérieur
- **Visual Studio 2022** ou **VS Code** avec extension C#
- **MariaDB/MySQL** : 10.x ou supérieur

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

### Variables d'environnement

```typescript
const apiUrl: string = 'http://localhost:3000';

export const environment = {
    apiUrlAuth: apiUrl + '',
    apiUrlMedia: apiUrl + '',
    apiUrlMovie: apiUrl + '',
    apiUrlSeries: apiUrl + '',
    apiUrlSelection: apiUrl + '',
    apirUrlLicense: apiUrl + '',
    apiUrlStream: apiUrl + '',
    apiUrlUser: apiUrl + '',
    apiUrlCategory: apiUrl + '',
    apiUrlTmdb: apiUrl + '',
    apiUrlSimilarTitle: apiUrl + '',
    apiProfilPicture: apiUrl + '',
    apiJellyfin: apiUrl + '',
    apiSupport: apiUrl + '',
    apiNews: apiUrl + '',
    apiUrlNewsVideoRunning: apiUrl + '',
    access_token: '',
    HEADER_SECRET_API: '',
    HEADER_NAME_FIELD_SECRET_API: ''
}
```

### Configuration de l'API

L'application nécessite une API REST pour :
- Authentification JWT (login/register/refresh)
- CRUD des médias, licences, sélections
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
npm run ng          # CLI Angular
npm start           # Build Angular + Lancer Electron
npm run build       # Build production Angular
npm run watch       # Build Angular en mode watch
npm test            # Tests unitaires
npm run electron:dev # Lancer Electron uniquement
npm run dist        # Créer l'exécutable distributable
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
│   │       ├── home/           # Page d'accueil
│   │       ├── movies/         # Page films
│   │       ├── series/         # Page séries
│   │       ├── search/         # Page recherche
│   │       └── edit/           # Page édition (admin)
│   ├── assets/                  # Images, styles, fonts
│   └── environments/            # Configuration environnement
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
│   └── ChocoPlayer/            # ⚠️ Copier les fichiers compilés ici pour prod
│
├── dist/                        # Build Angular (généré)
├── node_modules/                # Dépendances Node.js
│
├── app.js                       # Main process Electron
├── preload.js                   # Preload script
├── package.json                 # Configuration npm/Electron
├── tsconfig.json                # Configuration TypeScript
├── angular.json                 # Configuration Angular CLI
├── db.sql                       # Schéma de base de données
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
| HLS.js | 1.6.7 | Streaming adaptatif HLS |
| D3.js | 7.9.0 | Visualisation de données |
| ngx-json-viewer | 3.2.1 | Visualisation JSON |

### Backend Integration

| Technologie | Usage |
|------------|-------|
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

### Gestion des processus

- ChocoPlayer est un processus enfant spawné par Electron
- À la fermeture de l'app, Electron termine proprement ChocoPlayer (`taskkill`)
- Support de plusieurs instances si nécessaire (détection via PID)

### Streaming vidéo

Les vidéos sont servies via :
- **Streaming HLS** pour la navigation (hls.js)
- **Chemins locaux/réseau** pour le lecteur natif (VLC)
- Support des sous-titres multi-langues (SRT, VTT)

## 🤝 Contribution

Ce projet est privé. Pour toute question ou contribution, contactez l'administrateur.

## 📄 License

Projet privé - Tous droits réservés

---

**Développé avec ❤️ et 🍫 par l'équipe ChocoPlus**

*Version 1.0.0 - Janvier 2025*
<div align="center">
<img width="1200" height="475" alt="Canyon D-fense Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Canyon D-fense

**Jeu de tower defense militaire — Défendez le canyon contre des vagues d'ennemis blindés, aériens et furtifs.**

[![Jouer en ligne](https://img.shields.io/badge/▶%20Jouer%20en%20ligne-GitHub%20Pages-f97316?style=for-the-badge&logo=github)](https://mansstyle59.github.io/Canyon-D-fense-Mobile-/)
&nbsp;
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Jouer

**[mansstyle59.github.io/Canyon-D-fense-Mobile-](https://mansstyle59.github.io/Canyon-D-fense-Mobile-)** — aucune installation requise, directement dans le navigateur.

---

## Présentation

Canyon D-fense est un tower defense en temps réel rendu entièrement en SVG. Placez des tourelles militaires sur les 15 emplacements du canyon, résistez aux vagues de plus en plus difficiles, et gérez votre budget pour améliorer ou vendre vos défenses au bon moment.

**Caractéristiques :**
- 5 types de tourelles avec mécanique sol/air et perce-blindage
- 13 types d'ennemis avec capacités uniques (furtif, EMP, soin, boss)
- Progression sur plusieurs niveaux avec difficulté croissante
- Frappe aérienne spéciale rechargeable
- Vitesse de jeu 1x / 2x
- Interface 100 % tactile, jouable sur mobile

---

## Tourelles

| Tourelle | Coût | Cibles | Dégâts | Cadence | Portée | Particularité |
|---|---:|:---:|---:|:---:|---:|---|
| 🟠 Mitrailleuse Rapide | $50 | Sol | 10 | 3,5 /s | 160 | Idéale contre l'infanterie légère |
| 🔵 Canon Lourd | $120 | Sol | 45 | 1 /s | 220 | **Perce l'armure** |
| 🩵 Tourelle DCA | $150 | Air | 25 | 5 /s | 300 | Seule à cibler les unités aériennes |
| 🟡 Mortier Explosif | $250 | Sol | 100 | 0,5 /s | 320 | Dégâts de zone, perce l'armure |
| 🔴 Lance-missiles | $500 | Sol + Air | 250 | 0,25 /s | 450 | Tout-terrain, plus longue portée |

> Chaque niveau d'amélioration ajoute **+40 % de dégâts**, **+10 % de portée** et **+10 % de cadence**.  
> Revendre une tourelle rembourse **50 %** de la valeur totale investie (construction + upgrades).

---

## Ennemis

### Unités terrestres

| Ennemi | PV | Vitesse | Récompense | Capacité |
|---|---:|:---:|---:|---|
| 🏍 Moto | 45 | ████████ | $25 | Ultra-rapide |
| 🪖 Escouade | 60 | ████ | $15 | — |
| 🚙 Buggy | 80 | ██████ | $35 | Rapide |
| 🚐 Jeep | 120 | █████ | $25 | — |
| 🚑 Camion Médic | 400 | ███ | $180 | **Soigne les alliés proches** |
| 🛡 APC | 350 | ███ | $60 | **Blindé** |
| 🪖 Tank | 900 | ██ | $120 | **Blindé** |
| ⚙️ Heavy Tank | 2 500 | █ | $400 | **Blindé** |
| 🤖 Mech *(boss)* | 6 000 | ▌ | $800 | **Blindé** — retire 5 vies si il passe |

### Unités aériennes

| Ennemi | PV | Vitesse | Récompense | Capacité |
|---|---:|:---:|---:|---|
| ✈️ Jet | 300 | ██████ | $180 | — |
| 🚁 Hélico Furtif | 180 | █████ | $180 | **Invisible à mi-portée** |
| 🤖 Drone EMP | 200 | ███ | $140 | **Désactive les tourelles proches** |
| 💣 Bombardier | 1 200 | ██ | $350 | **Blindé** |

> **Blindé** → -70 % de dégâts des armes sans perce-blindage (Mitrailleuse, DCA).  
> **Furtif** → détectable uniquement dans la moitié de la portée normale.

---

## Mécaniques

### Économie
- Budget de départ : `300 + niveau × 50 $`
- Chaque kill rapporte la récompense de l'unité
- **Bonus de fin de vague** : `50 + N × 25 $` à chaque vague complétée
- Vente de tourelle : remboursement de 50 % de l'investissement total

### Frappe aérienne
Disponible à partir de la **vague 5**. Inflige **1 000 dégâts** à tous les ennemis présents. Rechargement : **20 secondes**. Ne tue pas les boss mais leur inflige des dégâts.

### Progression
- Chaque niveau augmente le nombre de vagues (`niveau × 10`)
- Les unités arrivent avec des multiplicateurs de PV croissants
- Les vagues boss (×5) introduisent des unités d'élite (Heavy Tank, Bombardier, Mech)

---

## Comment jouer

| Action | Desktop | Mobile |
|---|---|---|
| Sélectionner une tourelle | Clic sur le panel bas | Tap sur le panel bas |
| Placer une tourelle | Clic sur un emplacement ⊕ | Tap sur un emplacement ⊕ |
| Voir la portée | Survoler un emplacement vide | — |
| Améliorer / Vendre | Clic sur une tourelle placée | Tap sur une tourelle placée |
| Lancer la vague | Bouton **Lancer Vague** | Tap **Lancer Vague** |
| Pause | Bouton **Pause** | Tap **Pause** |
| Accélérer | Bouton **1x / 2x** | Tap **1x / 2x** |
| Frappe aérienne | Bouton **FRAPPE** | Tap **FRAPPE** |

---

## Stratégie

- **Placez d'abord les tourelles à perce-blindage** (Canon, Mortier, Missile) sur les emplacements centraux, qui couvrent la plus grande portion du chemin.
- **Combinez DCA + Missile** pour ne pas être débordé par les vagues aériennes mixtes (jet + drone EMP).
- **Protégez vos tourelles des drones EMP** : ils désactivent tout ce qui est dans un rayon de 100 px.
- **Vendez les Mitrailleuses** en milieu de partie pour financer un Mortier ou un Missile.
- **Utilisez la frappe aérienne** au pic d'une vague dense, pas contre un seul boss.
- **Bonus de vague** : ne stagnez pas — chaque vague terminée rapporte plus d'or.

---

## Lancer en local

**Prérequis :** Node.js 18+

```bash
git clone https://github.com/mansstyle59/Canyon-D-fense-Mobile-.git
cd Canyon-D-fense-Mobile-
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

```bash
npm run build    # Build de production → dist/
npm run preview  # Prévisualiser le build
npm run lint     # Vérification TypeScript
```

---

## Architecture

```
src/
├── components/
│   └── GameBoard.tsx      # Rendu SVG : terrain, ennemis, projectiles, tourelles
├── hooks/
│   └── useGameEngine.ts   # Boucle de jeu (requestAnimationFrame), toute la logique
├── utils/
│   └── path.ts            # Calcul du chemin SVG → points de coordonnées
├── constants.ts           # Config des tourelles et ennemis (stats, coûts)
├── types.ts               # Types TypeScript (GameState, Enemy, PlacedTurret…)
└── App.tsx                # HUD, panneau d'arsenal, overlay victoire/défaite
```

La logique de jeu tourne dans un seul `requestAnimationFrame` : spawn, déplacement, ciblage, tir, détection de collision, et calcul des dégâts. L'état React est mis à jour à chaque frame via `setGameState`.

---

## Stack technique

| | |
|---|---|
| **React 19** | Interface et composants |
| **TypeScript 5.8** | Typage strict |
| **Vite 6** | Build et dev server |
| **Tailwind CSS 4** | Styles utilitaires |
| **Motion** | Animations SVG des unités |
| **SVG natif** | Rendu du terrain, unités, projectiles |

---

## Déploiement

Le projet se déploie automatiquement sur GitHub Pages via GitHub Actions à chaque push sur `main`.

Pour activer sur votre fork :
1. **Settings → Pages → Source** → choisir **GitHub Actions**
2. Pusher sur `main` → le workflow build et déploie automatiquement

URL : `https://<username>.github.io/Canyon-D-fense-Mobile-/`

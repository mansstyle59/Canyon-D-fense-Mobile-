<div align="center">
<img width="1200" height="475" alt="Canyon D-fense Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Canyon D-fense

**Jeu de tower defense militaire — Défendez le canyon contre des vagues d'ennemis.**

[![GitHub Pages](https://img.shields.io/badge/Jouer%20en%20ligne-GitHub%20Pages-orange?style=for-the-badge&logo=github)](https://mansstyle59.github.io/Canyon-D-fense-Mobile-/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

</div>

---

## Jouer

**Directement dans le navigateur :** [mansstyle59.github.io/Canyon-D-fense-Mobile-](https://mansstyle59.github.io/Canyon-D-fense-Mobile-)

---

## Gameplay

Placez des tourelles sur les emplacements disponibles pour stopper les vagues ennemies avant qu'elles n'atteignent votre base. Chaque vague est plus difficile que la précédente — gérez votre budget, améliorez vos tourelles, et utilisez la frappe aérienne au bon moment.

### Tourelles disponibles

| Tourelle | Coût | Cibles | Spécialité |
|---|---|---|---|
| Mitrailleuse Rapide | 50$ | Sol | Cadence élevée, idéale contre l'infanterie |
| Canon Lourd | 120$ | Sol | Perce-blindage, mortel contre les blindés |
| Tourelle DCA | 150$ | Air | Antiaérien exclusif, cadence élevée |
| Mortier Explosif | 250$ | Sol | Dégâts de zone massifs |
| Lance-missiles | 500$ | Sol + Air | Longue portée, tout-terrain |

### Ennemis

Le jeu propose 13 types d'ennemis avec des caractéristiques uniques :

- **Terrestre** — Jeep, Squad, Buggy, Moto, APC, Tank, Heavy Tank, Camion Médic, Mech (boss)
- **Aérien** — Jet, Drone EMP, Hélicoptère furtif, Bombardier

> Les unités **blindées** ignorent 70 % des dégâts des armes non perce-blindage.  
> Les unités **furtives** ne sont détectables qu'à mi-portée.  
> Le **drone EMP** désactive les tourelles proches.  
> Le **camion médic** soigne les ennemis voisins.

### Mécaniques clés

- **Amélioration** — Chaque tourelle peut être améliorée plusieurs fois (+40 % dégâts, +10 % portée et cadence par niveau)
- **Vente** — Revendez une tourelle pour récupérer 50 % de sa valeur totale investie
- **Frappe aérienne** — Disponible dès la vague 5, recharge toutes les 20 secondes — inflige 1 000 dégâts à tous les ennemis
- **Vitesse 2x** — Accélérez le jeu pour passer rapidement les vagues faciles
- **Bonus de vague** — Chaque vague complétée rapporte `50 + N × 25` pièces d'or

---

## Lancer en local

**Prérequis :** Node.js 18+

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le jeu est accessible sur [http://localhost:3000](http://localhost:3000).

### Autres commandes

```bash
npm run build    # Build de production (dossier dist/)
npm run preview  # Prévisualiser le build de production
npm run lint     # Vérification TypeScript
```

---

## Stack technique

- **React 19** + **TypeScript** — Interface et logique de jeu
- **Vite 6** — Build et dev server
- **Tailwind CSS 4** — Styles
- **Motion (Framer Motion)** — Animations des unités et effets visuels
- **SVG** — Rendu du terrain, des unités et des projectiles

---

## Déploiement

Le projet se déploie automatiquement sur GitHub Pages à chaque push sur `main` via GitHub Actions.

Pour activer GitHub Pages sur votre fork :
1. **Settings → Pages → Source** : choisir **GitHub Actions**
2. Pousser sur `main` — le workflow build et déploie automatiquement

URL générée : `https://<username>.github.io/Canyon-D-fense-Mobile-/`

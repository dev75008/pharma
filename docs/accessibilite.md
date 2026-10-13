# Accessibilité et compatibilité

Les tests Playwright avec axe-core contrôlent 15 routes en thème clair et sombre, sur ordinateur et mobile Chromium. Tags : WCAG 2 A/AA, 2.1 AA et 2.2 AA. Ils n’établissent pas une certification de conformité : critères nécessitant une appréciation humaine, lecteurs d’écran et matériels réels restent à examiner.

Contrôles manuels et fonctionnels : lien d’évitement sans changement de route HashRouter ; focus du contenu après navigation ; menu mobile hors du parcours clavier lorsqu’il est fermé, arrière-plan inert lorsqu’il est ouvert, focus dans le menu, fermeture Escape et restitution au bouton après fermeture. Contrôles 3D disponibles au clavier avec alternative textuelle et fichier source. Tableaux équivalents aux graphiques, libellés de formulaires, préférences de mouvement réduit et avertissements de mise à jour conservés.

Les champs de configuration et création sont désactivés pendant le chargement des données locales. Cette mesure évite une saisie perdue lors du premier affichage, observée dans les tests WebKit. Les champs textuels et numériques utilisent l’événement input ; les listes et cases conservent leur comportement de sélection.

42 parcours de compatibilité sous Firefox et WebKit couvrent navigation, stockage, bibliothèque, comparateur, QCM/examens, dossiers, flashcards, sauvegarde et hors ligne. Exécution séquentielle dans cette suite pour éviter la contention des navigateurs sur la machine de vérification. La suite principale Chromium ordinateur/mobile reste parallèle.

Commandes : `npx playwright install chromium firefox webkit`, `npm run test:e2e`, `npm run test:compat`. GitHub Actions exécute les deux suites avant publication. WebKit est une vérification du moteur ; il ne remplace pas un essai sur chaque appareil Safari/iOS réel.

# Accessibilité et compatibilité

Les tests Playwright avec axe-core contrôlent 17 routes en thème clair et sombre, sur ordinateur et mobile Chromium, dont deux pages de famille. Tags : WCAG 2 A/AA, 2.1 AA et 2.2 AA. Ils n’établissent pas une certification de conformité : critères nécessitant une appréciation humaine, lecteurs d’écran et matériels réels restent à examiner.

Contrôles manuels et fonctionnels : lien d’évitement sans changement de route HashRouter ; focus du contenu après navigation ; menu mobile hors du parcours clavier lorsqu’il est fermé, arrière-plan inert lorsqu’il est ouvert, focus dans le menu, fermeture Escape et restitution au bouton après fermeture. Contrôles 3D disponibles au clavier avec alternative textuelle et fichier source. Tableaux équivalents aux graphiques, libellés de formulaires, préférences de mouvement réduit et avertissements de mise à jour conservés.

Les champs de configuration et création sont désactivés pendant le chargement des données locales. Cette mesure évite une saisie perdue lors du premier affichage, observée dans les tests WebKit. Les champs textuels et numériques utilisent l’événement input ; les listes et cases conservent leur comportement de sélection.

56 parcours de compatibilité sous Firefox et WebKit couvrent navigation, stockage, bibliothèque, familles et progression réelle, comparateur, QCM/examens, filtres/mélange, dossiers dont le transversal, flashcards, sauvegarde, OpenFDA et hors ligne. Exécution séquentielle dans cette suite pour éviter la contention des navigateurs sur la machine de vérification. La suite principale Chromium ordinateur/mobile reste parallèle.

Les deux cases de configuration des séances disposent de cibles de 24 px et de zones de ligne de 44 px, avec espacement, après détection axe target-size. Le test OpenFDA retire l’interception de réponse API avant le passage hors ligne : Firefox avait signalé NS_ERROR_OFFLINE au rechargement avec interception active. Trois répétitions Firefox ont ensuite réussi, puis la suite complète ; aucun contournement de l’assertion de rechargement et de lecture du cache n’a été ajouté.

Commandes : `npx playwright install chromium firefox webkit`, `npm run test:e2e`, `npm run test:compat`. GitHub Actions exécute les deux suites avant publication. WebKit est une vérification du moteur ; il ne remplace pas un essai sur chaque appareil Safari/iOS réel.

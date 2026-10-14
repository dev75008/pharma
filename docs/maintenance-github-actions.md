# Maintenance de la publication — 14 octobre 2026

Les versions officielles courantes ont été vérifiées via l’API GitHub des dépôts `actions/*`, avec lecture des releases et des manifests `action.yml`. Les actions JavaScript de checkout, setup-node et deploy-pages utilisent Node 24 ; upload-pages-artifact est une action composite. Le projet continue à être compilé et testé sous Node 24.

Versions sélectionnées, verrouillées par SHA de commit dans le workflow :

- [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) ; commit `3d3c42e5aac5ba805825da76410c181273ba90b1`.
- [setup-node v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0) ; commit `949feb2413d6458794dcd2491c4babbbce0c15c1`.
- [upload-pages-artifact v5.0.0](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) ; commit `fc324d3547104276b827a68afc52ff2a11cc49c9`.
- [deploy-pages v5.0.1](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) ; commit `368f82528645a54fb793d4d04e342629a3f51346`.

L’image `ubuntu-24.04` remplace `ubuntu-latest` pour que le changement annoncé du label latest vers Ubuntu 26 ne modifie pas implicitement l’environnement de test. Les permissions et conditions de publication restent identiques. Aucun secret n’est ajouté au site.

Lors d’une mise à jour : vérifier releases/manifests officiels, résoudre le tag en commit, lire les changements de paramètres et prérequis, puis faire passer la chaîne complète (installation, tests unitaires, trois navigateurs, compilation, contrôle de livraison, artefact et Pages). Le workflow lui-même ne peut pas être validé par une simple compilation Vite : son exécution GitHub est la vérification effective.

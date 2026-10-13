# Phase 6 — suivi, planning et sauvegarde

## Données et calculs

`src/storage/study.ts` lit les tables personnelles dans une transaction IndexedDB. `src/domain/study.ts` calcule les indicateurs et recommandations séparément de l'interface. La migration v9 ajoute `planning` et `studySettings` sans supprimer les données antérieures.

Les corrections réunissent les tentatives de QCM/examens et les étapes validées des dossiers. Chaque tentative est comptée une fois par identifiant, avec son contenu sauvegardé et le score recalculé. Une reprise ne crée pas de nouvelle correction ; une nouvelle séance constitue une nouvelle tentative. La réussite signifie « réponse entièrement correcte », sans assimilation des points partiels ou des autoévaluations de flashcards. Les thèmes transversaux peuvent appartenir à plusieurs classes/spécialités ; leurs lignes ne doivent pas être additionnées.

Les nouvelles étapes cliniques conservent une date de validation `submittedAt`. Pour les anciens dossiers sans cette date, la date de fin, ou à défaut celle du début, sert de repère approximatif, explicitement indiqué dans les statistiques. Aucune date passée précise n'est inventée.

Le temps correspond aux durées écoulées des séances terminées (QCM/examens, cartes et dossiers), pauses et fermetures comprises. Les durées de séances simultanées peuvent se chevaucher ; ce n'est pas un chronomètre d'activité. L'objectif hebdomadaire utilise la date locale de terminaison dans la semaine du lundi au dimanche. Une séance prévue/cochée au planning n'ajoute aucune durée aux statistiques.

Statistiques : compteurs réels, graphique interactif Recharts et tableau équivalent, filtre 7/30/90 jours, résultats par classe/spécialité, dernières réponses échouées, historique des examens, export CSV des corrections. CSV protégé contre l'interprétation de cellules comme formules. Aucun graphique synthétique lorsqu'aucune correction n'existe. Les graphiques sont chargés à la demande dans un bundle séparé, avec couche d'accessibilité et tableau lisible sans graphique.

## Planning et recommandations

Création de séances datées (titre, activité, 5–240 minutes), marquage terminé, retrait, liens vers les modules, reprise hors ligne et sélection des classes importantes. Les changements sont sauvegardés localement ; aucune notification, synchronisation ou export vers un calendrier externe n'est promis.

Priorités documentées et expliquées :

1. Dernières réponses échouées, pour relire le corrigé enregistré.
2. Classes avec au moins trois tentatives et moins de 60 % d'exactitude (seuil pédagogique local).
3. Fiches jamais marquées étudiées, ou dernier marquage datant de plus de 14 jours.
4. Flashcards dues/en retard ; nouvelles cartes accessibles dans le module dédié.
5. Classes importantes choisies par l'étudiant.

Les huit premières propositions forment la séance suggérée. Les seuils sont des conventions locales, pas un classement médical ou une mesure de compétence clinique. Les liens de classe ouvrent le filtre de QCM, sans génération de questions.

## Sauvegarde JSON

Format `app: MEDREVISION`, `version: 1`, date d'export et tables personnelles. Maximum 32 Mo, jusqu'à 10 000 lignes par table. Préférences, favoris, historique, progrès, notes, séances/résultats/tentatives, cartes personnelles, calendrier SM-2, séances/rappels de cartes, dossiers, planning et thèmes sont inclus. Documents API, RCP/notices, bibliographies, banque statique et scores externes Pharmacorama sont exclus. Les instantanés des questions/cartes/dossiers utilisés dans les séances restent inclus pour conserver leur correction et provenance.

Schémas Zod stricts, unicité des identifiants, scores recalculés, durées, références entre copies/résultats/tentatives et séances/rappels contrôlés. Une version inconnue, un fichier invalide ou incohérent est refusé avant écriture. L'aperçu présente la date, version et nombre de données avant l'import.

Import par fusion transactionnelle : ajout des identifiants absents, conservation des données identiques et préférences déjà présentes. Toute autre collision différente annule la transaction entière, y compris les ajouts réalisés avant le conflit. Aucune réinitialisation destructive ou résolution silencieuse par remplacement. Après import sur un appareil neuf, recharger pour appliquer les préférences restaurées. Le fichier est en clair et doit être conservé dans un emplacement personnel. Il s'agit d'un transfert manuel, pas d'une synchronisation ; une sauvegarde importée n'est pas une validation du contenu médical.

## Vérification

Validation locale le 13 octobre 2026 : compilation TypeScript/Vite, 89 tests unitaires et 66 scénarios Playwright réussis. Tests de déduplication, exactitude/points partiels, temps hebdomadaire, échéances, priorités, export/import sur base vide, import idempotent, conflit tardif avec rollback, version et scores invalides, dossier et séance de cartes en cours restaurés. Navigation, planning hors ligne, données graphiques, CSV et restauration sur nouveau contexte navigateur testés sur ordinateur/mobile. Vues Statistiques et Planning inspectées à 390 px sans débordement.

Limites : pas de synchronisation, rappel push, suivi du temps actif, barème national, diagnostic ou validation indépendante du contenu. L'enrichissement documentaire, l'élargissement des banques relues et les autres connecteurs restent les prochaines étapes de la phase 7.

Commit prévu : `feat: add study analytics planning and validated JSON backups`.

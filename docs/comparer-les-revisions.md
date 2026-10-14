# Comparer deux révisions documentaires

Le bilan permet de préparer une nouvelle relecture après une mise à jour des contenus. Il ne remplace ni une analyse médicale des différences ni une relecture qualifiée. Il ne modifie pas le catalogue, les résultats personnels ou les statuts de validation.

Avant une modification, conserver le dossier courant :

```powershell
npm run review:export -- review/avant.json
```

Après la modification et les vérifications pertinentes, exporter la nouvelle version puis produire le bilan :

```powershell
npm run review:export -- review/apres.json
npm run review:diff -- review/avant.json review/apres.json review/differences.json
```

Sans troisième fichier, le bilan est affiché dans le terminal. Les deux fichiers d’entrée sont limités à 10 Mio et leurs empreintes sont recalculées avant toute comparaison. Un dossier altéré ou incohérent est refusé. Le chemin de sortie ne doit pas désigner l’un des fichiers d’entrée.

Le bilan identifie les éléments par leur type et leur identifiant stable : fiche, question, carte ou dossier clinique. Il distingue les ajouts, retraits, modifications et éléments inchangés. Les chemins des propriétés modifiées utilisent JSON Pointer : `/fields/mechanism/value`, par exemple. Les caractères `~` et `/` dans un nom de propriété sont échappés. Les listes sont comparées par position : réordonner des propositions peut produire plusieurs chemins sans changer leur signification pédagogique.

Le détail est limité à 200 chemins par élément ; `truncated: true` signale les détails omis. Le nombre d’éléments modifiés reste complet. Une modification de version ou d’ordre du dossier est signalée séparément et ne devient pas une modification médicale supposée.

Les empreintes ne constituent pas une signature et ne prouvent pas l’identité du relecteur. Elles portent sur les contenus des éléments et la version, pas sur les métadonnées supplémentaires comme le registre global des sources ou la date d’export. Les références présentes dans chaque contenu sont, elles, comparées. Un ancien rapport de relecture n’est jamais transféré automatiquement vers le nouveau dossier : utiliser `review:check` avec le dossier original et exporter une nouvelle demande si le catalogue a changé.

Les fichiers `review/` restent locaux et ignorés par Git. Ils ne contiennent pas les résultats, notes ou favoris de l’étudiant. Le bilan est destiné à la maintenance, pas au diagnostic ou à la prescription.

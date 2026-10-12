# Flashcards et répétition espacée

## Méthode
Source primaire : [Piotr Wozniak, algorithme SM-2](https://www.super-memory.com/english/ol/sm2.htm), consultée le 12 octobre 2026. Implémentation originale TypeScript ; aucune copie du code SuperMemo.
Cette adaptation locale, version sm2-4ratings-v1, réduit l’échelle à quatre choix : À revoir → 2, Difficile → 3, Correct → 4, Facile → 5. Facteur initial 2,5, minimum 1,3.
Après succès : intervalle 1 jour, puis 6 jours, puis plafond technique de 36 500 jours appliqué à l’arrondi supérieur de l’intervalle précédent multiplié par l’ancien facteur. Mise à jour du facteur : max(1,3 ; ancien + 0,1 − (5 − note) × (0,08 + (5 − note) × 0,02)). Après oubli : succès remis à zéro, intervalle 1 jour, facteur ajusté conservé.
Les notes inférieures à 4 replacent la carte en fin de séance. Dans MEDREVISION, ces rappels supplémentaires ne modifient pas une nouvelle fois l’échéance : le premier passage planifie, les autres consolident. Ignorer une carte permet d’interrompre ce rappel sans nouvelle note. Ce choix distingue explicitement l’adaptation de l’algorithme historique.

## Calendrier et compteurs
Les échéances sont des dates YYYY-MM-DD dans le calendrier local du navigateur, avec ajout de jours calendaires à midi pour éviter les décalages du changement d’heure. Le choix du fuseau et l’horloge de l’appareil peuvent modifier le jour courant. Aucune synchronisation multiappareil.
Nouvelles = jamais évaluées en mode planifié ; à échéance = évaluées et prévues au plus tard aujourd’hui ; retard = date strictement passée. Cartes suspendues exclues. La séance du jour ordonne retard, échéance du jour, nouvelles, puis applique le nombre de cartes demandé et les filtres. Le compteur de planifications du jour ignore les rappels supplémentaires et la consultation libre. Aucune autoévaluation n’est comptée comme réponse de QCM ni comme preuve de maîtrise médicale.

## Stockage et reprises
IndexedDB v4 conserve les tables antérieures et ajoute customCards, cardSchedules, cardSessions et cardReviews. Les séances embarquent les versions de cartes, une file de passages et les révisions attendues des échéances. Une évaluation et son avance de file sont écrites dans une transaction, avec identifiant de passage unique : un double clic ne double pas la planification. Si une autre séance ou onglet a modifié la carte, l’évaluation initiale est refusée avec proposition d’ignorer la carte.
Révéler un verso ne compte pas comme révision. Seule une évaluation est enregistrée ; après rechargement, la carte en cours réapparaît au recto. La consultation libre enregistre son historique et sa durée mais ne modifie aucun calendrier. Suspendre conserve l’historique ; réactiver conserve les paramètres et l’échéance précédents.
Le temps de séance affiché sur le dashboard inclut désormais les séances de cartes terminées, ainsi que les évaluations terminées. Pauses et fermeture sont comprises. Cela ne mesure pas l’attention.

## Contenus
20 cartes statiques documentaires issues des champs disponibles des fiches, couvrant les six types demandés et les douze familles. Aucun champ absent n’est transformé en réponse supposée. Les indications sont des exemples de RCP, sans recommandation de traitement ni exclusivité. Chaque carte conserve sa provenance et sa version. Aucune validation médicale indépendante.
Cartes personnelles : recto/verso en texte simple, classe et référence HTTPS facultative. Origine = saisie locale de l’étudiant ; la référence n’est ni téléchargée ni présentée comme consultée. Le statut personal-unverified est imposé. Aucun HTML saisi n’est exécuté. Création disponible ; édition/suppression personnalisée et sauvegarde JSON réimportable restent à ajouter.
Les séances et cartes sont utilisables hors ligne après une première visite de production et la fin du précache. Les pages sources externes ne sont pas garanties hors ligne. Les données peuvent disparaître après réinitialisation du navigateur.

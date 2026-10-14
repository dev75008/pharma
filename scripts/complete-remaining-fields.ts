import {readFile, writeFile} from 'node:fs/promises';
import type {Drug, FieldKey, Provenance, ScientificField} from '../src/domain/models';
import {parseDrugs} from '../src/domain/validation';
// Lot éditorial daté ; références lues manuellement, pas de génération réseau ni d'actualisation automatique.
const file = 'src/data/drugs.json';
const drugs = JSON.parse(await readFile(file, 'utf8')) as Drug[];
parseDrugs(drugs);
const pending = drugs.flatMap(d => Object.entries(d.fields).filter(([, f]) => f.status === 'missing').map(([key]) => ({drugId:d.id, key:key as FieldKey})));
if (pending.length !== 103) throw Error('Ce lot attend exactement les 103 rubriques de la version 823063f.');
const get = (id:string) => drugs.find(d => d.id === id)!;
function ref(id:string, section:string):Provenance {
  const original = get(id).fields.brands.evidence[0];
  return {...original, consultedAt:'2026-10-14', locator:`${id==='apixaban'?'RCP européen ELIQUIS 5 mg, document anglais, pages 36–65':'RCP '+get(id).fields.brands.value} ; rubrique(s) ${section}`};
}
const college = (url:string, locator:string, date:string|null=null):Provenance => ({sourceId:'cnpm',url,locator,consultedAt:'2026-10-14',sourceUpdatedAt:date});
const iv = college('https://pharmacomedicale.org/pharmacologie/pharmacocinetique/36-etapes-du-devenir-du-medicament/74-absorption','CNPM Absorption, voie intraveineuse et définition de F ; paraphrase originale','2024-05-23');
const antiAldo = college('https://pharmacomedicale.org/medicaments/par-specialites/item/anti-aldosterone-et-apparentes','CNPM Anti-aldostérone, cible et effets hormonaux dose-dépendants ; mécanisme seulement, pas de recommandation copiée');
const ampk = college('https://pharmacomedicale.org/medicaments/par-specialites/item/antidiabetiques-les-points-essentiels','CNPM Antidiabétiques, mécanismes des biguanides : activation AMPK, mécanisme non complètement élucidé');
const steroidCyp = college('https://pharmacomedicale.org/pharmacologie/les-sources-de-variabilite-de-la-reponse-au-medicament/45-variabilites-pharmacocinetiques/101-inhibitions-enzymatiques','CNPM Inhibitions enzymatiques : prednisolone parmi les substrats CYP3A4 ; aucune table reproduite','2025-06-05');
const usSpironolactone:Provenance = {sourceId:'dailymed',url:'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ae0dcb4e-63df-459c-8e60-0caa817b8135',consultedAt:'2026-10-14',sourceUpdatedAt:'2026-02-04',locator:'DailyMed SPIRONOLACTONE comprimés 25/50/100 mg, 12.3 ; étiquetage américain, mise à jour de la page, pas RCP BIOGARAN français'};
function add(id:string, key:FieldKey, value:string, section:string, scope:ScientificField['scope']='context', extra:Provenance[]=[]) {
  const d = get(id); if(d.fields[key].status!=='missing')throw Error('Remplacement interdit : '+id+'/'+key);
  d.fields[key]={status:'available',value,verification:'source-checked',scope,
    context:`Synthèse partielle ; formulation et population de la référence à conserver. ${id==='sertraline'?'RCP historique : autorisation de cette spécialité abrogée le 30/09/2024. ':''}Aucune validation indépendante ni prescription individuelle.`,
    evidence:[ref(id,section),...extra]};
}
// Pharmacodynamie : ne pas transformer une titration ou une cinétique linéaire en courbe dose–effet.
add('ramipril','doseResponse','Dans la population pédiatrique étudiée au RCP, la réponse tensionnelle n’était pas linéaire avec la dose. Ne pas extrapoler à une courbe universelle adulte.','5.1');
add('losartan','doseResponse','Chez les adultes hypertendus, augmenter 50 à 100 mg/j peut accroître l’efficacité chez certains patients ; pas de réponse individuelle garantie.','4.2');
add('rivaroxaban','doseResponse','Inhibition du facteur Xa dose-dépendante chez l’humain ; le TQ dépend aussi du réactif. L’INR n’est pas une mesure adaptée de cet effet.','5.1');
add('prednisolone','doseResponse','À forte dose, diminution de la réponse immunitaire décrite ; aucune courbe quantitative universelle n’est fournie ici.','5.1');
add('levetiracetam','doseResponse','Essais adultes en association, crises partielles : réponses ≥ 50 % chez 27,7 %, 31,6 % et 41,3 % aux doses étudiées de 1 000, 2 000 et 3 000 mg/j ; résultats de groupes, pas prédiction individuelle.','5.1');
add('rivaroxaban','physiologicalEffects','Frein à la formation de thrombine et au développement du thrombus ; pas d’inhibition directe de la thrombine.','5.1','molecule');
add('rivaroxaban','therapeuticEffects','Anticoagulation pour les indications de prévention en FANV et de traitement/prévention des récidives de TVP–EP définies au RCP.','4.1, 5.1','specialty');
add('sertraline','therapeuticEffects','Dans le RCP historique : effet antidépresseur et effet dans les TOC ; les autres indications sont distinctes.','4.1, 5.1','specialty');
add('levetiracetam','actionType','Liaison à SV2A décrite ; le RCP ne la définit pas comme un agonisme ou antagonisme classique. Mécanisme incomplètement élucidé.','5.1','molecule');
add('metformine','target','Voie impliquée : AMPK hépatique. Son activation est décrite, sans démontrer ici une liaison directe à une cible unique ou exclusive.','5.1','context',[ampk]);
add('metformine','actionType','Activation de voies métaboliques, notamment AMPK ; le mécanisme demeure incomplètement élucidé, sans classification comme agoniste d’un récepteur dans cette synthèse.','5.1','context',[ampk]);
add('spironolactone','target','Récepteur des minéralocorticoïdes (aldostérone) ; antagoniste non spécifique, avec interactions hormonales également décrites.','5.1','molecule',[antiAldo]);
add('spironolactone','doseResponse','Des effets hormonaux, notamment gynécomastie et impuissance, sont décrits comme dose-dépendants au CNPM. Ce n’est pas une courbe d’efficacité antihypertensive.','4.8','context',[antiAldo]);
// Pharmacocinétique : toujours préserver la forme, la voie, le métabolite et la provenance.
add('ramipril','distribution','Liaison aux protéines sériques : ramipril environ 73 %, ramiprilate environ 56 %. Ce paramètre de distribution ne fournit pas un volume de distribution.','5.2','context');
add('clopidogrel','distribution','In vitro : liaison réversible aux protéines, clopidogrel 98 % et principal métabolite circulant inactif 94 %, non saturable sur la gamme étudiée.','5.2');
add('furosemide','absorption','Voie IV : arrivée directe dans la circulation, sans étape d’absorption extravasculaire. Cette description ne documente pas la voie IM ou une forme orale.','4.2','context',[iv]);
for(const id of ['furosemide','paracetamol'])add(id,'bioavailability','Pour la voie IV uniquement : biodisponibilité absolue de 100 % par définition. Ne pas extrapoler à une autre voie ou formulation.','4.2','context',[iv]);
add('furosemide','hepaticAdjustment','Œdèmes hépatiques : ajustement prudent pour une perte liquidienne progressive ; tenir compte des contre-indications en précoma/coma hépatique. Pas de formule universelle selon Child-Pugh.','4.2–4.3');
add('paracetamol','hepaticContext','Perfusion : insuffisance hépatocellulaire sévère contre-indiquée ; facteurs de risque hépatiques imposent les limites propres au RCP, sans extrapolation orale.','4.2–4.4','specialty');
add('prednisolone','cyp','Le CNPM classe la prednisolone parmi les médicaments métabolisés par CYP3A4 ; le RCP de cette forme ne quantifie pas sa contribution.','4.5, 5.2','molecule',[steroidCyp]);
add('spironolactone','bioavailability','Étiquetage américain, comprimés étudiés : repas associé à une hausse d’ASC d’environ 95,4 %. Ce n’est pas une biodisponibilité absolue de 95,4 %.','5.2','context',[usSpironolactone]);
add('spironolactone','proteinBinding','Étiquetage américain : spironolactone et métabolites liés à plus de 90 % aux protéines plasmatiques.','5.2','context',[usSpironolactone]);
add('spironolactone','halfLife','Étiquetage américain : molécule environ 1,4 h ; canrénone 16,5 h, TMS 13,8 h, HTMS 15 h. Ces valeurs ne sont pas une durée d’effet.','5.2','context',[usSpironolactone]);
for(const key of ['bioavailability','proteinBinding','halfLife'] as const){const f=get('spironolactone').fields[key];if(f.status==='available'){f.evidence=[usSpironolactone];f.context='Source américaine de pharmacocinétique, distincte du RCP BIOGARAN. Aucun transfert d’indication, posologie ou équivalence de formulation en France ; pas de validation indépendante.';}}
add('spironolactone','renalAdjustment','Adulte NYHA III/IV : le RCP adapte la dose selon kaliémie et créatininémie, avec réduction/arrêt aux seuils de 4.2. Ce cadre ne constitue pas une règle universelle selon le DFG.','4.2–4.4');
add('spironolactone','hepaticAdjustment','Ascite cirrhotique : adaptation selon réponse diurétique et bilan électrolytique ; stade terminal hépatique contre-indiqué. Pas d’algorithme chiffré selon Child-Pugh.','4.2–4.3');
// Contextes et rôles réglementaires : pas de prétention à une recommandation générale de première ligne.
add('losartan','clinicalContexts','Exemple : adulte ou enfant/adolescent de 6 à 18 ans avec HTA essentielle ; modalités pédiatriques et poids à lire séparément.','4.1–4.2','specialty');
add('rivaroxaban','clinicalContexts','Exemple adulte : TVP ou EP et prévention des récidives. Le schéma et la durée dépendent du contexte du RCP.','4.1–4.2','specialty');
add('metformine','clinicalContexts','Exemple : adulte en surcharge pondérale avec diabète de type 2 insuffisamment contrôlé par alimentation et exercice.','4.1','specialty');
const roles:Record<string,string>={
 bisoprolol:'Cadre du RCP TEVA 10 mg : HTA et angor stable ; d’autres formulations sont nécessaires pour le traitement de l’insuffisance cardiaque chronique.',
 ramipril:'Cadre du RCP : HTA en monothérapie ou association ; autres rôles cardiovasculaires et rénaux soumis à leurs critères propres.',
 losartan:'En insuffisance cardiaque chronique : rôle lorsque l’IEC est inadapté ; ne pas relayer automatiquement un patient stabilisé par IEC.',
 rivaroxaban:'Cadre du RCP : prévention en FANV et traitement/prévention de récidives de TVP–EP ; indications et schémas distincts.',
 clopidogrel:'Cadre du RCP : prévention secondaire athérothrombotique ; dans certains syndromes coronaires aigus, association à l’aspirine selon critères précis.',
 amoxicilline:'Cadre du RCP : infections bactériennes des indications autorisées, avec prise en compte de la sensibilité et des recommandations officielles. Pas de première ligne universelle.',
 prednisolone:'Cadre du RCP : contrôle initial de la maladie, puis dose minimale efficace ; décroissance prudente après traitement prolongé selon maladie et durée.',
 sertraline:'RCP historique : dose minimale efficace à l’entretien ; réévaluation régulière du traitement prolongé. Rôles différents selon l’indication.',
 levetiracetam:'Cadre du RCP : monothérapie ou association selon type de crise et âge ; ne pas transposer les critères d’une indication à une autre.',
 apixaban:'Cadre européen : anticoagulation dans les indications autorisées, selon risque et contexte. Aucun classement universel entre AOD.',
 spironolactone:'Cadre du RCP : en insuffisance cardiaque adulte NYHA III/IV, ajout au traitement décrit, avec surveillance potassique/rénale.',
};
for(const [id,value] of Object.entries(roles))add(id,'therapeuticStrategy',value,'4.1–4.4','specialty');
// RCP européen ELIQUIS 5 mg : sécurité adulte et distinctions de critères.
add('apixaban','physiologicalEffects','Réduction de génération de thrombine et de formation du thrombus ; pas d’inhibition plaquettaire directe.','5.1','molecule');
add('apixaban','therapeuticEffects','Effet anticoagulant dans les indications FANV et TVP–EP autorisées.','4.1, 5.1','specialty');
add('apixaban','doseResponse','Relation concentration–activité anti-Xa approximativement linéaire ; pas une équivalence de doses entre AOD.','5.1');
add('apixaban','renalAdjustment','Adulte : réduction selon indication, âge, poids, créatinine et clairance ; en FANV, lire ensemble les critères de 4.2.','4.2');
add('apixaban','hepaticAdjustment','Adulte Child-Pugh A/B : prudence, sans adaptation systématique ; atteinte sévère non recommandée.','4.2');
add('apixaban','clinicalContexts','Exemple : adulte avec FANV et facteur(s) de risque définis au RCP.','4.1','specialty');
add('apixaban','commonEffects','Adulte FANV/traitement TVP–EP : épistaxis, hématurie et hémorragie digestive classées fréquentes ; autres populations distinctes.','4.8, tableau 3');
add('apixaban','seriousEffects','Hémorragies majeures, notamment intracrâniennes ou digestives ; gravité distincte de fréquence.','4.4, 4.8');
add('apixaban','precautions','Risque hémorragique accru avec antiagrégants, AINS et certains antidépresseurs ; procédures invasives à anticiper.','4.4–4.5');
add('apixaban','pregnancy','Utilisation de préférence évitée par précaution ; absence de données humaines dans ce RCP.','4.6');
add('apixaban','breastfeeding','Passage dans le lait humain inconnu ; choix entre arrêt d’allaitement ou traitement après balance bénéfice/risque.','4.6');
add('apixaban','renalContext','Adulte : clairance < 15 mL/min ou dialyse non recommandées ; clairance 15–29, précautions selon indication.','4.2, 4.4');
add('apixaban','hepaticContext','Hépatopathie avec coagulopathie et risque hémorragique cliniquement pertinent : contre-indication.','4.2–4.3');
add('apixaban','essentials','1. Xa direct.\n2. Anticoagulant.\n3. Saignement.\n4. Critères rénaux contextualisés.\n5. Associations à vérifier.','4.1–4.5, 5.1');
// Créations pédagogiques courtes : seules les notions sous-jacentes sont référencées.
const mnemonics:Record<string,[string,FieldKey[]]>={
 bisoprolol:['« BISO → Bêta-1 préférentiel ».',['target','mechanism']],
 ramipril:['« RAMI → RAMIPRILATE → IEC ».',['activeMetabolites','mechanism']],
 losartan:['« LOSARTAN → AT1 ».',['target','mechanism']],
 furosemide:['« FURO → Fuite de sel et de potassium ».',['physiologicalEffects']],
 rivaroxaban:['« RIVA bloque Xa ».',['target','mechanism']],
 clopidogrel:['« CLOP : converti, puis P2Y12 ».',['metabolism','target']],
 amoxicilline:['« AMOXI attaque la paroi ».',['mechanism']],
 metformine:['« MET : Moins de glucose hépatique, Élimination rénale, Tolérance digestive ».',['mechanism','elimination','commonEffects']],
 paracetamol:['« Douleur–Fièvre ; Dose totale ; Danger hépatique ».',['therapeuticEffects','precautions','seriousEffects']],
 ibuprofene:['« IBU : inhibition COX ; vigilance Rein–Estomac ».',['mechanism','contraindications']],
 prednisolone:['« Corticoïde : inflammation freinée, vigilance infectieuse ».',['therapeuticEffects','clinicalMonitoring']],
 sertraline:['« SERTRALINE → SÉROTONINE recapturée moins ».',['mechanism']],
 levetiracetam:['« LÉVÉ : liaison vésiculaire SV2A ».',['target','mechanism']],
 apixaban:['« APIXABAN → Anti-Xa ».',['target','mechanism']],
 spironolactone:['« SPIRO : Sel sort, Potassium reste ».',['mechanism','physiologicalEffects']],
};
for(const [id,[value,keys]] of Object.entries(mnemonics)){add(id,'mnemonics',value,'5.1','context');const f=get(id).fields.mnemonics;if(f.status==='available'){f.presentation='pedagogical';f.context='Aide mémoire originale, non officielle et non validée. Raccourci incomplet ; ne fournit ni indication ni règle de prescription. Les sources établissent les notions, pas ce moyen mnémotechnique.';f.evidence=keys.flatMap(k=>get(id).fields[k].evidence);}}
const pairs:Record<string,[string,string]>={
 bisoprolol:['losartan','Bisoprolol : bêta-1 préférentiel ; losartan : AT1. Deux cibles antihypertensives distinctes.'],
 clopidogrel:['rivaroxaban','Clopidogrel : antiagrégant P2Y12 après activation ; rivaroxaban : anticoagulant Xa direct.'],
 amoxicilline:['prednisolone','Amoxicilline : antibiotique agissant sur la paroi bactérienne ; prednisolone : glucocorticoïde anti-inflammatoire.'],
 metformine:['prednisolone','Metformine : effet sur le métabolisme du glucose ; prednisolone : glucocorticoïde. Mécanismes distincts, sans relation de substitution.'],
 paracetamol:['ibuprofene','Paracétamol : antalgique/antipyrétique, mécanisme non entièrement établi ; ibuprofène : AINS inhibant la cyclo-oxygénase.'],
 ibuprofene:['paracetamol','Ibuprofène : AINS inhibant la cyclo-oxygénase ; paracétamol : antalgique/antipyrétique au mécanisme non entièrement établi.'],
 prednisolone:['ibuprofene','Prednisolone : glucocorticoïde ; ibuprofène : AINS. Les mécanismes de l’effet anti-inflammatoire sont distincts.'],
 sertraline:['levetiracetam','Sertraline : recapture de sérotonine ; lévétiracétam : liaison à SV2A. Cibles neurologiques distinctes, sans équivalence thérapeutique.'],
 levetiracetam:['sertraline','Lévétiracétam : liaison à SV2A ; sertraline : recapture de sérotonine. Cibles distinctes, sans équivalence thérapeutique.'],
};
for(const [id,[other,value]] of Object.entries(pairs)){add(id,'comparisons',value,'5.1','context');const f=get(id).fields.comparisons;if(f.status==='available'){f.presentation='pedagogical';f.context='Comparaison de notions documentées, parfois entre classes différentes. Ne démontre ni équivalence ni supériorité ; pas de choix thérapeutique individuel.';f.evidence=[...get(id).fields.mechanism.evidence,...get(other).fields.mechanism.evidence];}}
// Réexamens explicites des données qui ne sont pas établies : restent null, jamais une valeur supposée.
const limits:Record<string,Partial<Record<FieldKey,[string,'not-reported'|'uncertain',string]>>>={
 bisoprolol:{doseResponse:['Le RCP fournit une titration, pas une courbe quantitative dose–effet dans les rubriques consultées.','not-reported','4.2, 5.1'],cyp:['La rubrique de biotransformation ne nomme pas de CYP impliqué ; ne pas attribuer celui d’un autre bêtabloquant.','not-reported','5.2']},
 ramipril:{cyp:['La biotransformation est décrite sans CYP identifié dans cette rubrique ; activation en ramiprilate ne signifie pas activation par CYP.','not-reported','5.2']},
 furosemide:{cyp:['Le RCP décrit excrétion inchangée et glucuroconjugaison, sans CYP nommé dans la rubrique consultée.','not-reported','5.2'],activeMetabolites:['Le glucuronide est mentionné, sans activité thérapeutique de métabolite établie dans cette rubrique.','uncertain','5.2']},
 clopidogrel:{doseResponse:['Une inhibition moyenne de 40–60 % à 75 mg/j est décrite, mais ce résultat à dose fixe ne fournit pas une courbe dose–effet.','not-reported','5.1'],bioavailability:['Le RCP donne une absorption ≥ 50 %, pas une biodisponibilité absolue ; ne pas convertir un taux d’absorption en F.','not-reported','5.2']},
 amoxicilline:{cyp:['Aucune enzyme CYP de biotransformation n’est nommée dans la rubrique consultée ; absence de mention ne signifie pas absence de toute interaction.','not-reported','5.2']},
 metformine:{doseResponse:['Titration selon glycémie et absorption saturable ne fournissent pas une courbe pharmacodynamique universelle.','not-reported','4.2, 5.2'],cyp:['Le RCP décrit excrétion inchangée sans métabolite humain identifié ; il ne caractérise pas de CYP impliqué.','not-reported','5.2']},
 paracetamol:{target:['Le RCP indique que le mécanisme précis n’est pas établi : aucune cible moléculaire unique ne peut être affirmée ici.','uncertain','5.1'],actionType:['Aucun agonisme, antagonisme ou inhibition moléculaire unique établi par le RCP consulté.','uncertain','5.1'],doseResponse:['La linéarité pharmacocinétique mentionnée ne démontre pas une relation dose–effet antalgique linéaire.','not-reported','5.1–5.2'],activeMetabolites:['L’intermédiaire réactif décrit est toxique, pas présenté comme un métabolite thérapeutique actif.','uncertain','5.2']},
 ibuprofene:{doseResponse:['Les doses recommandées et les effets COX ne fournissent pas de courbe quantitative dose–effet dans ce RCP.','not-reported','4.2, 5.1'],bioavailability:['Le délai du pic et l’absorption rapide sont décrits, sans fraction absolue F chiffrée dans cette rubrique.','not-reported','5.2']},
 prednisolone:{bioavailability:['Le délai du pic oral ne donne pas une biodisponibilité absolue ; aucune fraction F fournie dans cette rubrique.','not-reported','5.2'],distribution:['La rubrique intitulée distribution rapporte une demi-vie, sans volume ou distribution tissulaire utilisable ici.','not-reported','5.2'],proteinBinding:['Aucune fraction de liaison protéique n’est fournie pour cette référence ; ne pas emprunter celle du budésonide.','not-reported','5.2'],activeMetabolites:['Le métabolisme hépatique est mentionné sans métabolite thérapeutique actif caractérisé dans cette rubrique.','not-reported','5.2'],renalAdjustment:['Précautions et surveillance ne donnent pas un algorithme de dose selon le DFG dans les rubriques consultées.','not-reported','4.2, 4.4'],hepaticAdjustment:['Pas de schéma d’adaptation chiffré par sévérité hépatique dans les rubriques consultées ; ne pas affirmer qu’aucune adaptation n’est nécessaire.','not-reported','4.2, 4.4']},
 sertraline:{doseResponse:['Le RCP historique décrit une titration et une cinétique dose-dépendante, pas une courbe universelle d’efficacité clinique.','not-reported','4.2, 5.2'],activeMetabolites:['La N-desméthylsertraline est décrite, mais son activité thérapeutique n’est pas caractérisée dans la rubrique consultée.','uncertain','5.2']},
 spironolactone:{cyp:['La rubrique française décrit les métabolites sans enzyme CYP identifiée ; ne pas en déduire une absence générale d’interactions.','not-reported','5.2']},
};
for(const [id,fields] of Object.entries(limits))for(const [key,tuple] of Object.entries(fields)){const [reason,kind,section]=tuple!;const f=get(id).fields[key as FieldKey];if(f.status!=='missing')throw Error('Limite pour champ déjà rempli.');f.reason=reason;f.scope='context';f.context=`Référence ${get(id).fields.brands.value}, ${id==='sertraline'?'historique ; ':''}limite documentaire circonscrite aux rubriques citées. Aucune conclusion d’absence de risque.`;f.absenceReview={checkedAt:'2026-10-14',kind,evidence:[ref(id,section)]};}
for(const d of drugs){for(const key of ['essentials','examTraps','comparisons','mnemonics'] as const){const f=d.fields[key];if(f.status==='available')f.presentation='pedagogical';}d.contentVersion='2026.10.14-9';}
const rows=pending.map(({drugId,key})=>{const f=get(drugId).fields[key];if(f.status==='missing'&&!f.absenceReview)throw Error('Rubrique non examinée : '+drugId+'/'+key);return {drugId,key,outcome:f.status==='available'?'documented':'source-limit',pedagogical:f.status==='available'&&f.presentation==='pedagogical',evidence:f.status==='available'?f.evidence:f.absenceReview!.evidence};});
parseDrugs(drugs);
await writeFile(file,JSON.stringify(drugs,null,2)+'\n');
await writeFile('src/data/completion-audit.json',JSON.stringify({schemaVersion:1,reviewedAt:'2026-10-14',baselineCommit:'823063f',rows},null,2)+'\n');
console.log(JSON.stringify({examined:rows.length,added:rows.filter(r=>r.outcome==='documented').length,limits:rows.filter(r=>r.outcome==='source-limit').length}));

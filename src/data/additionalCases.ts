import {clinicalReasoningQuestions} from './clinicalReasoningQuestions';
import type {ProgressiveCase} from '../domain/clinicalCases';
function dossier(id:string,title:string,specialtyIds:string[],treatments:string,steps:[string,string,string][]):ProgressiveCase{
 const content=steps.map(([questionId,title,information],i)=>{const q=clinicalReasoningQuestions.find(q=>q.id===questionId);if(!q)throw Error('Question de dossier absente.');return {id:String(i+1),title,information,question:{...q,id:`case-${id}-${i+1}`}};});
 return {id,title,specialtyIds,fictional:true,introduction:'Dossier original de démonstration. Patient, antécédents et examens entièrement fictifs ; aucune prescription pour une personne réelle.',patient:{history:'Alex, 72 ans, personnage fictif ; les antécédents utiles seront fournis à chaque étape.',treatments,symptoms:'Aucun diagnostic à établir à partir d’un symptôme isolé.',vitals:'Aucune constante nécessaire à l’exercice fournie.'},contentVersion:'2026-10-14.4',steps:content,evidence:content.flatMap(s=>s.question.evidence),validationStatus:'demo'};
}
export const additionalCases:ProgressiveCase[]=[
 dossier('apixaban-hemostase','Apixaban : cible, interactions et surveillance',['cardiologie','medecine-generale'],'Apixaban mentionné sans dose ; l’indication est déjà connue dans le dossier fictif.',[
 ['apixaban-cible-clinique','Identifier la cible','La vignette mentionne une fibrillation atriale non valvulaire connue. Aucune décision d’instauration n’est demandée.'],
 ['apixaban-interactions-hemostase','Examiner les associations','Des traitements associés sont maintenant évoqués à titre hypothétique. Identifier les familles signalées dans le RCP.'],
 ['apixaban-exposition-surveillance','Distinguer les surveillances','Le dossier fournit un INR, sans valeur utile. Lire les limites des tests et les conditions d’un dosage exceptionnel.']]),
 dossier('spironolactone-potassium','Spironolactone : potassium et associations',['cardiologie','nephrologie'],'Spironolactone mentionnée sans dose.',[
 ['spironolactone-epargne','Relier la classe au mécanisme','Insuffisance cardiaque systolique déjà connue dans la vignette ; le traitement est fourni, aucune ordonnance à construire.'],
 ['spironolactone-iec-risque','Lire une interaction','Le dossier mentionne maintenant un IEC associé. Identifier un risque, sans conclure que toute association est contre-indiquée.'],
 ['spironolactone-bilan','Construire la surveillance documentaire','Un bilan biologique doit être préparé dans l’exercice. Choisir les paramètres documentés, sans fixer une fréquence individualisée.']]),
 dossier('metformine-contraste','Metformine : contraste iodé et réévaluation',['endocrinologie','nephrologie'],'Metformine mentionnée chez un adulte fictif avec diabète de type 2.',[
 ['metformine-contraste-mecanisme','Comprendre le risque','Une injection intravasculaire de contraste iodé est envisagée dans la vignette fictive. Lire le mécanisme de risque du RCP.'],
 ['metformine-contraste-reprise','Lire les conditions de reprise','L’examen fictif est passé depuis 48 heures. Le résultat du contrôle rénal n’est pas encore connu ; le délai seul ne règle pas la question.'],
 ['metformine-deshydratation','Intégrer un événement intercurrent','La dernière étape ajoute vomissements sévères et déshydratation fictifs. La situation a changé ; une ancienne valeur rénale ne suffit pas à l’interpréter.']])
];

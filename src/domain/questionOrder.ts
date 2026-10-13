import type {Question} from './models';
// L'ordre fait partie de l'instantané sauvegardé, jamais recalculé à la reprise.
export function shuffledQuestions(input:Question[],random:()=>number=Math.random):Question[]{
 function shuffle<T>(values:T[]):T[]{const result=[...values];for(let i=result.length-1;i>0;i--){const sample=random();if(!Number.isFinite(sample)||sample<0||sample>=1)throw new Error('Tirage invalide.');const j=Math.floor(sample*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
 const copied=structuredClone(input).map(q=>({...q,options:shuffle(q.options),...(q.associationChoices?{associationChoices:shuffle(q.associationChoices)}:{})}));
 return shuffle(copied);
}

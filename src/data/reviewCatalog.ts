import {drugs} from './drugs';
import {questions,questionContentVersion} from './questions';
import {flashcards} from './flashcards';
import {clinicalCases} from './clinicalCases';
import {sources} from './sources';
import {createReviewPacket,type ReviewEntry} from '../domain/contentReview';
export async function catalogReviewPacket(){
 const entries:ReviewEntry[]=[...drugs.map(content=>({kind:'drug' as const,id:content.id,content})),...questions.map(content=>({kind:'question' as const,id:content.id,content})),...flashcards.map(content=>({kind:'flashcard' as const,id:content.id,content})),...clinicalCases.map(content=>({kind:'case' as const,id:content.id,content}))];
 return {...await createReviewPacket(entries,questionContentVersion),sources,notice:'Dossier documentaire destiné à une relecture humaine qualifiée. Aucune validation indépendante obtenue par cet export. Pas de résultats, notes, favoris ou cartes personnelles.'};
}

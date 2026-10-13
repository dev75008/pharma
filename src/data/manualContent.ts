import raw from './manual-content.json';
import {contentPackSchema} from '../domain/contentPack';
export const manualContent=contentPackSchema.parse(raw);
export function withImported<T extends {id:string}>(base:T[],extra:T[]){if(extra.some(row=>base.some(b=>b.id===row.id)))throw new Error('Un contenu importé ne peut remplacer un identifiant existant.');return [...base,...extra];}

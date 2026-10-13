import {db} from './db';
import {personalTables,studySnapshot} from './study';
import {backupSchema,canonicalJson,MAX_BACKUP_BYTES,parseBackup,type Backup} from '../domain/backup';
export async function exportBackup(){const backup=backupSchema.parse({app:'MEDREVISION',version:1,exportedAt:new Date().toISOString(),data:await studySnapshot()});const text=JSON.stringify(backup,null,2);if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw new Error('Sauvegarde supérieure à la limite de 32 Mo.');return text;}
export async function importBackup(raw:Backup|string){const backup=typeof raw==='string'?parseBackup(raw):backupSchema.parse(raw);return db.transaction('rw',personalTables.map(name=>db.table(name)),async()=>{
 let added=0,unchanged=0;for(const name of personalTables){const table=db.table(name);for(const row of backup.data[name]){const key=table.schema.primKey.keyPath as string;const existing=await table.get((row as unknown as Record<string,string>)[key]);if(existing){if(name==='preferences'){unchanged++;continue;}if(canonicalJson(existing)!==canonicalJson(row))throw new Error(`Conflit dans ${name} : une donnée existante diffère. Import annulé, aucune donnée modifiée.`);unchanged++;}else{await table.add(row);added++;}}}
 return {added,unchanged};
});}

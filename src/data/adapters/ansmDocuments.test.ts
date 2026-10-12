import { expect, it, vi } from 'vitest';
import doc from '../../../e2e/fixtures/rcp-excerpt.json';
import { ansmDocumentSchema, fetchDocument } from './ansmDocuments';
import { sanitizeDocument } from '../../features/library/SourceDocumentContent';

it('contrôle identité, type, date et unicité des rubriques documentaires',async()=>{
 const fetcher=vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(doc),{headers:{'Content-Type':'application/json','Cache-Control':'max-age=14400'}}));
 const entry=await fetchDocument('60524826','rcp',fetcher);
 expect(entry.document.miseAJour).toBe('2025-10-20');
 expect(entry.expiresAt-Date.parse(entry.retrievedAt)).toBe(3600000);
 expect(ansmDocumentSchema.safeParse({...doc,sections:[doc.sections[0],doc.sections[0]]}).success).toBe(false);
 expect(ansmDocumentSchema.safeParse({...doc,miseAJour:'2025-02-31'}).success).toBe(false);
 await expect(fetchDocument('61599041','rcp',fetcher)).rejects.toMatchObject({code:'invalid-data'});
});
it('assainit le HTML externe et préserve la structure des tableaux et le texte',()=>{
 const clean=sanitizeDocument('<script>alert(1)</script><p onclick="alert(2)">Texte <strong>conservé</strong></p><img src=x onerror=alert(3)><a href="javascript:alert(4)">libellé</a><table><tr><td colspan="2">Cellule</td></tr></table>');
 expect(clean).not.toMatch(/script|onclick|onerror|javascript|<img|<a /);
 expect(clean).toContain('<strong>conservé</strong>');expect(clean).toContain('colspan="2"');
});

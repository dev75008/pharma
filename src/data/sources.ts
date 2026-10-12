// Registre initial : liens uniquement. Aucun droit ni accès API n'est présumé.
export interface ScientificSource { id: string; name: string; url: string; domain: string; accessPolicy: string; integrationStatus: 'link-only' | 'manual-summary' | 'api' ; }
export const sources: ScientificSource[] = [
 ['giygas', 'Medicaments API — Giygas', 'https://medicaments-api.giygas.dev/', 'Données réglementaires BDPM retransmises par un service indépendant'],
 ['bdpm', 'Base de données publique des médicaments', 'https://base-donnees-publique.medicaments.gouv.fr/', 'Informations réglementaires françaises'],
 ['pharmacorama', 'Pharmacorama', 'https://www.pharmacorama.com/', 'Pharmacologie pédagogique'],
 ['cbip', 'CBIP', 'https://www.cbip.be/fr/chapters', 'Pharmacothérapie belge'],
 ['pubchem', 'PubChem', 'https://pubchem.ncbi.nlm.nih.gov/', 'Structures et propriétés chimiques'],
 ['drugbank', 'DrugBank', 'https://go.drugbank.com/about', 'Médicaments et cibles'],
 ['chembl', 'ChEMBL', 'https://www.ebi.ac.uk/chembl/', 'Bioactivité moléculaire'],
 ['theriaque', 'Thériaque — CNHIM', 'https://www.theriaque.org/', 'Monographies, interactions et informations sur les médicaments en France'],
 ['vidal', 'VIDAL', 'https://www.vidalfrance.com/fonctionnalites/monographie', 'Monographies'],
 ['sm2', 'SM-2 — Piotr Wozniak', 'https://www.super-memory.com/english/ol/sm2.htm', 'Algorithme de répétition espacée (source méthodologique)'],
 ['iupac', 'IUPAC Gold Book', 'https://goldbook.iupac.org/terms/view/L03515', 'Terminologie chimique et demi-vie'],
 ['ansm', 'ANSM', 'https://ansm.sante.fr/documents/reference/repertoire-des-medicaments', 'Répertoire et sécurité des médicaments'],
].map(([id, name, url, domain]) => ({ id, name, url, domain, accessPolicy: 'Conditions de réutilisation, API, quotas et CORS à vérifier avant intégration.', integrationStatus: id==='bdpm'?'manual-summary':'link-only' }));

// Vérification des offres officielles le 12 octobre 2026.
const theriaque = sources.find(s => s.id === 'theriaque')!;
theriaque.accessPolicy = 'Consultation gratuite après inscription selon le site officiel. Intégration logicielle et extractions proposées par le CNHIM : droits, coûts et documentation à obtenir. Aucun accès API gratuit de redistribution vérifié ; aucun import automatique activé.';
const vidal = sources.find(s => s.id === 'vidal')!;
vidal.accessPolicy = 'Module de recherche intégrable proposé officiellement par VIDAL. Il ne fournit pas un export des monographies. Test du 12 octobre 2026 : script HTTP 404 ; iframe limitée par frame-ancestors aux domaines VIDAL. Aucun import de la base.';

const pubchem = sources.find(s => s.id === 'pubchem')!;
pubchem.integrationStatus = 'manual-summary';
pubchem.accessPolicy = 'PUG REST officiel vérifié le 12 octobre 2026 : propriétés structurales de 13 composés intégrées en instantané statique avec CID. Requêtes séquentielles limitées ; aucune annotation clinique tierce redistribuée. Dates de mise à jour non disponibles dans ces réponses. Pas de connecteur navigateur ni de secret.';

const giygas = sources.find(s => s.id === 'giygas')!;
giygas.integrationStatus = 'api';
giygas.accessPolicy = 'API v1 sans clé, vérifiée le 12 octobre 2026 depuis GitHub Pages. Données BDPM attribuées ; cache local limité à 50 recherches, expiration selon Cache-Control plafonnée à 1 h (nom) ou 4 h (code). Limites annoncées : 1000 tokens/IP, recharge 3/s ; recherche 50, code 10. CORS GET vérifié ; ETag non exposé, aucune requête conditionnelle forcée. Service tiers sans garantie SLA ; IP et recherche transmises.';

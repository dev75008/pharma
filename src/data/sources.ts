// Registre initial : liens uniquement. Aucun droit ni accès API n'est présumé.
export interface ScientificSource { id: string; name: string; url: string; domain: string; accessPolicy: string; integrationStatus: 'link-only' | 'manual-summary'; }
export const sources: ScientificSource[] = [
 ['bdpm', 'Base de données publique des médicaments', 'https://base-donnees-publique.medicaments.gouv.fr/', 'Informations réglementaires françaises'],
 ['pharmacorama', 'Pharmacorama', 'https://www.pharmacorama.com/', 'Pharmacologie pédagogique'],
 ['cbip', 'CBIP', 'https://www.cbip.be/fr/chapters', 'Pharmacothérapie belge'],
 ['pubchem', 'PubChem', 'https://pubchem.ncbi.nlm.nih.gov/', 'Structures et propriétés chimiques'],
 ['drugbank', 'DrugBank', 'https://go.drugbank.com/about', 'Médicaments et cibles'],
 ['chembl', 'ChEMBL', 'https://www.ebi.ac.uk/chembl/', 'Bioactivité moléculaire'],
 ['vidal', 'VIDAL', 'https://www.vidalfrance.com/fonctionnalites/monographie', 'Monographies'],
 ['sm2', 'SM-2 — Piotr Wozniak', 'https://www.super-memory.com/english/ol/sm2.htm', 'Algorithme de répétition espacée (source méthodologique)'],
 ['iupac', 'IUPAC Gold Book', 'https://goldbook.iupac.org/terms/view/L03515', 'Terminologie chimique et demi-vie'],
 ['ansm', 'ANSM', 'https://ansm.sante.fr/documents/reference/repertoire-des-medicaments', 'Répertoire et sécurité des médicaments'],
].map(([id, name, url, domain]) => ({ id, name, url, domain, accessPolicy: 'Conditions de réutilisation, API, quotas et CORS à vérifier avant intégration.', integrationStatus: id==='bdpm'?'manual-summary':'link-only' }));

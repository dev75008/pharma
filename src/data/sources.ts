// Registre initial : liens uniquement. Aucun droit ni accès API n'est présumé.
export interface ScientificSource { id: string; name: string; url: string; domain: string; accessPolicy: string; integrationStatus: 'link-only'; }
export const sources: ScientificSource[] = [
 ['bdpm', 'Base de données publique des médicaments', 'https://base-donnees-publique.medicaments.gouv.fr/', 'Informations réglementaires françaises'],
 ['pharmacorama', 'Pharmacorama', 'https://www.pharmacorama.com/', 'Pharmacologie pédagogique'],
 ['cbip', 'CBIP', 'https://www.cbip.be/fr/chapters', 'Pharmacothérapie belge'],
 ['pubchem', 'PubChem', 'https://pubchem.ncbi.nlm.nih.gov/', 'Structures et propriétés chimiques'],
 ['drugbank', 'DrugBank', 'https://go.drugbank.com/about', 'Médicaments et cibles'],
 ['chembl', 'ChEMBL', 'https://www.ebi.ac.uk/chembl/', 'Bioactivité moléculaire'],
 ['vidal', 'VIDAL', 'https://www.vidalfrance.com/fonctionnalites/monographie', 'Monographies'],
 ['ansm', 'ANSM', 'https://ansm.sante.fr/documents/reference/repertoire-des-medicaments', 'Répertoire et sécurité des médicaments'],
].map(([id, name, url, domain]) => ({ id, name, url, domain, accessPolicy: 'Conditions de réutilisation, API, quotas et CORS à vérifier avant intégration.', integrationStatus: 'link-only' }));

export type StableId = string;
export interface Provenance { sourceId: string; url: string; consultedAt: string; sourceUpdatedAt: string | null; locator: string; }
// « source-checked » est une concordance documentaire, jamais une validation clinique.
export interface AbsenceReview { checkedAt:string; kind:'not-reported'|'uncertain'; evidence:Provenance[]; }
export type ScientificField = { status: 'available'; value: string; verification: 'source-checked' | 'independently-reviewed'; scope: 'molecule' | 'specialty' | 'context'; context: string; evidence: Provenance[]; presentation?:'pedagogical' } | { status: 'missing'; value: null; verification: 'unverified'; scope: 'molecule' | 'specialty' | 'context'; context: string; evidence: []; reason: string; absenceReview?:AbsenceReview };
export interface DrugClass { id: StableId; label: string; parentId?: StableId; specialtyIds: string[]; systemIds: string[]; }
export interface MolecularTarget { id: StableId; name: ScientificField; }
export interface Indication { id: StableId; description: ScientificField; specialtyId?: StableId; }
export interface Contraindication { id: StableId; description: ScientificField; }
export interface AdverseEffect { id: StableId; description: ScientificField; frequency: ScientificField; severity: ScientificField; }
export interface DrugInteraction { id: StableId; partnerDrugIds: StableId[]; description: ScientificField; }
export interface Pharmacokinetics { absorption: ScientificField; bioavailability: ScientificField; distribution: ScientificField; proteinBinding: ScientificField; metabolism: ScientificField; cyp: ScientificField; activeMetabolites: ScientificField; halfLife: ScientificField; elimination: ScientificField; renalAdjustment: ScientificField; hepaticAdjustment: ScientificField; }
export interface ChemicalStructure { formula: ScientificField; molecularMass: ScientificField; smiles: ScientificField; structure2d: ScientificField; structure3d: ScientificField; physicochemical: ScientificField; pubchem: ScientificField; chembl: ScientificField; }
export const fieldGroups = [
 { title: 'Identification', keys: ['dci','class','subclass','atc','brands','forms','routes'] },
 { title: 'Pharmacodynamie', keys: ['target','mechanism','actionType','physiologicalEffects','therapeuticEffects','doseResponse'] },
 { title: 'Pharmacocinétique', keys: ['absorption','bioavailability','distribution','proteinBinding','metabolism','cyp','activeMetabolites','halfLife','elimination','renalAdjustment','hepaticAdjustment'] },
 { title: 'Indications et stratégie', keys: ['indications','therapeuticStrategy','clinicalContexts'] },
 { title: 'Sécurité', keys: ['contraindications','commonEffects','seriousEffects','interactions','precautions','clinicalMonitoring','biologicalMonitoring','pregnancy','breastfeeding','renalContext','hepaticContext'] },
 { title: 'Chimie', keys: ['formula','molecularMass','smiles','structure2d','structure3d','physicochemical','pubchem','chembl'] },
 { title: 'Révision', keys: ['essentials','examTraps','comparisons','mnemonics'] },
] as const;
export type FieldKey = typeof fieldGroups[number]['keys'][number];
export const fieldLabels: Record<FieldKey,string> = { dci:'DCI', class:'Classe', subclass:'Sous-classe', atc:'Code ATC', brands:'Spécialité de référence consultée (liste non exhaustive)', forms:'Forme de la spécialité consultée', routes:'Voie d’administration', target:'Cible', mechanism:'Mécanisme d’action', actionType:'Type d’action', physiologicalEffects:'Conséquences physiologiques', therapeuticEffects:'Effets thérapeutiques', doseResponse:'Relation dose–effet', absorption:'Absorption', bioavailability:'Biodisponibilité', distribution:'Distribution', proteinBinding:'Liaison aux protéines', metabolism:'Métabolisme', cyp:'Enzymes CYP', activeMetabolites:'Métabolites actifs', halfLife:'Demi-vie', elimination:'Élimination', renalAdjustment:'Adaptation rénale', hepaticAdjustment:'Adaptation hépatique', indications:'Indications (sélection non exhaustive)', therapeuticStrategy:'Place dans la stratégie thérapeutique', clinicalContexts:'Situations cliniques', contraindications:'Contre-indications (sélection non exhaustive)', commonEffects:'Effets fréquents', seriousEffects:'Effets graves', interactions:'Interactions (sélection non exhaustive)', precautions:'Précautions', clinicalMonitoring:'Surveillance clinique', biologicalMonitoring:'Surveillance biologique', pregnancy:'Grossesse', breastfeeding:'Allaitement', renalContext:'Insuffisance rénale', hepaticContext:'Insuffisance hépatique', formula:'Formule brute', molecularMass:'Masse moléculaire', smiles:'SMILES', structure2d:'Structure 2D', structure3d:'Structure 3D', physicochemical:'Propriétés physico-chimiques', pubchem:'Référence PubChem', chembl:'Référence ChEMBL', essentials:'5 points essentiels', examTraps:'Pièges d’examen', comparisons:'Comparaisons pédagogiques', mnemonics:'Moyens mnémotechniques (pédagogiques)' };
export interface Drug { id: StableId; classId: StableId; systemIds: string[]; specialtyIds: string[]; targetIds: StableId[]; indicationIds: StableId[]; fields: Record<FieldKey,ScientificField>; referenceNotice?: ScientificField; contentVersion: string; validationStatus: 'documentary-summary' | 'independently-reviewed'; }
export interface StudyNote { drugId: StableId; text: string; updatedAt: string; }
export interface LearningObjective { id: StableId; title: string; specialtyIds: string[]; drugClassIds: StableId[]; }
export interface Answer { questionId: StableId; selectedOptionIds: string[]; text?: string; associations?: Record<string,string>; }
export interface Question { id: StableId; type: 'qcu'|'qrm'|'qroc'|'true-false'|'association'|'pharmacokinetics'; statement: string; equation?: string; drugIds: StableId[]; associationItems?: { id: string; prompt: string; expectedChoiceId: string; explanation: string }[]; associationChoices?: { id: string; text: string }[]; expectedNumeric?: { value: number; tolerance: number; unit: string }; options: { id: string; text: string; correct: boolean; explanation: string }[]; expectedConcepts?: string[][]; correction: string; difficulty: 1|2|3; classIds: StableId[]; objectiveIds: StableId[]; evidence: Provenance[]; validationStatus: 'demo'|'reviewed'; }
export type ClinicalCase = import('./clinicalCases').ProgressiveCase;
export type FlashcardType = 'molecule-mechanism'|'mechanism-class'|'indication-treatment'|'adverse-molecule'|'interaction-consequence'|'target-effect'|'personal';
export type RecallRating = 'again'|'hard'|'good'|'easy';
export interface Flashcard { id:string; drugIds:string[]; classIds:string[]; type:FlashcardType; front:string; back:string; evidence:Provenance[]; contentVersion:string; validationStatus:'documentary-summary'|'personal-unverified'; createdAt?:string; personalSourceUrl?:string|null; }
export interface FlashcardSchedule { cardId:string; dueDate:string; repetitions:number; intervalDays:number; easeFactor:number; lastReviewedAt:string|null; suspended:boolean; revision:number; }
export interface FlashcardSession { id:string; mode:'scheduled'|'practice'; status:'active'|'completed'; startedAt:string; completedAt:string|null; cards:Flashcard[]; queue:string[]; cursor:number; firstRatings:Record<string,RecallRating>; scheduleRevisions:Record<string,number>; }
export interface FlashcardReview { id:string; sessionId:string; cardId:string; reviewedAt:string; rating:RecallRating; grade:number; schedulingApplied:boolean; mode:'scheduled'|'practice'; nextDueDate:string|null; algorithmVersion:string; cardSnapshot:Flashcard; }
export interface RevisionSession { id: StableId; startedAt: string; endedAt: string; questionIds: StableId[]; flashcardIds: StableId[]; durationSeconds: number; }
export interface ExamResult { id: StableId; sessionId: StableId; completedAt: string; answers: Answer[]; score: number; maximumScore: number; scoringVersion: string; }
export interface UserProgress { drugId: StableId; studiedAt: string | null; }
export interface DrugHistory { drugId: StableId; lastViewedAt: string; visitCount: number; }
export interface Favorite { drugId: StableId; createdAt: string; }
export type { ScientificSource } from '../data/sources';

export type ScoringPolicy = 'exact' | 'partial';
export interface QuestionScore { questionId: string; score: number; exact: boolean; feedback: string; detectedConcepts: number[]; }
export interface AssessmentDraft { id: string; mode: 'training' | 'exam'; status: 'active' | 'completed'; startedAt: string; deadlineAt: string | null; completedAt: string | null; questions: Question[]; contentVersion: string; policy: ScoringPolicy; answers: Record<string,Answer>; lockedQuestionIds: string[]; currentIndex: number; }
export interface AssessmentResult { id: string; mode: 'training' | 'exam'; startedAt: string; completedAt: string; durationSeconds: number; questions: Question[]; answers: Record<string,Answer>; scores: QuestionScore[]; total: number; maximum: number; policy: ScoringPolicy; contentVersion: string; endedBy: 'user' | 'deadline'; }

export interface QuestionAttempt { id:string; sessionId:string; questionId:string; mode:'training'|'exam'; recordedAt:string; answer:Answer; score:QuestionScore; classIds:string[]; }

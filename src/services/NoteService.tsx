import { axiosMindShaalaClient } from '../core/api/AxiosClient';
import { API_ENDPOINT } from '../core/api/ApiEndpoint';

export interface NoteSubject {
  id: number | string;
  name: string;
  icon?: string;
  code?: string;
  chapterCount?: number;
  description?: string;
  color?: string;
}

export interface NoteChapter {
  id: number | string;
  subject_id: number | string;
  title: string;
  chapter_number?: number;
  description?: string;
  notes_pdf_url?: string;
  pdf_url?: string;
  pages_count?: number;
  file_size?: string;
  has_notes?: boolean;
}

export interface NoteDetails {
  id: number | string;
  chapter_id: number | string;
  subject_name: string;
  chapter_name: string;
  pdf_url: string;
  title: string;
  description?: string;
  author?: string;
  created_at?: string;
}

export const NoteService = {
  // Fetch subjects for a given course
  getSubjectsByCourse: async (courseId: number | string): Promise<NoteSubject[]> => {
    try {
      console.log("Fetching subjects for courseId:", courseId);
      // Try backend endpoint if available
      const response = await axiosMindShaalaClient.get(`/api/v3/mindshaala/notes/subjects?course_id=${courseId}`);
      if (response.data && (response.data.subjects || Array.isArray(response.data))) {
        return response.data.subjects || response.data;
      }
    } catch (err) {
      console.warn("Backend notes subjects endpoint unavailable, using standard subjects catalog:", err);
    }

    // Fallback catalog of subjects
    return [
      { id: 1, name: 'Physics', code: 'PHYS', chapterCount: 8, description: 'Mechanics, Electromagnetism, Optics, Thermodynamics', color: 'from-blue-600 to-indigo-600' },
      { id: 2, name: 'Chemistry', code: 'CHEM', chapterCount: 10, description: 'Organic, Inorganic, Physical & Analytical Chemistry', color: 'from-purple-600 to-pink-600' },
      { id: 3, name: 'Mathematics', code: 'MATH', chapterCount: 12, description: 'Algebra, Calculus, Geometry, Trigonometry & Vectors', color: 'from-emerald-600 to-teal-600' },
      { id: 4, name: 'Biology', code: 'BIOL', chapterCount: 9, description: 'Cell Biology, Genetics, Human Physiology, Botany', color: 'from-green-600 to-emerald-600' },
      { id: 5, name: 'Computer Science', code: 'CS', chapterCount: 7, description: 'Python, Data Structures, Networking, Databases', color: 'from-cyan-600 to-blue-600' },
      { id: 6, name: 'Social Studies & Geography', code: 'SST', chapterCount: 11, description: 'Indian History, World Physical Geography, Civics', color: 'from-amber-600 to-orange-600' },
    ];
  },

  // Fetch chapters for a given subject
  getChaptersBySubject: async (subjectId: number | string): Promise<NoteChapter[]> => {
    try {
      console.log("Fetching chapters for subjectId:", subjectId);
      const response = await axiosMindShaalaClient.get(`/api/v3/mindshaala/notes/chapters?subject_id=${subjectId}`);
      if (response.data && (response.data.chapters || Array.isArray(response.data))) {
        return response.data.chapters || response.data;
      }
    } catch (err) {
      console.warn("Backend notes chapters endpoint unavailable, using mock chapters catalog:", err);
    }

    // Fallback catalog of chapters based on subjectId
    const sId = Number(subjectId) || 1;
    if (sId === 1) { // Physics
      return [
        { id: 101, subject_id: 1, chapter_number: 1, title: 'Motion in a Straight Line & Kinematics', description: 'Velocity, acceleration, distance-time graphs and calculus equations.', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', pages_count: 24, file_size: '3.4 MB', has_notes: true },
        { id: 102, subject_id: 1, chapter_number: 2, title: 'Laws of Motion & Friction', description: 'Newtonian mechanics, momentum conservation, friction types.', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', pages_count: 18, file_size: '2.8 MB', has_notes: true },
        { id: 103, subject_id: 1, chapter_number: 3, title: 'Work, Energy and Power', description: 'Work-energy theorem, kinetic & potential energy, collisions.', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', pages_count: 22, file_size: '4.1 MB', has_notes: true },
        { id: 104, subject_id: 1, chapter_number: 4, title: 'Electrostatics & Electric Potential', description: 'Coulomb law, electric fields, Gauss theorem, capacitors.', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', pages_count: 30, file_size: '5.2 MB', has_notes: true },
      ];
    } else if (sId === 2) { // Chemistry
      return [
        { id: 201, subject_id: 2, chapter_number: 1, title: 'Structure of Atom & Quantum Mechanics', description: 'Bohr model, quantum numbers, electronic configuration.', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', pages_count: 26, file_size: '3.9 MB', has_notes: true },
        { id: 202, subject_id: 2, chapter_number: 2, title: 'Chemical Bonding and Molecular Structure', description: 'Ionic, covalent bonds, VSEPR theory, hybridization.', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', pages_count: 32, file_size: '4.8 MB', has_notes: true },
        { id: 203, subject_id: 2, chapter_number: 3, title: 'Organic Chemistry Basic Principles', description: 'IUPAC nomenclature, isomerism, reaction mechanisms.', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', pages_count: 28, file_size: '4.2 MB', has_notes: true },
      ];
    } else if (sId === 3) { // Mathematics
      return [
        { id: 301, subject_id: 3, chapter_number: 1, title: 'Calculus: Differentiation & Applications', description: 'Derivatives, chain rule, maxima and minima.', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', pages_count: 35, file_size: '5.5 MB', has_notes: true },
        { id: 302, subject_id: 3, chapter_number: 2, title: 'Integrals & Area Under Curves', description: 'Definite & indefinite integration, substitution, area bounded.', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', pages_count: 40, file_size: '6.1 MB', has_notes: true },
        { id: 303, subject_id: 3, chapter_number: 3, title: 'Matrices and Determinants', description: 'Matrix operations, inverse matrix, system of equations.', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', pages_count: 20, file_size: '2.9 MB', has_notes: true },
      ];
    }

    return [
      { id: 401, subject_id: sId, chapter_number: 1, title: 'Fundamental Concepts & Core Principles', description: 'Detailed conceptual overview, key formulas and definitions.', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', pages_count: 25, file_size: '3.5 MB', has_notes: true },
      { id: 402, subject_id: sId, chapter_number: 2, title: 'Advanced Applications & Solved Examples', description: 'Step-by-step problem solutions and exam preparations.', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', pages_count: 30, file_size: '4.5 MB', has_notes: true },
    ];
  },

  // Fetch Notes Details for a specific chapter
  getNotesByChapter: async (chapterId: number | string): Promise<NoteDetails> => {
    try {
      console.log("Fetching notes PDF for chapterId:", chapterId);
      const response = await axiosMindShaalaClient.get(`/api/v3/mindshaala/notes/fetch?chapter_id=${chapterId}`);
      if (response.data && response.data.pdf_url) {
        return response.data;
      }
    } catch (err) {
      console.warn("Backend notes fetch endpoint unavailable, using mock note details:", err);
    }

    return {
      id: `note_${chapterId}`,
      chapter_id: chapterId,
      subject_name: 'MindShaala Digital Library',
      chapter_name: `Chapter ${chapterId} Study Notes`,
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      title: `Comprehensive Notes - Chapter #${chapterId}`,
      description: 'Official MindShaala DRM-Protected Revision Notes & Solved Problems.',
      author: 'MindShaala Expert Faculty',
      created_at: new Date().toISOString()
    };
  }
};

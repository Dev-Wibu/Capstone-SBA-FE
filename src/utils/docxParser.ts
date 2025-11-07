import mammoth from 'mammoth';

export interface ParsedProposalData {
  title: string;
  context: string;
  description: string;
  func: string[];
  nonFunc: string[];
  students: {
    student1Id: string;
    student1Name: string;
    student2Id?: string;
    student2Name?: string;
    student3Id?: string;
    student3Name?: string;
    student4Id?: string;
    student4Name?: string;
    student5Id?: string;
    student5Name?: string;
    student6Id?: string;
    student6Name?: string;
  };
}

/**
 * Parse file .docx và extract thông tin proposal
 * Format mong đợi trong Word:
 * 
 * Title: [Tên đề tài]
 * 
 * Context: [Bối cảnh]
 * 
 * Description: [Mô tả chi tiết]
 * 
 * Functional Requirements:
 * - Yêu cầu 1
 * - Yêu cầu 2
 * 
 * Non-Functional Requirements:
 * - Yêu cầu 1
 * - Yêu cầu 2
 * 
 * Students:
 * - SE123456: Nguyễn Văn A
 * - SE789012: Trần Thị B
 */
export const parseDocxFile = async (file: File): Promise<ParsedProposalData> => {
  try {
    // Đọc file thành ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert sang text với mammoth
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    
    // Parse data
    const parsed: ParsedProposalData = {
      title: '',
      context: '',
      description: '',
      func: [],
      nonFunc: [],
      students: {
        student1Id: '',
        student1Name: '',
      },
    };

    // Split text thành các sections
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentSection = '';
    let functionalReqs: string[] = [];
    let nonFunctionalReqs: string[] = [];
    let studentsList: Array<{ id: string; name: string }> = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      // Detect sections
      if (lowerLine.startsWith('title:') || lowerLine.startsWith('tên đề tài:') || lowerLine.startsWith('tiêu đề:')) {
        parsed.title = line.split(':').slice(1).join(':').trim();
        continue;
      }
      
      if (lowerLine.startsWith('context:') || lowerLine.startsWith('bối cảnh:')) {
        currentSection = 'context';
        const contentAfterColon = line.split(':').slice(1).join(':').trim();
        if (contentAfterColon) {
          parsed.context = contentAfterColon;
        }
        continue;
      }
      
      if (lowerLine.startsWith('description:') || lowerLine.startsWith('mô tả:')) {
        currentSection = 'description';
        const contentAfterColon = line.split(':').slice(1).join(':').trim();
        if (contentAfterColon) {
          parsed.description = contentAfterColon;
        }
        continue;
      }
      
      // IMPORTANT: Check Non-Functional BEFORE Functional to avoid mismatching
      // Non-Functional Requirements - flexible matching
      if (
        lowerLine.includes('non-functional') || 
        lowerLine.includes('nonfunctional') ||
        lowerLine.includes('phi chức năng') ||
        lowerLine.includes('yêu cầu phi') ||
        (lowerLine.includes('non') && lowerLine.includes('functional'))
      ) {
        currentSection = 'nonFunc';
        continue;
      }
      
      if (lowerLine.includes('functional requirement') || lowerLine.includes('yêu cầu chức năng')) {
        currentSection = 'func';
        continue;
      }
      
      if (lowerLine.startsWith('students:') || lowerLine.startsWith('sinh viên:') || lowerLine.startsWith('thành viên:')) {
        currentSection = 'students';
        continue;
      }
      
      // Extract content based on current section
      if (currentSection === 'context') {
        parsed.context += (parsed.context ? ' ' : '') + line;
      } else if (currentSection === 'description') {
        parsed.description += (parsed.description ? ' ' : '') + line;
      } else if (currentSection === 'func') {
        // Remove bullet points/numbers: -, *, •, 1., 2., etc.
        const cleaned = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
        if (cleaned) {
          functionalReqs.push(cleaned);
        }
      } else if (currentSection === 'nonFunc') {
        const cleaned = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
        if (cleaned) {
          nonFunctionalReqs.push(cleaned);
        }
      } else if (currentSection === 'students') {
        // Format: SE123456: Nguyễn Văn A hoặc - SE123456: Nguyễn Văn A
        const cleaned = line.replace(/^[-*•]\s*/, '').trim();
        const match = cleaned.match(/^([A-Z]{2}\d+)\s*[:：-]\s*(.+)$/i);
        if (match) {
          studentsList.push({
            id: match[1].trim(),
            name: match[2].trim(),
          });
        }
      }
    }
    
    // Assign parsed data
    parsed.func = functionalReqs.length > 0 ? functionalReqs : [''];
    parsed.nonFunc = nonFunctionalReqs.length > 0 ? nonFunctionalReqs : [''];
    
    // Map students to form structure
    studentsList.forEach((student, index) => {
      const num = index + 1;
      if (num <= 6) {
        (parsed.students as any)[`student${num}Id`] = student.id;
        (parsed.students as any)[`student${num}Name`] = student.name;
      }
    });
    
    return parsed;
  } catch (error) {
    console.error('❌ [DOCX Parser] Error:', error);
    throw new Error('Không thể đọc file Word. Vui lòng kiểm tra định dạng file.');
  }
};

/**
 * Validate parsed data
 */
export const validateParsedData = (data: ParsedProposalData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim() === '') {
    errors.push('Tiêu đề không được để trống');
  }
  
  if (!data.context || data.context.trim() === '') {
    errors.push('Bối cảnh không được để trống');
  }
  
  if (!data.description || data.description.trim() === '') {
    errors.push('Mô tả không được để trống');
  }
  
  if (data.func.length === 0 || (data.func.length === 1 && !data.func[0])) {
    errors.push('Cần có ít nhất 1 yêu cầu chức năng');
  }
  
  if (data.nonFunc.length === 0 || (data.nonFunc.length === 1 && !data.nonFunc[0])) {
    errors.push('Cần có ít nhất 1 yêu cầu phi chức năng');
  }
  
  if (!data.students.student1Id || !data.students.student1Name) {
    errors.push('Cần có ít nhất 1 sinh viên');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

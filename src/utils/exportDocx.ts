import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from 'docx';
import { saveAs } from 'file-saver';
import type { CapstoneProposalResponse } from '@/interfaces';

export const exportProposalToDocx = async (proposal: CapstoneProposalResponse) => {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            text: proposal.title.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Semester Info
          new Paragraph({
            children: [
              new TextRun({
                text: 'HỌC KỲ: ',
                bold: true,
              }),
              new TextRun({
                text: proposal.semester ? `${proposal.semester.name} - ${proposal.semester.semesterCode} (${proposal.semester.year})` : 'Chưa có học kỳ',
              }),
            ],
            spacing: { after: 200 },
          }),

          // ID
          new Paragraph({
            children: [
              new TextRun({
                text: 'ID ĐỀ TÀI: ',
                bold: true,
              }),
              new TextRun({
                text: `#${proposal.id}`,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Status
          new Paragraph({
            children: [
              new TextRun({
                text: 'TRẠNG THÁI: ',
                bold: true,
              }),
              new TextRun({
                text: proposal.status,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Context Section
          new Paragraph({
            text: '1. BỐI CẢNH',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: proposal.context,
            spacing: { after: 400 },
          }),

          // Description Section
          new Paragraph({
            text: '2. MÔ TẢ CHI TIẾT',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: proposal.description,
            spacing: { after: 400 },
          }),

          // Functional Requirements
          new Paragraph({
            text: '3. YÊU CẦU CHỨC NĂNG',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          ...proposal.func.map(
            (item, index) =>
              new Paragraph({
                text: `${index + 1}. ${item}`,
                spacing: { after: 150 },
                numbering: {
                  reference: 'functional-requirements',
                  level: 0,
                },
              })
          ),

          // Non-Functional Requirements
          new Paragraph({
            text: '4. YÊU CẦU PHI CHỨC NĂNG',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          ...proposal.nonFunc.map(
            (item, index) =>
              new Paragraph({
                text: `${index + 1}. ${item}`,
                spacing: { after: 150 },
                numbering: {
                  reference: 'non-functional-requirements',
                  level: 0,
                },
              })
          ),

          // Students Section
          new Paragraph({
            text: '5. THÀNH VIÊN NHÓM',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          ...(proposal.students
            ? [
                proposal.students.student1Name && new Paragraph({
                  text: `1. ${proposal.students.student1Name}`,
                  spacing: { after: 100 },
                }),
                proposal.students.student2Name && new Paragraph({
                  text: `2. ${proposal.students.student2Name}`,
                  spacing: { after: 100 },
                }),
                proposal.students.student3Name && new Paragraph({
                  text: `3. ${proposal.students.student3Name}`,
                  spacing: { after: 100 },
                }),
                proposal.students.student4Name && new Paragraph({
                  text: `4. ${proposal.students.student4Name}`,
                  spacing: { after: 100 },
                }),
                proposal.students.student5Name && new Paragraph({
                  text: `5. ${proposal.students.student5Name}`,
                  spacing: { after: 100 },
                }),
                proposal.students.student6Name && new Paragraph({
                  text: `6. ${proposal.students.student6Name}`,
                  spacing: { after: 100 },
                }),
              ].filter(Boolean)
            : [new Paragraph({ text: 'Không có thông tin thành viên' })]) as Paragraph[],

          // Mentors Section
          new Paragraph({
            text: '6. GIẢNG VIÊN HƯỚNG DẪN',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Giảng viên 1: ',
                bold: true,
              }),
              new TextRun({
                text: proposal.lecturerCode1 || 'Chưa có thông tin',
              }),
            ],
            spacing: { after: 100 },
          }),
          ...(proposal.lecturerCode2 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Giảng viên 2: ',
                  bold: true,
                }),
                new TextRun({
                  text: proposal.lecturerCode2,
                }),
              ],
              spacing: { after: 100 },
            }),
          ] : []),

          // Review Schedule Section (if any)
          ...(proposal.review1At || proposal.review2At || proposal.review3At ? [
            new Paragraph({
              text: '7. LỊCH REVIEW',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 200 },
            }),
            ...(proposal.review1At ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Review 1: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: new Date(proposal.review1At).toLocaleString('vi-VN'),
                  }),
                  ...(proposal.lecturerReview1Code ? [
                    new TextRun({
                      text: ' - Mentor: ',
                      bold: true,
                    }),
                    new TextRun({
                      text: proposal.lecturerReview1Code,
                    }),
                  ] : []),
                ],
                spacing: { after: 100 },
              }),
            ] : []),
            ...(proposal.review2At ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Review 2: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: new Date(proposal.review2At).toLocaleString('vi-VN'),
                  }),
                  ...(proposal.lecturerReview2Code ? [
                    new TextRun({
                      text: ' - Mentor: ',
                      bold: true,
                    }),
                    new TextRun({
                      text: proposal.lecturerReview2Code,
                    }),
                  ] : []),
                ],
                spacing: { after: 100 },
              }),
            ] : []),
            ...(proposal.review3At ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Review 3: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: new Date(proposal.review3At).toLocaleString('vi-VN'),
                  }),
                  ...(proposal.lecturerReview3Code ? [
                    new TextRun({
                      text: ' - Mentor: ',
                      bold: true,
                    }),
                    new TextRun({
                      text: proposal.lecturerReview3Code,
                    }),
                  ] : []),
                ],
                spacing: { after: 100 },
              }),
            ] : []),
          ] : []),

          // Created Date
          new Paragraph({
            text: '',
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Ngày tạo: ',
                bold: true,
              }),
              new TextRun({
                text: new Date(proposal.createdAt).toLocaleString('vi-VN'),
              }),
            ],
          }),
        ],
      },
    ],
    numbering: {
      config: [
        {
          reference: 'functional-requirements',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
            },
          ],
        },
        {
          reference: 'non-functional-requirements',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
  });

  // Generate and save the document
  const blob = await Packer.toBlob(doc);
  const fileName = `${proposal.title.replace(/[^a-z0-9]/gi, '_')}_${proposal.id}.docx`;
  saveAs(blob, fileName);
};

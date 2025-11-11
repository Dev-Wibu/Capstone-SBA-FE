import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from 'docx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import type { CapstoneProposalResponse, Lecturer } from '@/interfaces';

export const exportProposalToDocx = async (proposal: CapstoneProposalResponse, lecturers?: Lecturer[]) => {
  // Helper function to get lecturer name
  const getLecturerName = (code: string): string => {
    if (!lecturers) return code;
    const lecturer = lecturers.find(l => l.lecturerCode === code);
    return lecturer ? `${lecturer.fullName} (${code})` : code;
  };

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
                text: 'SEMESTER: ',
                bold: true,
              }),
              new TextRun({
                text: proposal.semester ? `${proposal.semester.name} - ${proposal.semester.semesterCode} (${proposal.semester.year})` : 'Not defined',
              }),
            ],
            spacing: { after: 200 },
          }),

          // ID
          new Paragraph({
            children: [
              new TextRun({
                text: 'PROPOSAL ID: ',
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
                text: 'STATUS: ',
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
            text: '1. Context & Problem Statement',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: proposal.context,
            spacing: { after: 400 },
          }),

          // Description Section
          new Paragraph({
            text: '2. Description',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: proposal.description,
            spacing: { after: 400 },
          }),

          // Functional Requirements
          new Paragraph({
            text: '3. Functional Requirements',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          ...proposal.func.map(
            (item) =>
              new Paragraph({
                text: item,
                spacing: { after: 150 },
              })
          ),

          // Non-Functional Requirements
          new Paragraph({
            text: '4. Non-Functional Requirements',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          ...proposal.nonFunc.map(
            (item) =>
              new Paragraph({
                text: item,
                spacing: { after: 150 },
              })
          ),

          // Students Section
          new Paragraph({
            text: '5. Team Members',
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
            : [new Paragraph({ text: 'No team members information available' })]) as Paragraph[],

          // Mentors Section
          new Paragraph({
            text: '6. Supervising Lecturers',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Main Lecturer (Giảng viên chính): ',
                bold: true,
              }),
              new TextRun({
                text: proposal.lecturerCode1 ? getLecturerName(proposal.lecturerCode1) : 'No information',
              }),
            ],
            spacing: { after: 100 },
          }),
          ...(proposal.lecturerCode2 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Co-Lecturer (Giảng viên phụ): ',
                  bold: true,
                }),
                new TextRun({
                  text: getLecturerName(proposal.lecturerCode2),
                }),
              ],
              spacing: { after: 100 },
            }),
          ] : []),

          // Review Schedule Section (if any)
          ...(proposal.review1At || proposal.review2At || proposal.review3At ? [
            new Paragraph({
              text: '7. Review Schedule',
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
                    text: new Date(proposal.review1At).toLocaleString('en-US'),
                  }),
                  ...(proposal.reviewer && proposal.reviewer.reviewer1Code ? [
                    new TextRun({
                      text: ' - Reviewer: ',
                      bold: true,
                    }),
                    new TextRun({
                      text: getLecturerName(proposal.reviewer.reviewer1Code),
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
                    text: new Date(proposal.review2At).toLocaleString('en-US'),
                  }),
                  ...(proposal.reviewer && proposal.reviewer.reviewer2Code ? [
                    new TextRun({
                      text: ' - Reviewer: ',
                      bold: true,
                    }),
                    new TextRun({
                      text: getLecturerName(proposal.reviewer.reviewer2Code),
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
                    text: new Date(proposal.review3At).toLocaleString('en-US'),
                  }),
                  ...(proposal.reviewer && proposal.reviewer.reviewer3Code ? [
                    new TextRun({
                      text: ' - Reviewer: ',
                      bold: true,
                    }),
                    new TextRun({
                      text: getLecturerName(proposal.reviewer.reviewer3Code),
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
                text: 'Created Date: ',
                bold: true,
              }),
              new TextRun({
                text: new Date(proposal.createdAt).toLocaleString('en-US'),
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

export const exportProposalTemplate = async () => {
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
          new Paragraph({
            text: 'CAPSTONE PROJECT PROPOSAL TEMPLATE',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Hướng dẫn: Điền đầy đủ các phần theo format bên dưới. Hệ thống sẽ tự động phân tích file này.',
                italics: true,
                color: '666666',
                size: 20,
              }),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({
            text: 'Title:',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: '',
            spacing: { after: 400 },
          }),

          new Paragraph({
            text: 'Context:',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: '',
            spacing: { after: 400 },
          }),

          new Paragraph({
            text: 'Description:',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: '',
            spacing: { after: 400 },
          }),

          new Paragraph({
            text: 'Functional Requirements:',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: '-',
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: '-',
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: '-',
            spacing: { after: 400 },
          }),

          new Paragraph({
            text: 'Non-Functional Requirements:',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: '-',
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: '-',
            spacing: { after: 400 },
          }),

          new Paragraph({
            text: 'Students:',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: '- SE######: Họ và Tên',
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: '- SE######: Họ và Tên',
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: '- SE######: Họ và Tên',
            spacing: { after: 400 },
          }),

          new Paragraph({
            text: 'Lưu ý:',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: '• Các yêu cầu phải bắt đầu bằng dấu "-"',
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: '• Danh sách sinh viên: MSSV: Họ tên',
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: '• Tất cả các phần đều phải có dữ liệu',
            spacing: { after: 100 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'Capstone_Proposal_Template.docx');
};

export const exportAllProposalsToZip = async (proposals: CapstoneProposalResponse[], lecturers?: Lecturer[]) => {
  if (proposals.length === 0) {
    alert('Không có đề tài nào để tải xuống');
    return;
  }

  // Helper function to get lecturer name
  const getLecturerName = (code: string): string => {
    if (!lecturers) return code;
    const lecturer = lecturers.find(l => l.lecturerCode === code);
    return lecturer ? `${lecturer.fullName} (${code})` : code;
  };

  const zip = new JSZip();
  
  try {
    for (const proposal of proposals) {
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
                    text: 'SEMESTER: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: proposal.semester ? `${proposal.semester.name} - ${proposal.semester.semesterCode} (${proposal.semester.year})` : 'Not defined',
                  }),
                ],
                spacing: { after: 200 },
              }),

              // ID
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'PROPOSAL ID: ',
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
                    text: 'STATUS: ',
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
                text: '1. Context & Problem Statement',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              new Paragraph({
                text: proposal.context,
                spacing: { after: 400 },
              }),

              // Description Section
              new Paragraph({
                text: '2. Description',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              new Paragraph({
                text: proposal.description,
                spacing: { after: 400 },
              }),

              // Functional Requirements
              new Paragraph({
                text: '3. Functional Requirements',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              ...proposal.func.map(
                (item) =>
                  new Paragraph({
                    text: item,
                    spacing: { after: 150 },
                  })
              ),

              // Non-Functional Requirements
              new Paragraph({
                text: '4. Non-Functional Requirements',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              ...proposal.nonFunc.map(
                (item) =>
                  new Paragraph({
                    text: item,
                    spacing: { after: 150 },
                  })
              ),

              // Students Section
              new Paragraph({
                text: '5. Team Members',
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
                : [new Paragraph({ text: 'No team members information available' })]) as Paragraph[],

              // Mentors Section
              new Paragraph({
                text: '6. Supervising Lecturers',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Main Lecturer (Giảng viên chính): ',
                    bold: true,
                  }),
                  new TextRun({
                    text: proposal.lecturerCode1 ? getLecturerName(proposal.lecturerCode1) : 'No information',
                  }),
                ],
                spacing: { after: 100 },
              }),
              ...(proposal.lecturerCode2 ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Co-Lecturer (Giảng viên phụ): ',
                      bold: true,
                    }),
                    new TextRun({
                      text: getLecturerName(proposal.lecturerCode2),
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              ] : []),

              // Review Schedule Section (if any)
              ...(proposal.review1At || proposal.review2At || proposal.review3At ? [
                new Paragraph({
                  text: '7. Review Schedule',
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
                        text: new Date(proposal.review1At).toLocaleString('en-US'),
                      }),
                      ...(proposal.reviewer && proposal.reviewer.reviewer1Code ? [
                        new TextRun({
                          text: ' - Reviewer: ',
                          bold: true,
                        }),
                        new TextRun({
                          text: getLecturerName(proposal.reviewer.reviewer1Code),
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
                        text: new Date(proposal.review2At).toLocaleString('en-US'),
                      }),
                      ...(proposal.reviewer && proposal.reviewer.reviewer2Code ? [
                        new TextRun({
                          text: ' - Reviewer: ',
                          bold: true,
                        }),
                        new TextRun({
                          text: getLecturerName(proposal.reviewer.reviewer2Code),
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
                        text: new Date(proposal.review3At).toLocaleString('en-US'),
                      }),
                      ...(proposal.reviewer && proposal.reviewer.reviewer3Code ? [
                        new TextRun({
                          text: ' - Reviewer: ',
                          bold: true,
                        }),
                        new TextRun({
                          text: getLecturerName(proposal.reviewer.reviewer3Code),
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
                    text: 'Created Date: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: new Date(proposal.createdAt).toLocaleString('en-US'),
                  }),
                ],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `${proposal.id}_${proposal.title.replace(/[^a-z0-9]/gi, '_')}.docx`;
      zip.file(fileName, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const timestamp = new Date().toISOString().split('T')[0];
    saveAs(zipBlob, `All_Proposals_${timestamp}.zip`);
  } catch (error) {
    alert('Lỗi khi tải xuống: ' + error);
  }
};

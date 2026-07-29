import { NextRequest, NextResponse } from 'next/server';
import {
  Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType,
} from 'docx';
import type { StructuredResume } from '../../improve/route';

const ACCENT = '1B3A5C';
const MUTED = '555555';

function sectionHeading(text: string) {
  return new Paragraph({
    spacing: { before: 220, after: 90 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 } },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, color: ACCENT, size: 20, font: 'Calibri' }),
    ],
  });
}

function bulletParagraph(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 20, font: 'Calibri' })],
  });
}

export async function POST(req: NextRequest) {
  try {
    const resume = (await req.json()) as StructuredResume;

    const children: Paragraph[] = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: resume.name || 'Your Name', bold: true, size: 40, font: 'Calibri', color: ACCENT })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [new TextRun({ text: resume.contactLine || '', size: 19, font: 'Calibri', color: MUTED })],
      }),
    ];

    if (resume.summary) {
      children.push(sectionHeading('Professional Summary'));
      children.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: resume.summary, size: 20, font: 'Calibri' })] }));
    }

    if (resume.education?.length) {
      children.push(sectionHeading('Education'));
      for (const edu of resume.education) {
        children.push(new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: `${edu.qualification} — ${edu.institution}`, bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: `   ${edu.dates}`, italics: true, size: 18, font: 'Calibri', color: MUTED }),
          ],
        }));
      }
    }

    if (resume.skills?.length) {
      children.push(sectionHeading('Skills'));
      for (const group of resume.skills) {
        children.push(new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${group.category}: `, bold: true, size: 20, font: 'Calibri', color: ACCENT }),
            new TextRun({ text: group.items.join(', '), size: 20, font: 'Calibri' }),
          ],
        }));
      }
    }

    if (resume.projects?.length) {
      children.push(sectionHeading('Projects'));
      for (const proj of resume.projects) {
        children.push(new Paragraph({
          spacing: { before: 80, after: 20 },
          children: [new TextRun({ text: proj.name, bold: true, size: 21, font: 'Calibri' })],
        }));
        for (const bullet of proj.bullets || []) children.push(bulletParagraph(bullet));
      }
    }

    if (resume.experience?.length) {
      children.push(sectionHeading('Experience'));
      for (const job of resume.experience) {
        children.push(new Paragraph({
          spacing: { before: 80, after: 15 },
          children: [
            new TextRun({ text: `${job.title} — ${job.company}`, bold: true, size: 21, font: 'Calibri' }),
          ],
        }));
        children.push(new Paragraph({
          spacing: { after: 50 },
          children: [new TextRun({ text: job.dates, italics: true, size: 18, font: 'Calibri', color: MUTED })],
        }));
        for (const bullet of job.bullets || []) children.push(bulletParagraph(bullet));
      }
    }

    if (resume.certifications?.length) {
      children.push(sectionHeading('Certifications'));
      for (const cert of resume.certifications) children.push(bulletParagraph(cert));
    }

    const doc = new Document({
      sections: [{ properties: { page: { margin: { top: 620, bottom: 620, left: 850, right: 850 } } }, children }],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="improved-resume.docx"',
      },
    });
  } catch (err) {
    console.error('DOCX export error:', err);
    return NextResponse.json({ error: 'Failed to generate DOCX' }, { status: 500 });
  }
}

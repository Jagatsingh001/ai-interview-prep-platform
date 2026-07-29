import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import type { StructuredResume } from '../../improve/route';

const ACCENT = '#1B3A5C';
const MUTED = '#555555';
const TEXT = '#1A1A1A';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: 'Helvetica', color: TEXT },
  name: { fontSize: 21, fontWeight: 700, color: ACCENT, textAlign: 'center' },
  contact: { fontSize: 9, color: MUTED, textAlign: 'center', marginTop: 4, marginBottom: 12 },
  sectionHeading: {
    fontSize: 10.5, fontWeight: 700, color: ACCENT, textTransform: 'uppercase',
    borderBottomWidth: 1.2, borderBottomColor: ACCENT, paddingBottom: 3, marginTop: 10, marginBottom: 5,
    letterSpacing: 0.5,
  },
  paragraph: { fontSize: 10, lineHeight: 1.35, marginBottom: 4 },
  eduRow: { fontSize: 10, marginBottom: 3 },
  skillRow: { flexDirection: 'row', fontSize: 10, marginBottom: 3, flexWrap: 'wrap' },
  skillCategory: { fontWeight: 700, color: ACCENT },
  jobTitle: { fontSize: 10.5, fontWeight: 700, marginTop: 5 },
  jobMeta: { fontSize: 9, color: MUTED, fontStyle: 'italic', marginBottom: 3 },
  bulletRow: { flexDirection: 'row', marginBottom: 2, paddingLeft: 4 },
  bulletDot: { width: 9, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.3 },
});

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function ResumeDocument({ resume }: { resume: StructuredResume }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{resume.name || 'Your Name'}</Text>
        {resume.contactLine ? <Text style={styles.contact}>{resume.contactLine}</Text> : null}

        {resume.summary ? (
          <View>
            <Text style={styles.sectionHeading}>Professional Summary</Text>
            <Text style={styles.paragraph}>{resume.summary}</Text>
          </View>
        ) : null}

        {resume.education?.length ? (
          <View>
            <Text style={styles.sectionHeading}>Education</Text>
            {resume.education.map((edu, i) => (
              <Text key={i} style={styles.eduRow}>
                <Text style={{ fontWeight: 700 }}>{edu.qualification} — {edu.institution}</Text>{'   '}
                <Text style={{ color: MUTED, fontStyle: 'italic' }}>{edu.dates}</Text>
              </Text>
            ))}
          </View>
        ) : null}

        {resume.skills?.length ? (
          <View>
            <Text style={styles.sectionHeading}>Skills</Text>
            {resume.skills.map((group, i) => (
              <Text key={i} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{group.category}: </Text>
                <Text>{group.items.join(', ')}</Text>
              </Text>
            ))}
          </View>
        ) : null}

        {resume.projects?.length ? (
          <View>
            <Text style={styles.sectionHeading}>Projects</Text>
            {resume.projects.map((proj, i) => (
              <View key={i}>
                <Text style={styles.jobTitle}>{proj.name}</Text>
                {(proj.bullets || []).map((b, j) => <Bullet key={j} text={b} />)}
              </View>
            ))}
          </View>
        ) : null}

        {resume.experience?.length ? (
          <View>
            <Text style={styles.sectionHeading}>Experience</Text>
            {resume.experience.map((job, i) => (
              <View key={i}>
                <Text style={styles.jobTitle}>{job.title} — {job.company}</Text>
                <Text style={styles.jobMeta}>{job.dates}</Text>
                {(job.bullets || []).map((b, j) => <Bullet key={j} text={b} />)}
              </View>
            ))}
          </View>
        ) : null}

        {resume.certifications?.length ? (
          <View>
            <Text style={styles.sectionHeading}>Certifications</Text>
            {resume.certifications.map((c, i) => <Bullet key={i} text={c} />)}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function POST(req: NextRequest) {
  try {
    const resume = (await req.json()) as StructuredResume;

    const buffer = await renderToBuffer(<ResumeDocument resume={resume} />);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="improved-resume.pdf"',
      },
    });
  } catch (err) {
    console.error('PDF export error:', err);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

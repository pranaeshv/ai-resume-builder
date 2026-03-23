import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import jsPDF from 'jspdf'

export default function Preview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resumeData, setResumeData] = useState(null)
  const [title, setTitle] = useState('')
  const resumeRef = useRef()

  useEffect(() => {
    loadResume()
  }, [id])

  async function loadResume() {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single()
    if (!error) {
      setResumeData(data.data)
      setTitle(data.title)
    }
  }

  function exportPDF() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const resume = resumeData
    const margin = 50
    const pageWidth = doc.internal.pageSize.getWidth()
    const maxWidth = pageWidth - margin * 2
    let y = 50

    function checkPageBreak(needed = 20) {
      if (y + needed > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        y = 50
      }
    }

    function sectionTitle(text) {
      checkPageBreak(30)
      y += 14
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(80, 80, 80)
      doc.text(text.toUpperCase(), margin, y)
      y += 4
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 14
      doc.setTextColor(0, 0, 0)
    }

    function wrappedText(text, x, fontSize = 10, style = 'normal', color = [0, 0, 0]) {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', style)
      doc.setTextColor(...color)
      const lines = doc.splitTextToSize(text, maxWidth)
      lines.forEach(line => {
        checkPageBreak()
        doc.text(line, x, y)
        y += fontSize * 1.4
      })
    }

    // Header
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(resume.personal?.name || 'Your Name', margin, y)
    y += 26

    const contactParts = [
      resume.personal?.email,
      resume.personal?.phone,
      resume.personal?.location,
      resume.personal?.linkedin,
      resume.personal?.website,
    ].filter(Boolean)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(contactParts.join('  |  '), margin, y)
    y += 20
    doc.setDrawColor(0, 0, 0)
    doc.line(margin, y, pageWidth - margin, y)
    y += 16

    // Summary
    if (resume.summary?.text) {
      sectionTitle('Summary')
      wrappedText(resume.summary.text, margin, 10, 'normal', [40, 40, 40])
      y += 6
    }

    // Experience
    const hasExp = resume.experience?.some(e => e.company)
    if (hasExp) {
      sectionTitle('Experience')
      resume.experience.filter(e => e.company).forEach(exp => {
        checkPageBreak(40)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(exp.title || '', margin, y)
        const dateText = exp.current ? `${exp.start} — Present` : `${exp.start}${exp.end ? ` — ${exp.end}` : ''}`
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text(dateText, pageWidth - margin, y, { align: 'right' })
        y += 14
        doc.setFontSize(10)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(60, 60, 60)
        doc.text(exp.company || '', margin, y)
        y += 14
        if (exp.description) {
          wrappedText(exp.description, margin + 8, 9.5, 'normal', [40, 40, 40])
        }
        y += 6
      })
    }

    // Education
    const hasEdu = resume.education?.some(e => e.school)
    if (hasEdu) {
      sectionTitle('Education')
      resume.education.filter(e => e.school).forEach(edu => {
        checkPageBreak(30)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(`${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}`, margin, y)
        const dateText = `${edu.start || ''}${edu.end ? ` — ${edu.end}` : ''}`
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text(dateText, pageWidth - margin, y, { align: 'right' })
        y += 14
        doc.setFontSize(10)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(60, 60, 60)
        doc.text(edu.school || '', margin, y)
        if (edu.gpa) {
          doc.setFontSize(9)
          doc.text(`GPA: ${edu.gpa}`, pageWidth - margin, y, { align: 'right' })
        }
        y += 16
      })
    }

    // Skills
    if (resume.skills?.length > 0) {
      sectionTitle('Skills')
      const skillsText = resume.skills.join('  •  ')
      wrappedText(skillsText, margin, 10, 'normal', [40, 40, 40])
      y += 6
    }

    // Projects
    const hasProjects = resume.projects?.some(p => p.name)
    if (hasProjects) {
      sectionTitle('Projects')
      resume.projects.filter(p => p.name).forEach(proj => {
        checkPageBreak(30)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(proj.name, margin, y)
        if (proj.url) {
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100, 100, 100)
          doc.text(proj.url, pageWidth - margin, y, { align: 'right' })
        }
        y += 14
        if (proj.description) {
          wrappedText(proj.description, margin + 8, 9.5, 'normal', [40, 40, 40])
        }
        y += 6
      })
    }

    // Certifications
    const hasCerts = resume.certs?.some(c => c.name)
    if (hasCerts) {
      sectionTitle('Certifications')
      resume.certs.filter(c => c.name).forEach(cert => {
        checkPageBreak(24)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(cert.name, margin, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.setFontSize(9)
        const rightText = [cert.issuer, cert.date].filter(Boolean).join(' — ')
        doc.text(rightText, pageWidth - margin, y, { align: 'right' })
        y += 16
      })
    }

    doc.save(`${title || 'resume'}.pdf`)
  }

  if (!resumeData) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  )

  const r = resumeData

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate(`/builder/${id}`)} className="text-sm text-gray-500 hover:text-gray-800">
          ← Back to builder
        </button>
        <span className="text-sm font-medium">Preview</span>
        <button
          onClick={exportPDF}
          className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Download PDF
        </button>
      </nav>

      {/* Resume preview */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div ref={resumeRef} className="bg-white shadow-sm rounded-xl p-12 font-serif">

          {/* Header */}
          <div className="border-b border-gray-200 pb-5 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{r.personal?.name || 'Your Name'}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
              {r.personal?.email && <span>{r.personal.email}</span>}
              {r.personal?.phone && <span>{r.personal.phone}</span>}
              {r.personal?.location && <span>{r.personal.location}</span>}
              {r.personal?.linkedin && <span>{r.personal.linkedin}</span>}
              {r.personal?.website && <span>{r.personal.website}</span>}
            </div>
          </div>

          {/* Summary */}
          {r.summary?.text && (
            <div className="mb-6">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Summary</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{r.summary.text}</p>
            </div>
          )}

          {/* Experience */}
          {r.experience?.some(e => e.company) && (
            <div className="mb-6">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Experience</h2>
              <div className="space-y-4">
                {r.experience.filter(e => e.company).map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{exp.title}</p>
                        <p className="text-sm italic text-gray-500">{exp.company}</p>
                      </div>
                      <p className="text-xs text-gray-400 flex-shrink-0 ml-4">
                        {exp.start}{exp.current ? ' — Present' : exp.end ? ` — ${exp.end}` : ''}
                      </p>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {r.education?.some(e => e.school) && (
            <div className="mb-6">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Education</h2>
              <div className="space-y-3">
                {r.education.filter(e => e.school).map((edu, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                      <p className="text-sm italic text-gray-500">{edu.school}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-400">{edu.start}{edu.end ? ` — ${edu.end}` : ''}</p>
                      {edu.gpa && <p className="text-xs text-gray-400">GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {r.skills?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {r.skills.map((s, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {r.projects?.some(p => p.name) && (
            <div className="mb-6">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Projects</h2>
              <div className="space-y-3">
                {r.projects.filter(p => p.name).map((proj, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-gray-900">{proj.name}</p>
                      {proj.url && <p className="text-xs text-gray-400 ml-4">{proj.url}</p>}
                    </div>
                    {proj.description && <p className="text-sm text-gray-600 mt-1">{proj.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {r.certs?.some(c => c.name) && (
            <div className="mb-6">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Certifications</h2>
              <div className="space-y-2">
                {r.certs.filter(c => c.name).map((cert, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                    <p className="text-xs text-gray-400">{cert.issuer}{cert.date ? ` — ${cert.date}` : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
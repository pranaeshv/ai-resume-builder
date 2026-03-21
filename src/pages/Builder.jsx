import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const EMPTY_DATA = {
  personal: { name: '', email: '', phone: '', linkedin: '', location: '', website: '' },
  summary: { text: '' },
  experience: [{ company: '', title: '', start: '', end: '', current: false, description: '' }],
  education: [{ school: '', degree: '', field: '', start: '', end: '', gpa: '' }],
  skills: [],
  projects: [{ name: '', url: '', description: '' }],
  certs: [{ name: '', issuer: '', date: '', credentialId: '' }],
}

const STEPS = ['Personal', 'Summary', 'Experience', 'Education', 'Skills', 'Projects', 'Certifications']

export default function Builder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [resumeData, setResumeData] = useState(EMPTY_DATA)
  const [title, setTitle] = useState('Untitled Resume')
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')



  async function loadResume() {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single()
    if (!error && data.data && Object.keys(data.data).length > 0) {
      setResumeData(data.data)
      setTitle(data.title)
    }
  }
  
  useEffect(() => {
    if (id) loadResume()
  }, [id])

  

  async function save(redirect = false) {
    setSaving(true)
    await supabase
      .from('resumes')
      .update({ data: resumeData, title, updated_at: new Date().toISOString() })
      .eq('id', id)
    setSaving(false)
    if (redirect) navigate('/dashboard')
  }

  function updateSection(section, value) {
    setResumeData(prev => ({ ...prev, [section]: value }))
  }

  function updateEntry(section, index, field, value) {
    const updated = [...resumeData[section]]
    updated[index] = { ...updated[index], [field]: value }
    updateSection(section, updated)
  }

  function addEntry(section, template) {
    updateSection(section, [...resumeData[section], template])
  }

  function removeEntry(section, index) {
    if (resumeData[section].length === 1) return
    updateSection(section, resumeData[section].filter((_, i) => i !== index))
  }

  const input = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300 bg-white'
  const label = 'text-xs font-medium text-gray-500 mb-1 block'
  const grid2 = 'grid grid-cols-1 sm:grid-cols-2 gap-4'

  function renderStep() {
    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Personal information</h2>
            <p className="text-sm text-gray-400 mt-0.5">Your basic contact details for the resume header.</p>
          </div>
          <div className={grid2}>
            <div><label className={label}>Full name</label><input className={input} value={resumeData.personal.name} onChange={e => updateSection('personal', { ...resumeData.personal, name: e.target.value })} placeholder="Pranaesh M" /></div>
            <div><label className={label}>Email</label><input className={input} value={resumeData.personal.email} onChange={e => updateSection('personal', { ...resumeData.personal, email: e.target.value })} placeholder="you@email.com" /></div>
            <div><label className={label}>Phone</label><input className={input} value={resumeData.personal.phone} onChange={e => updateSection('personal', { ...resumeData.personal, phone: e.target.value })} placeholder="+91 9876543210" /></div>
            <div><label className={label}>Location</label><input className={input} value={resumeData.personal.location} onChange={e => updateSection('personal', { ...resumeData.personal, location: e.target.value })} placeholder="Chennai, India" /></div>
            <div><label className={label}>LinkedIn URL</label><input className={input} value={resumeData.personal.linkedin} onChange={e => updateSection('personal', { ...resumeData.personal, linkedin: e.target.value })} placeholder="linkedin.com/in/yourname" /></div>
            <div><label className={label}>Portfolio / website</label><input className={input} value={resumeData.personal.website} onChange={e => updateSection('personal', { ...resumeData.personal, website: e.target.value })} placeholder="yoursite.vercel.app" /></div>
          </div>
        </div>
      )

      case 1: return (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Professional summary</h2>
            <p className="text-sm text-gray-400 mt-0.5">A 2–3 sentence overview of your profile.</p>
          </div>
          <div>
            <label className={label}>Summary</label>
            <textarea className={`${input} resize-none`} rows={5} value={resumeData.summary.text} onChange={e => updateSection('summary', { text: e.target.value })} placeholder="Passionate developer with experience building SaaS products..." />
          </div>
        </div>
      )

      case 2: return (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Work experience</h2>
            <p className="text-sm text-gray-400 mt-0.5">Add your roles, most recent first.</p>
          </div>
          {resumeData.experience.map((exp, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{exp.company || 'New position'}</span>
                {resumeData.experience.length > 1 && <button onClick={() => removeEntry('experience', i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>}
              </div>
              <div className={grid2}>
                <div><label className={label}>Company</label><input className={input} value={exp.company} onChange={e => updateEntry('experience', i, 'company', e.target.value)} placeholder="Company name" /></div>
                <div><label className={label}>Job title</label><input className={input} value={exp.title} onChange={e => updateEntry('experience', i, 'title', e.target.value)} placeholder="Frontend Developer" /></div>
                <div><label className={label}>Start</label><input className={input} value={exp.start} onChange={e => updateEntry('experience', i, 'start', e.target.value)} placeholder="Jun 2023" /></div>
                <div><label className={label}>End</label><input className={input} value={exp.end} onChange={e => updateEntry('experience', i, 'end', e.target.value)} placeholder="Present" disabled={exp.current} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input type="checkbox" checked={exp.current} onChange={e => updateEntry('experience', i, 'current', e.target.checked)} />
                Currently working here
              </label>
              <div><label className={label}>Description</label><textarea className={`${input} resize-none`} rows={3} value={exp.description} onChange={e => updateEntry('experience', i, 'description', e.target.value)} placeholder="• Led development of X feature..." /></div>
            </div>
          ))}
          <button onClick={() => addEntry('experience', { company: '', title: '', start: '', end: '', current: false, description: '' })} className="w-full border border-dashed border-gray-300 rounded-xl py-2.5 text-sm text-gray-400 hover:bg-gray-50 transition">
            + Add position
          </button>
        </div>
      )

      case 3: return (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Education</h2>
            <p className="text-sm text-gray-400 mt-0.5">Degrees, diplomas, courses.</p>
          </div>
          {resumeData.education.map((edu, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{edu.school || 'New entry'}</span>
                {resumeData.education.length > 1 && <button onClick={() => removeEntry('education', i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>}
              </div>
              <div className={grid2}>
                <div><label className={label}>School / university</label><input className={input} value={edu.school} onChange={e => updateEntry('education', i, 'school', e.target.value)} placeholder="Anna University" /></div>
                <div><label className={label}>Degree</label><input className={input} value={edu.degree} onChange={e => updateEntry('education', i, 'degree', e.target.value)} placeholder="B.E. / B.Tech" /></div>
                <div><label className={label}>Field of study</label><input className={input} value={edu.field} onChange={e => updateEntry('education', i, 'field', e.target.value)} placeholder="Computer Science" /></div>
                <div><label className={label}>GPA / percentage</label><input className={input} value={edu.gpa} onChange={e => updateEntry('education', i, 'gpa', e.target.value)} placeholder="8.5 / 10" /></div>
                <div><label className={label}>Start year</label><input className={input} value={edu.start} onChange={e => updateEntry('education', i, 'start', e.target.value)} placeholder="2020" /></div>
                <div><label className={label}>End year</label><input className={input} value={edu.end} onChange={e => updateEntry('education', i, 'end', e.target.value)} placeholder="2024" /></div>
              </div>
            </div>
          ))}
          <button onClick={() => addEntry('education', { school: '', degree: '', field: '', start: '', end: '', gpa: '' })} className="w-full border border-dashed border-gray-300 rounded-xl py-2.5 text-sm text-gray-400 hover:bg-gray-50 transition">
            + Add education
          </button>
        </div>
      )

      case 4: return (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Skills</h2>
            <p className="text-sm text-gray-400 mt-0.5">Add technical and soft skills.</p>
          </div>
          <div className="flex flex-wrap gap-2 min-h-10">
            {resumeData.skills.length === 0 && <span className="text-sm text-gray-400">No skills added yet</span>}
            {resumeData.skills.map((skill, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                {skill}
                <button onClick={() => updateSection('skills', resumeData.skills.filter((_, j) => j !== i))} className="text-gray-400 hover:text-gray-700 text-base leading-none">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input className={`${input} flex-1`} value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && skillInput.trim()) { updateSection('skills', [...resumeData.skills, skillInput.trim()]); setSkillInput('') }}} placeholder="e.g. React, TypeScript, Figma" />
            <button onClick={() => { if (skillInput.trim()) { updateSection('skills', [...resumeData.skills, skillInput.trim()]); setSkillInput('') }}} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">Add</button>
          </div>
        </div>
      )

      case 5: return (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Projects</h2>
            <p className="text-sm text-gray-400 mt-0.5">Showcase your best work.</p>
          </div>
          {resumeData.projects.map((proj, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{proj.name || 'New project'}</span>
                {resumeData.projects.length > 1 && <button onClick={() => removeEntry('projects', i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>}
              </div>
              <div className={grid2}>
                <div><label className={label}>Project name</label><input className={input} value={proj.name} onChange={e => updateEntry('projects', i, 'name', e.target.value)} placeholder="AI Resume Builder" /></div>
                <div><label className={label}>URL (optional)</label><input className={input} value={proj.url} onChange={e => updateEntry('projects', i, 'url', e.target.value)} placeholder="github.com/you/project" /></div>
              </div>
              <div><label className={label}>Description</label><textarea className={`${input} resize-none`} rows={3} value={proj.description} onChange={e => updateEntry('projects', i, 'description', e.target.value)} placeholder="Built a SaaS app that..." /></div>
            </div>
          ))}
          <button onClick={() => addEntry('projects', { name: '', url: '', description: '' })} className="w-full border border-dashed border-gray-300 rounded-xl py-2.5 text-sm text-gray-400 hover:bg-gray-50 transition">
            + Add project
          </button>
        </div>
      )

      case 6: return (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Certifications</h2>
            <p className="text-sm text-gray-400 mt-0.5">Professional certificates and licenses.</p>
          </div>
          {resumeData.certs.map((cert, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{cert.name || 'New certification'}</span>
                {resumeData.certs.length > 1 && <button onClick={() => removeEntry('certs', i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>}
              </div>
              <div className={grid2}>
                <div><label className={label}>Certification name</label><input className={input} value={cert.name} onChange={e => updateEntry('certs', i, 'name', e.target.value)} placeholder="AWS Cloud Practitioner" /></div>
                <div><label className={label}>Issuing organization</label><input className={input} value={cert.issuer} onChange={e => updateEntry('certs', i, 'issuer', e.target.value)} placeholder="Amazon Web Services" /></div>
                <div><label className={label}>Issue date</label><input className={input} value={cert.date} onChange={e => updateEntry('certs', i, 'date', e.target.value)} placeholder="Jan 2024" /></div>
                <div><label className={label}>Credential ID</label><input className={input} value={cert.credentialId} onChange={e => updateEntry('certs', i, 'credentialId', e.target.value)} placeholder="ABC-123456" /></div>
              </div>
            </div>
          ))}
          <button onClick={() => addEntry('certs', { name: '', issuer: '', date: '', credentialId: '' })} className="w-full border border-dashed border-gray-300 rounded-xl py-2.5 text-sm text-gray-400 hover:bg-gray-50 transition">
            + Add certification
          </button>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-gray-800">← Dashboard</button>
        <input value={title} onChange={e => setTitle(e.target.value)} className="text-sm font-medium text-center border-none outline-none bg-transparent" />
        <button onClick={() => save(true)} className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => i <= step && setStep(i)} className={`w-7 h-7 rounded-full text-xs font-medium transition ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </button>
              <span className={`text-xs ${i === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="text-sm border border-gray-200 px-5 py-2 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition">Back</button>
          <button onClick={() => step === STEPS.length - 1 ? save(true) : setStep(s => s + 1)} className="text-sm bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition">
            {step === STEPS.length - 1 ? 'Finish & Save' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
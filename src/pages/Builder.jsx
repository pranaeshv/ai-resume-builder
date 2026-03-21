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

  useEffect(() => {
    if (id) loadResume()
  }, [id])

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

  async function save() {
    setSaving(true)
    await supabase
      .from('resumes')
      .update({ data: resumeData, title, updated_at: new Date().toISOString() })
      .eq('id', id)
    setSaving(false)
  }

  function update(section, value) {
    setResumeData(prev => ({ ...prev, [section]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-gray-800">
          ← Dashboard
        </button>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="text-sm font-medium text-center border-none outline-none bg-transparent"
        />
        <button
          onClick={save}
          className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => i <= step && setStep(i)}
                className={`w-7 h-7 rounded-full text-xs font-medium transition ${
                  i < step ? 'bg-green-500 text-white' :
                  i === step ? 'bg-black text-white' :
                  'bg-gray-200 text-gray-500'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </button>
              <span className={`text-xs ${i === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step content will go here */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-gray-400 text-sm text-center">Step {step + 1}: {STEPS[step]} — form coming next</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm border border-gray-200 px-5 py-2 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
          >
            Back
          </button>
          <button
            onClick={() => step === STEPS.length - 1 ? save() : setStep(s => s + 1)}
            className="text-sm bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            {step === STEPS.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
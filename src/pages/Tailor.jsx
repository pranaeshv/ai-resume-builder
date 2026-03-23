import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
})

export default function Tailor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resumeData, setResumeData] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadResume()
  }, [id])

  async function loadResume() {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single()
    if (!error) setResumeData(data)
  }

  async function tailorResume() {
    if (!jobDescription.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const resume = resumeData.data
      const prompt = `You are a professional resume writer. Given the resume data and job description below, rewrite 3 things:
1. A tailored professional summary (2-3 sentences)
2. Improved bullet points for each work experience entry (2-3 bullets per job, action verb + metric)
3. A list of relevant skills to highlight for this job

Resume data:
Name: ${resume.personal?.name}
Current summary: ${resume.summary?.text}
Experience: ${resume.experience?.map(e => `${e.title} at ${e.company}: ${e.description}`).join('\n')}
Skills: ${resume.skills?.join(', ')}

Job description:
${jobDescription}

Respond ONLY with a valid JSON object in this exact format, no explanation, no markdown backticks:
{
  "summary": "rewritten summary here",
  "experience": [
    {
      "company": "company name",
      "title": "job title",
      "bullets": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ],
  "skills": ["skill1", "skill2", "skill3"]
}`

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })

      const raw = response.choices[0].message.content
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      setResult(parsed)
    } catch (err) {
      setError('Something went wrong. Check your API key or try again.')
      console.error(err)
    }

    setLoading(false)
  }

  async function applyAndSave() {
    if (!result) return
    setSaving(true)

    const updated = {
      ...resumeData.data,
      summary: { text: result.summary },
      skills: result.skills,
      experience: resumeData.data.experience.map((exp, i) => ({
        ...exp,
        description: result.experience[i]
          ? result.experience[i].bullets.map(b => `• ${b}`).join('\n')
          : exp.description
      }))
    }

    await supabase
      .from('resumes')
      .update({ data: updated, updated_at: new Date().toISOString() })
      .eq('id', id)

    setSaving(false)
    navigate(`/builder/${id}`)
  }

  if (!resumeData) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate(`/builder/${id}`)} className="text-sm text-gray-500 hover:text-gray-800">
          ← Back to builder
        </button>
        <span className="text-sm font-medium">AI Tailor</span>
        {result && (
          <button
            onClick={applyAndSave}
            className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            {saving ? 'Saving...' : 'Apply & Save'}
          </button>
        )}
        {!result && <div className="w-24" />}
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Tailor your resume</h1>
          <p className="text-gray-400 text-sm mt-1">
            Paste a job description and AI will rewrite your summary, experience bullets, and skills to match.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <label className="text-xs font-medium text-gray-500 mb-2 block">Job description</label>
          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            rows={8}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300 bg-white resize-none"
            placeholder="Paste the full job description here..."
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <button
            onClick={tailorResume}
            disabled={loading || !jobDescription.trim()}
            className="mt-4 w-full bg-black text-white py-2.5 rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-40"
          >
            {loading ? 'Tailoring your resume...' : 'Tailor Resume with AI'}
          </button>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Summary</span>
                <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">AI rewritten</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Experience</span>
                <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">AI rewritten</span>
              </div>
              <div className="space-y-4">
                {result.experience.map((exp, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-gray-800 mb-2">{exp.title} — {exp.company}</p>
                    <ul className="space-y-1">
                      {exp.bullets.map((b, j) => (
                        <li key={j} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-gray-400 flex-shrink-0">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Skills</span>
                <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">AI suggested</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((s, i) => (
                  <span key={i} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>

            <button
              onClick={applyAndSave}
              className="w-full bg-black text-white py-3 rounded-xl text-sm hover:bg-gray-800 transition"
            >
              {saving ? 'Saving...' : 'Apply changes & go back to builder'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
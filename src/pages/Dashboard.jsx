import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchResumes()
  }, [])

  async function fetchResumes() {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('updated_at', { ascending: false })
    if (!error) setResumes(data)
    setLoading(false)
  }

  async function createNew() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('resumes')
      .insert({ user_id: user.id, title: 'Untitled Resume', data: {} })
      .select()
      .single()
    if (!error) navigate(`/builder/${data.id}`)
  }

  async function deleteResume(id) {
    await supabase.from('resumes').delete().eq('id', id)
    setResumes(resumes.filter(r => r.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Resume Builder</h1>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800">
          Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold">My Resumes</h2>
            <p className="text-gray-500 text-sm mt-1">Create and manage your resumes</p>
          </div>
          <button
            onClick={createNew}
            className="bg-black text-white px-5 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition"
          >
            + New Resume
          </button>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-400 mb-4">No resumes yet</p>
            <button
              onClick={createNew}
              className="bg-black text-white px-5 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition"
            >
              Create your first resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map(r => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition">
                <h3 className="font-medium text-gray-900 mb-1">{r.title}</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Updated {new Date(r.updated_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/builder/${r.id}`)}
                    className="flex-1 text-sm border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/tailor/${r.id}`)}
                    className="flex-1 text-sm border border-indigo-100 text-indigo-500 rounded-lg py-1.5 hover:bg-indigo-50 transition"
                  >
                    AI Tailor
                  </button>
                  <button
                    onClick={() => deleteResume(r.id)}
                    className="text-sm text-red-400 border border-red-100 rounded-lg px-3 py-1.5 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => navigate(`/preview/${r.id}`)}
                     className="flex-1 text-sm border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition"
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
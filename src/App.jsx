import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [photos, setPhotos] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) loadPhotos()
    else setPhotos([])
  }, [session])

  async function signUp() {
    setMessage('')
    const { error } = await supabase.auth.signUp({ email, password })
    setMessage(error ? error.message : 'Account created! Check your email if confirmation is required.')
  }

  async function signIn() {
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function loadPhotos() {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    const photoList = await Promise.all(
      (data || []).map(async (photo) => {
        const { data: signedData } = await supabase.storage
          .from('gallery-photos')
          .createSignedUrl(photo.file_path, 3600)

        return { ...photo, imageUrl: signedData?.signedUrl }
      })
    )

    setPhotos(photoList)
  }

  async function uploadPhoto() {
    if (!selectedFile || !session) return

    setLoading(true)
    setMessage('')

    const filePath = `${session.user.id}/${Date.now()}-${selectedFile.name}`

    const { error: uploadError } = await supabase.storage
      .from('gallery-photos')
      .upload(filePath, selectedFile)

    if (uploadError) {
      setMessage(uploadError.message)
      setLoading(false)
      return
    }

    const { error: dbError } = await supabase.from('photos').insert({
      user_id: session.user.id,
      file_name: selectedFile.name,
      file_path: filePath,
      file_size: selectedFile.size,
      content_type: selectedFile.type,
    })

    if (dbError) {
      await supabase.storage.from('gallery-photos').remove([filePath])
      setMessage(dbError.message)
    } else {
      setMessage('Photo uploaded successfully!')
      setSelectedFile(null)
      await loadPhotos()
    }

    setLoading(false)
  }

  async function deletePhoto(photo) {
    const confirmed = window.confirm('Delete this photo?')
    if (!confirmed) return

    const { error: storageError } = await supabase.storage
      .from('gallery-photos')
      .remove([photo.file_path])

    if (storageError) {
      setMessage(storageError.message)
      return
    }

    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photo.id)

    if (dbError) {
      setMessage(dbError.message)
      return
    }

    setMessage('Photo deleted.')
    await loadPhotos()
  }

  if (!session) {
    return (
      <main className="auth-page">
        <form className="auth-card" onSubmit={(e) => e.preventDefault()}>
          <h1>Cloud Photo Gallery</h1>
          <p>Sign in or create an account to manage your photos.</p>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (at least 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button type="button" onClick={signIn}>Sign In</button>
          <button type="button" className="secondary" onClick={signUp}>Create Account</button>

          {message && <p className="message">{message}</p>}
        </form>
      </main>
    )
  }

  return (
    <main className="gallery-page">
      <header className="topbar">
        <div>
          <h1>My Cloud Gallery</h1>
          <p>{session.user.email}</p>
        </div>
        <button className="secondary" onClick={signOut}>Sign Out</button>
      </header>

      <section className="upload-card">
        <h2>Upload a photo</h2>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        <button onClick={uploadPhoto} disabled={!selectedFile || loading}>
          {loading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </section>

      {message && <p className="message">{message}</p>}

      <section className="photo-section">
        <h2>My Photos ({photos.length})</h2>
        {photos.length === 0 ? (
          <p className="empty">No photos yet. Upload your first photo!</p>
        ) : (
          <div className="photo-grid">
            {photos.map((photo) => (
              <article className="photo-card" key={photo.id}>
                {photo.imageUrl && (
                  <a href={photo.imageUrl} target="_blank" rel="noreferrer">
                    <img src={photo.imageUrl} alt={photo.file_name} />
                  </a>
                )}
                <div className="photo-info">
                  <p title={photo.file_name}>{photo.file_name}</p>
                  <small>{(photo.file_size / 1024 / 1024).toFixed(2)} MB</small>
                  <button className="delete-button" onClick={() => deletePhoto(photo)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
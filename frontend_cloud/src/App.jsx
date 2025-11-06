import ImageUpload from './components/ImageUpload'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Estate Platform</h1>
        <p>Upload and manage property images</p>
      </header>
      <main className="main">
        <ImageUpload />
      </main>
    </div>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateReactionPage from './pages/CreateReactionPage';
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-gray-800">
                    BioReactLab
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    to="/create-reaction"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Create Reaction
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={
              <div className="text-center py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to BioReactLab
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  A platform for metabolic reaction analysis
                </p>
                <Link
                  to="/create-reaction"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create New Reaction
                </Link>
              </div>
            } />
            <Route path="/create-reaction" element={<CreateReactionPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

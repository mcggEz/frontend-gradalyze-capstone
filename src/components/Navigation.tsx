import { Link } from "react-router-dom"

const Navigation = () => {
  return (
    <nav className="border-b border-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <h1 className="text-lg sm:text-xl font-bold">Gradalyze</h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">

          <Link 
            to="/login" 
            className="bg-white text-black px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  </nav>
  )
}

export default Navigation
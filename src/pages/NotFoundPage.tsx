import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* 404 Number */}
        <div className="text-9xl font-bold text-blue-500 mb-4">404</div>
        
        {/* Error Message */}
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-8 text-lg">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <Link 
            to="/" 
            className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Go back
          </Link>
          
   
        </div>

   
      </div>
    </div>
  );
};

export default NotFoundPage;

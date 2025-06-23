
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">
          Hello Tailwind!
        </h1>
        <p className="text-gray-700 text-center mb-6">
          This is a React app styled with Tailwind CSS.
        </p>
        <div className="flex justify-center">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Click Me
          </button>
        </div>
      </div>
    </div>
  );
}


export default App

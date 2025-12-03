import logo from 'figma:asset/01d5890a09f69b5f617fc6c29ca60f163bad1f3f.png';
import poster1 from 'figma:asset/bf5e9c8a09f135294f5631997ee4c90a49010289.png';
import poster2 from 'figma:asset/998835c4d0435ba2b225625965248560bef6c875.png';
import poster3 from 'figma:asset/235495784eb9e11796e8adc912000ceed097d44c.png';
import poster4 from 'figma:asset/ff8d167696e456862f095314ed8271a342cfd20e.png';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Marketing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }} className="flex-shrink-0">
              <img src={logo} alt="Ride United" className="h-10" />
            </a>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Site</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-[#1E293B] text-4xl mb-12 text-center">Marketing Materials</h1>
        
        <div className="space-y-12">
          {/* Poster 1 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img 
              src={poster1} 
              alt="Float Past the Friction - Marketing Poster" 
              className="w-full h-auto"
            />
          </div>

          {/* Poster 2 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img 
              src={poster2} 
              alt="Electric Vibes Real Connection - Marketing Poster" 
              className="w-full h-auto"
            />
          </div>

          {/* Poster 3 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img 
              src={poster3} 
              alt="Ride United Logo" 
              className="w-full h-auto"
            />
          </div>

          {/* Poster 4 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img 
              src={poster4} 
              alt="Electric Unicycle Information - Marketing Poster" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
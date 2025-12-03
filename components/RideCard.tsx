interface RideCardProps {
  image: string;
  title: string;
  description: string;
  tags: Array<{ label: string; color: 'green' | 'blue' | 'purple' | 'indigo' | 'red' }>;
  distance: string;
  time: string;
  location?: string;
  dateTime?: string;
  routeLink?: string;
  onClick?: () => void;
}

export function RideCard({ image, title, description, tags, distance, time, location, dateTime, routeLink, onClick }: RideCardProps) {
  const getTagClasses = (color: string) => {
    const colorMap = {
      green: 'bg-[#ECFDF5] text-[#10B981] border-[#10B981]',
      blue: 'bg-blue-50 text-blue-600 border-blue-600',
      purple: 'bg-purple-50 text-purple-600 border-purple-600',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-600',
      red: 'bg-red-50 text-red-600 border-red-600',
    };
    return colorMap[color] || colorMap.green;
  };

  const handleCardClick = () => {
    if (onClick) onClick();
  };

  const handleRouteLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const isIntro2Speed = title === 'Intro 2 Speed';

  return (
    <div 
      className="group bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-xl hover:bg-[#ECFDF5] hover:scale-105 hover:border-[#10B981] transition-all duration-200 cursor-pointer flex flex-col"
      onClick={handleCardClick}
    >
      <div className="aspect-video overflow-hidden border-b border-gray-200 bg-black flex-shrink-0">
        <img 
          src={image} 
          alt={title} 
          className={`w-full h-full ${isIntro2Speed ? 'object-contain p-4' : 'object-cover object-[center_70%]'}`}
        />
      </div>
      <div className="p-6">
        <h3 className="text-[#1E293B] mb-2">{title}</h3>
        <p className="text-[#1E293B] opacity-70 mb-4">
          {description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className={`px-3 py-1 rounded-full border text-sm ${getTagClasses(tag.color)}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
        {dateTime && (
          <div className="text-sm text-[#1E293B] opacity-70 mb-2">
            {dateTime}
          </div>
        )}
        {routeLink && (
          <a
            href={routeLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleRouteLinkClick}
            className="inline-flex items-center gap-1 text-sm text-[#10B981] hover:text-[#059669] transition-colors"
          >
            View Route →
          </a>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <div 
      onClick={() => onClick(course)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-[#00311e] group"
    >
      <div className="relative aspect-video bg-gradient-to-br from-[#00311e] to-[#005a36] flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-500">
        <span className="absolute top-4 left-4 bg-white/90 text-[#00311e] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
          ⏱️ {course.duration}
        </span>
        {course.icon || '🎬'}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-[#00311e] mb-2 line-clamp-1">{course.title}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
          {course.description}
        </p>
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            <span className="bg-gray-100 px-2 py-0.5 rounded">🕒 {course.uploadTime}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="bg-[#00311e] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                {course.level}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

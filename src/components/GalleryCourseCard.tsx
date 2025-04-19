import { Chapter, Course, Unit } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
  className?: string;
};

const GalleryCourseCard = ({ course, className = "" }: Props) => {
  return (
    <div className={`border rounded-lg border-secondary overflow-hidden flex flex-col ${className}`}>
      {/* Image Section */}
      <div className="relative aspect-video flex-shrink-0">
        <Link href={`/course/${course.id}/0/0`} className="relative block h-full w-full">
          <Image
            src={course.image || "/course-placeholder.jpg"}
            className="object-cover w-full h-full"
            fill
            alt={course.name}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <span className="absolute px-3 py-2 text-sm font-medium text-white bg-black/70 rounded-md bottom-3 left-3 right-3 line-clamp-2">
            {course.name}
          </span>
        </Link>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-grow flex flex-col">
        <h4 className="text-sm text-secondary-foreground/60 mb-3">Units</h4>
        <div className="space-y-2 flex-grow">
          {course.units.map((unit, unitIndex) => (
            <Link
              href={`/course/${course.id}/${unitIndex}/0`}
              key={unit.id}
              className="block text-sm hover:text-primary transition-colors line-clamp-1"
            >
              {unit.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryCourseCard;
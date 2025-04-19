import GalleryCourseCard from "@/components/GalleryCourseCard";
import { prisma } from "@/lib/db";
import React from "react";

type Props = {};

const Page = async (props: Props) => {
  const courses = await prisma.course.findMany({
    include: {
      units: {
        include: { chapters: true },
      },
    },
  });

  return (
    <div className="mt-32 py-8 mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {courses.map((course) => (
          <div 
            key={course.id}
            className="w-full h-full min-w-0" // Ensures consistent sizing container
          >
            <GalleryCourseCard 
              course={course} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
"use client";

import { useState, useEffect } from "react";

export default function SkillChart() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true); // マウント後にアニメーション開始
  }, []);

  const skills = [
    { name: "React", level: "90%" },
    { name: "Next.js", level: "85%" },
    { name: "TypeScript", level: "80%" },
  ];

  return (
    <div className="space-y-4">
      {skills.map((skill) => (
        <div key={skill.name}>
          <p>{skill.name}</p>
          <div className="bg-gray-200 h-4 w-full">
            <div
              className="bg-blue-500 h-4 transition-all duration-1000"
              style={{ width: animate ? skill.level : "0%" }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { Github, Linkedin, Mail, Code, Palette, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const teamMembers = [
  {
    name: "Shivansh",
    role: "Full Stack Developer",
    icon: Code,
    description: "Architected the full-stack solution and implemented the AI model integration.",
    skills: ["React", "Next.js", "Python", "TensorFlow"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "shivansh@ecotech.com",
  },
  {
    name: "Vidhan",
    role: "UI/UX Designer & Frontend Dev",
    icon: Palette,
    description: "Designed the eco-friendly interface and implemented responsive components.",
    skills: ["Figma", "TailwindCSS", "React", "TypeScript"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "vidhan@ecotech.com",
  },
  {
    name: "Tanishq",
    role: "ML Engineer & Backend Dev",
    icon: Database,
    description: "Developed and trained the disease detection AI model with 98% accuracy.",
    skills: ["Python", "PyTorch", "Node.js", "FastAPI"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "tanishq@ecotech.com",
  },
];

export default function TeamPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Meet the Team
            </span>
          </div>

          {/* Logo and Team Name */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {/* Logo with gentle glow */}
            <div
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center
              bg-transparent shadow-[0_0_12px_rgba(236,72,153,0.25)]
              animate-gentleGlow"
            >
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Copilot_20251104_191900-1762264717167.png?width=8000&height=8000&resize=contain"
                alt="EcoTech Squad Logo"
                fill
                className="object-contain scale-110 drop-shadow-[0_0_10px_rgba(236,72,153,0.35)]"
                priority
              />
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl text-center sm:text-left tracking-tight">
              <span className="text-gray-900 dark:text-white font-black">Eco</span>
              <span className="text-gray-900 dark:text-white font-semibold">Tech</span>
              <span className="text-gray-900 dark:text-white font-normal">&nbsp;Squad</span>
            </h1>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A passionate team of developers and designers committed to using technology for environmental sustainability.
          </p>
        </div>

        {/* Team Members */}
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => {
            const IconComponent = member.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 hover:shadow-xl group"
              >
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>

                  <CardTitle className="text-2xl">{member.name}</CardTitle>
                  <CardDescription className="text-base font-medium text-green-600 dark:text-green-400">
                    {member.role}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">{member.description}</p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-center gap-2 pt-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-green-600 dark:hover:text-green-400" asChild>
                      <a href={member.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-green-600 dark:hover:text-green-400" asChild>
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-green-600 dark:hover:text-green-400" asChild>
                      <a href={`mailto:${member.email}`} aria-label="Email">
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Team Mission */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">Our Mission</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              At EcoTech Squad, we believe in leveraging cutting-edge AI technology to solve real-world agricultural challenges.
              Our plant disease detector aims to help farmers and gardeners identify and treat plant diseases early,
              reducing crop loss and promoting sustainable farming practices. Together, we're building a greener future,
              one plant at a time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
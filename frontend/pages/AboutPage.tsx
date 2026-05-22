import React from 'react';
import { BookOpen, Award, Users, Mail, MapPin, GraduationCap, Calendar, Sparkles } from 'lucide-react';

interface FacultyMember {
  name: string;
  designation: string;
  qualification: string;
  specialization: string;
  email: string;
  experience: string;
}

const FACULTY_MEMBERS: FacultyMember[] = [
  {
    name: "Dr. Cini Kurian",
    designation: "Professor & Head of Department",
    qualification: "Ph.D. in Computer Science, MCA",
    specialization: "Data Mining, Machine Learning, Data Analytics",
    email: "cinikurian@uccollege.edu.in",
    experience: "22 Years"
  },
  {
    name: "Prof. Sherin J. Abraham",
    designation: "Assistant Professor",
    qualification: "MCA, M.Phil.",
    specialization: "Web Technologies, Cloud Computing, System Software",
    email: "sherin@uccollege.edu.in",
    experience: "15 Years"
  },
  {
    name: "Prof. Sunila Mary Varghese",
    designation: "Assistant Professor",
    qualification: "MCA",
    specialization: "Database Management Systems, Software Engineering, OOPs",
    email: "sunilamary@uccollege.edu.in",
    experience: "14 Years"
  },
  {
    name: "Prof. Jibin Isaac",
    designation: "Assistant Professor",
    qualification: "M.Tech. in Computer Science, B.Tech.",
    specialization: "Computer Networks, Cyber Security, Cryptography",
    email: "jibinisaac@uccollege.edu.in",
    experience: "10 Years"
  },
  {
    name: "Prof. Anila Jose",
    designation: "Assistant Professor",
    qualification: "MCA, NET qualified",
    specialization: "Artificial Intelligence, Python Programming, Deep Learning",
    email: "anilajose@uccollege.edu.in",
    experience: "8 Years"
  }
];

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-mca-900 via-mca-950 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
        {/* Decorative lighting orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-mca-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-mca-200 text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <span>Union Christian College Aluva (UC College)</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-serif mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-300">
            About MCA Department
          </h1>
          <p className="text-lg sm:text-xl text-mca-100/90 max-w-2xl mx-auto leading-relaxed">
            Fostering technical innovation, computational excellence, and ethical leadership since inception.
          </p>
        </div>
      </section>

      {/* College Overview & Heritage */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-16">
        <div className="glass rounded-2xl p-8 md:p-12 shadow-xl border border-white/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-mca-700 text-sm font-semibold mb-3 bg-mca-50 px-3.5 py-1.5 rounded-full">
                <BookOpen className="w-4 h-4" />
                Historic Legacy
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif mb-4">
                Union Christian College, Aluva
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Union Christian College, Aluva (popularly known as UC College) is a premier institute of higher education in Kerala, South India. Established in <strong>1921</strong> as a center of educational excellence, the college is renowned for its historic campus, eco-friendly environment, and commitment to value-based learning.
              </p>
              <p className="text-gray-600 leading-relaxed">
                The Master of Computer Applications (MCA) Department was founded to bridge the gap between academic theories and industry requirements. Over the years, the department has produced highly successful software developers, database managers, network administrators, and tech entrepreneurs who excel globally.
              </p>
            </div>
            
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-white/80 p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <span className="text-3xl font-extrabold text-mca-700 block mb-1">1921</span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">College Founded</span>
              </div>
              <div className="bg-white/80 p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <span className="text-3xl font-extrabold text-mca-700 block mb-1">A+</span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">NAAC Accredited</span>
              </div>
              <div className="bg-white/80 p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <span className="text-3xl font-extrabold text-mca-700 block mb-1">20+ Yrs</span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">MCA Heritage</span>
              </div>
              <div className="bg-white/80 p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <span className="text-3xl font-extrabold text-mca-700 block mb-1">100%</span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Placement Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="bg-gradient-to-br from-mca-900 to-mca-800 text-white rounded-2xl p-8 shadow-lg border border-mca-700 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-sky-300" />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-4">Our Vision</h3>
              <p className="text-mca-100/90 leading-relaxed mb-6">
                To be a center of excellence in computer applications education, nurturing competent software professionals who possess outstanding technical skills, analytical capabilities, ethical values, and a strong sense of social responsibility.
              </p>
            </div>
            <div className="border-t border-white/10 pt-4 flex items-center gap-2 text-xs text-mca-300 uppercase tracking-widest font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              MCA Dept • UC College Aluva
            </div>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200/60 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-mca-50 flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-mca-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-serif mb-4">Our Mission</h3>
              <ul className="text-gray-600 space-y-3 leading-relaxed mb-6">
                <li className="flex gap-2">
                  <span className="text-mca-600 font-bold">•</span>
                  Provide quality theoretical and practical education in computer science and modern IT frameworks.
                </li>
                <li className="flex gap-2">
                  <span className="text-mca-600 font-bold">•</span>
                  Encourage innovation and critical thinking through seminar presentations, project works, and technical contests.
                </li>
                <li className="flex gap-2">
                  <span className="text-mca-600 font-bold">•</span>
                  Inculcate social obligations, collaborative teamwork qualities, and strong professional ethics.
                </li>
              </ul>
            </div>
            <div className="border-t border-gray-100 pt-4 flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest font-semibold">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Updated Academic Year 2025-2026
            </div>
          </div>
        </div>
      </section>

      {/* Teachers / Faculty Details */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-mca-700 text-sm font-semibold mb-3 bg-mca-50 px-3.5 py-1.5 rounded-full">
            <Users className="w-4 h-4" />
            Faculty Profiles
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">
            Our Dedicated Faculty Members
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mt-3">
            Meet the professional instructors and academic advisors guiding our students toward successful technology careers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FACULTY_MEMBERS.map((faculty, idx) => (
            <div
              key={faculty.name}
              className="glow-card bg-white rounded-2xl border border-gray-200/70 p-6 flex flex-col justify-between shadow-sm transition-all"
            >
              <div>
                {/* Faculty Header with Avatar placeholder */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-mca-600 to-sky-500 text-white font-bold flex items-center justify-center text-lg shadow">
                    {faculty.name.split(' ').slice(-2).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">{faculty.name}</h3>
                    <p className="text-xs text-mca-600 font-semibold">{faculty.designation}</p>
                  </div>
                </div>

                {/* Faculty Body */}
                <div className="space-y-3.5 border-t border-gray-100 pt-4 text-sm text-gray-600">
                  <div>
                    <span className="block text-xs text-gray-400 font-medium uppercase tracking-wider">Qualifications</span>
                    <p className="font-medium text-gray-800">{faculty.qualification}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-medium uppercase tracking-wider">Specializations</span>
                    <p className="font-medium text-gray-800">{faculty.specialization}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-medium uppercase tracking-wider">Teaching Experience</span>
                    <p className="font-medium text-gray-800">{faculty.experience}</p>
                  </div>
                </div>
              </div>

              {/* Faculty Footer with Email Link */}
              <div className="border-t border-gray-100 mt-6 pt-4">
                <a
                  href={`mailto:${faculty.email}`}
                  className="inline-flex items-center gap-2 text-sm text-mca-700 hover:text-mca-900 font-semibold transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>{faculty.email}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

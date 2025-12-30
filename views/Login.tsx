
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Card, Button } from '../components/Common';
import { Icons, LOGO_URL } from '../constants';

const Login: React.FC = () => {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Base Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Student Specific State
  const [department, setDepartment] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [yearOfAdmission, setYearOfAdmission] = useState('');
  const [institute, setInstitute] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!selectedRole) return;

    // Strict domain validation
    if (!email.toLowerCase().endsWith('@ladtem.org')) {
      setEmailError('Access restricted. Please use an official @ladtem.org email address.');
      return;
    }
    
    setIsLoading(true);
    
    // Only send metadata if it's a student and they are signing up
    const metadata = (selectedRole === UserRole.STUDENT && isSignUp) ? {
      department,
      matricNumber,
      yearOfAdmission,
      institute
    } : undefined;

    // Simulate authentication delay
    setTimeout(() => {
      login(selectedRole, name, email, isSignUp, metadata);
      setIsLoading(false);
    }, 800);
  };

  if (selectedRole) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-in zoom-in-95 fade-in duration-300">
          <button 
            onClick={() => {
              setSelectedRole(null);
              setEmailError('');
              setIsSignUp(false);
            }}
            className="mb-8 flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 transition-colors group tracking-widest uppercase"
          >
            <div className="group-hover:-translate-x-1 transition-transform">←</div>
            ROLE SELECTION
          </button>

          <Card className="shadow-2xl shadow-blue-900/10 border-slate-200">
            <div className="text-center mb-6">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 bg-white shadow-xl shadow-slate-200/50 p-2 overflow-hidden`}>
                <img src={LOGO_URL} alt="LADTEM" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {selectedRole === UserRole.STUDENT ? (isSignUp ? 'Registration' : 'Student Login') : 'Portal Entry'}
              </h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Authorized access: <span className="text-blue-600">{selectedRole}</span></p>
            </div>

            {selectedRole === UserRole.STUDENT && (
              <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                <button 
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  SIGN IN
                </button>
                <button 
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  SIGN UP
                </button>
              </div>
            )}

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Full Legal Name</label>
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Official Email</label>
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-widest">@LADTEM.ORG</span>
                  </div>
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="name@ladtem.org"
                    className={`w-full h-11 px-4 rounded-xl border outline-none transition-all font-medium ${
                      emailError 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/10' 
                        : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                    }`}
                  />
                  {emailError && (
                    <p className="mt-1.5 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">
                      {emailError}
                    </p>
                  )}
                </div>

                {selectedRole === UserRole.STUDENT && isSignUp && (
                  <div className="space-y-4 pt-2 border-t border-slate-50 mt-2 animate-in slide-in-from-top-4 duration-500">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Institute</label>
                      <select
                        required
                        value={institute}
                        onChange={(e) => setInstitute(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium bg-slate-50/50 appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select Institute</option>
                        <option value="DFMI">DFMI</option>
                        <option value="IES (Entrepreneurship)">IES (Entrepreneurship)</option>
                        <option value="RESEARCH+">RESEARCH+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Department</label>
                      <input 
                        required
                        type="text" 
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Computer Science"
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium bg-slate-50/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Matric No.</label>
                        <input 
                          required
                          type="text" 
                          value={matricNumber}
                          onChange={(e) => setMatricNumber(e.target.value)}
                          placeholder="CS/23/001"
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium bg-slate-50/50 uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Adm. Year</label>
                        <input 
                          required
                          type="number" 
                          value={yearOfAdmission}
                          onChange={(e) => setYearOfAdmission(e.target.value)}
                          placeholder="2024"
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium bg-slate-50/50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  isLoading={isLoading}
                  className="w-full h-12 text-sm font-black uppercase tracking-widest shadow-xl"
                  variant={selectedRole === UserRole.ADMIN ? 'outline' : (selectedRole === UserRole.EXAMINER ? 'secondary' : 'primary')}
                >
                  {selectedRole === UserRole.STUDENT 
                    ? (isSignUp ? 'Create Student Account' : 'Authenticate Session') 
                    : 'Access Security Hub'}
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                Ladtem Secure Commission
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400 rounded-full blur-[140px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-5xl">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-6 duration-1000">
          <div className="relative inline-flex mb-8">
             <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
             <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white shadow-2xl shadow-blue-200/50 rounded-[40px] flex items-center justify-center p-4 transform hover:rotate-2 transition-transform duration-500">
                <img src={LOGO_URL} alt="LADTEM Commission Logo" className="w-full h-full object-contain animate-in zoom-in-50 duration-700" />
             </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
            LADTEM <span className="text-blue-600">Commission</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-lg mx-auto font-medium leading-relaxed tracking-tight">
            AI-Powered Academic Excellence. Access your commission portal to begin your evaluation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          {/* Student Role */}
          <div 
            onMouseEnter={() => setHoveredRole(UserRole.STUDENT)}
            onMouseLeave={() => setHoveredRole(null)}
            className="group relative"
            onClick={() => {
              setSelectedRole(UserRole.STUDENT);
              setIsSignUp(false);
            }}
          >
            <div className={`absolute inset-0 bg-blue-600 rounded-2xl blur-2xl opacity-0 transition-opacity duration-300 ${hoveredRole === UserRole.STUDENT ? 'opacity-10' : ''}`}></div>
            <Card className={`relative h-full transition-all cursor-pointer duration-500 border-2 ${hoveredRole === UserRole.STUDENT ? 'border-blue-500 -translate-y-2' : 'border-white'}`}>
              <div className="text-center h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <Icons.Users />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Student</h3>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">Take examinations, track results, and view AI proctored insights.</p>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-50 space-y-3">
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">Authenticate Portal →</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Examiner Role */}
          <div 
            onMouseEnter={() => setHoveredRole(UserRole.EXAMINER)}
            onMouseLeave={() => setHoveredRole(null)}
            className="group relative"
            onClick={() => setSelectedRole(UserRole.EXAMINER)}
          >
            <div className={`absolute inset-0 bg-indigo-600 rounded-2xl blur-2xl opacity-0 transition-opacity duration-300 ${hoveredRole === UserRole.EXAMINER ? 'opacity-10' : ''}`}></div>
            <Card className={`relative h-full transition-all cursor-pointer duration-500 border-2 ${hoveredRole === UserRole.EXAMINER ? 'border-indigo-500 -translate-y-2' : 'border-white'}`}>
              <div className="text-center h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <Icons.Exam />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Examiner</h3>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">Create assessments and review AI-generated grading reports.</p>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">Access Dashboard →</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Admin Role */}
          <div 
            onMouseEnter={() => setHoveredRole(UserRole.ADMIN)}
            onMouseLeave={() => setHoveredRole(null)}
            className="group relative"
            onClick={() => setSelectedRole(UserRole.ADMIN)}
          >
            <div className={`absolute inset-0 bg-emerald-600 rounded-2xl blur-2xl opacity-0 transition-opacity duration-300 ${hoveredRole === UserRole.ADMIN ? 'opacity-10' : ''}`}></div>
            <Card className={`relative h-full transition-all cursor-pointer duration-500 border-2 ${hoveredRole === UserRole.ADMIN ? 'border-emerald-500 -translate-y-2' : 'border-white'}`}>
              <div className="text-center h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <Icons.Dashboard />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Admin</h3>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">Oversee academic registry, monitor attendance and performance.</p>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">Registry Access →</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  BrainCircuit,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { solveMathProblem, MathSolution } from './services/geminiService';

export default function App() {
  const [problemText, setProblemText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<MathSolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const solveProblem = async () => {
    if (!problemText.trim() && !selectedImage) {
      setError('Please provide a problem first (type it or upload a screenshot).');
      return;
    }

    setIsSolving(true);
    setError(null);
    setSolution(null);

    try {
      const base64Data = selectedImage ? selectedImage.split(',')[1] : undefined;
      const result = await solveMathProblem({
        text: problemText || undefined,
        imageBase64: base64Data,
        mimeType: imageMimeType || undefined
      });
      setSolution(result);
    } catch (err: any) {
      console.error(err);
      setError('Oops! Something went wrong while solving your problem. Please try again.');
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <BrainCircuit size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">AI <span className="text-blue-600">maths buddy</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Study Tools</a>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all">Sign Up</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 pb-24">
        {/* Hero Section - Only show when no solution */}
        {!solution && (
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight font-display"
            >
              Solve, Learn, and <span className="text-blue-600">Master</span> Maths.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Stuck on a tough concept? Take a photo or type your problem. 
              Get deep explanations and practice questions to truly understand.
            </motion.p>
          </div>
        )}

        <div className={`grid gap-6 ${solution ? 'lg:grid-cols-12' : 'max-w-3xl mx-auto'}`}>
          {/* Input Section - Bento Card */}
          <section className={`${solution ? 'lg:col-span-8' : 'w-full'} bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col h-full`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Problem Input</h2>
              <div className="flex gap-2">
                {selectedImage && (
                  <button 
                    onClick={removeImage}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Clear
                  </button>
                )}
                {!selectedImage && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      ref={fileInputRef}
                      id="screenshot-upload"
                    />
                    <label
                      htmlFor="screenshot-upload"
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Camera size={14} /> Upload Image
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Type your math question here (e.g. Solve for x: 3x + 5 = 11)..."
                className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-lg resize-none placeholder:text-slate-300"
              />

              {selectedImage && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-100 h-40">
                  <img 
                    src={selectedImage} 
                    alt="Problem screenshot" 
                    className="w-full h-full object-contain bg-slate-50" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <button
                onClick={solveProblem}
                disabled={isSolving || (!problemText && !selectedImage)}
                className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  isSolving || (!problemText && !selectedImage)
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                }`}
              >
                {isSolving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Solve with AI
                  </>
                )}
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2"
              >
                <X size={16} className="mt-0.5" />
                {error}
              </motion.div>
            )}
          </section>

          {/* Results Bento Content - Only show when solution exists */}
          {solution && (
            <>
              {/* Final Answer - Bento Card 2 */}
              <motion.section 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-4 bg-blue-600 rounded-3xl text-white p-8 shadow-xl shadow-blue-100 flex flex-col justify-center items-center text-center relative overflow-hidden"
              >
                <CheckCircle2 className="absolute -right-6 -top-6 w-32 h-32 text-white/10" />
                <h2 className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-4">Final Solution</h2>
                <div className="text-3xl font-bold font-math mb-4 leading-tight">
                  {solution.answer}
                </div>
                <div className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                  Verified Analysis
                </div>
              </motion.section>

              {/* Step-by-Step - Bento Card 3 */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookOpen size={18} />
                  </div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Step-by-Step Breakdown</h2>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                       <Sparkles size={14} className="text-blue-500" />
                       Problem Context
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed italic">{solution.understoodProblem}</p>
                  </div>

                  <div className="space-y-4">
                    {solution.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 text-sm">{step.title}</h4>
                          <p className="text-sm text-slate-500 leading-relaxed">{step.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <div className="mt-0.5 text-amber-500">
                    <ChevronRight size={18} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Tutor Insight</p>
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                      {solution.explanation}
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* Mastery Card - Bento Card 4 */}
              <motion.section 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-4 bg-slate-800 rounded-3xl p-8 text-white flex flex-col h-full"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-slate-700 text-blue-400 rounded-lg flex items-center justify-center">
                    <BrainCircuit size={18} />
                  </div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest opacity-50">Mastery Path</h2>
                </div>
                
                <p className="text-sm text-slate-300 mb-6 italic leading-relaxed">
                  "Mastery comes not from answers, but from the curiosity to solve more."
                </p>

                <div className="space-y-3 flex-1">
                  {solution.helpingQuestions.map((q, idx) => (
                    <div key={idx} className="w-full text-left p-4 rounded-2xl bg-slate-700/50 hover:bg-slate-700 border border-slate-700 transition-all group cursor-default">
                      <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Challenge {idx + 1}</span>
                      <p className="text-sm font-semibold mb-2 leading-snug">{q.question}</p>
                      <details className="group/details">
                        <summary className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 cursor-pointer list-none flex items-center gap-1 hover:text-white transition-colors">
                          <ArrowRight size={10} className="group-open/details:rotate-90 transition-transform" />
                          View Hint
                        </summary>
                        <p className="mt-2 text-xs text-slate-300 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 italic">
                          {q.hint}
                        </p>
                      </details>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase opacity-50 block font-bold tracking-widest">Growth Progress</span>
                    <span className="text-lg font-bold font-display">60% Mastered</span>
                  </div>
                  <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-[spin_3s_linear_infinite]" />
                </div>
              </motion.section>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <BrainCircuit size={20} className="text-slate-900" />
            <span className="font-bold text-slate-900 tracking-tight">AI <span className="text-blue-600">maths buddy</span></span>
          </div>
          <p className="text-sm text-slate-400 font-medium">Powered by Gemini-3.1-Pro • Professional Educational Suite</p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 hover:text-blue-600 transition-colors cursor-pointer">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

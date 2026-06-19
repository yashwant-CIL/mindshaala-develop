import { Rocket, Clock, ArrowLeft, Construction, Star, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface ComingSoonProps {
    title?: string;
    description?: string;
    onBack: () => void;
}

export function ComingSoon({ 
    title = "Feature Coming Soon", 
    description = "We're working hard to bring you this amazing new feature. Stay tuned for updates!", 
    onBack 
}: ComingSoonProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in fade-in duration-700">
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative bg-white p-8 rounded-[40px] shadow-2xl shadow-indigo-100 border border-indigo-50 transform hover:scale-105 transition-transform duration-500">
                    <div className="flex items-center justify-center w-24 h-24 bg-indigo-50 rounded-3xl mb-0 mx-auto group">
                        <Rocket className="w-12 h-12 text-indigo-600 group-hover:animate-bounce transition-all" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12">
                        <Clock className="w-6 h-6 text-purple-500" />
                    </div>
                </div>
            </div>

            <div className="max-w-md space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                    <Construction className="w-3.5 h-3.5" />
                    Under Construction
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    {title}
                </h1>
                
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                    {description}
                </p>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button 
                        onClick={onBack}
                        variant="outline"
                        className="h-14 px-8 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 font-bold transition-all text-base flex items-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </Button>
                    <Button 
                        className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xl shadow-indigo-200 text-base"
                        onClick={onBack}
                    >
                        Explore Other Features
                    </Button>
                </div>
            </div>

            <div className="mt-20 flex items-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                 <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-600">Premium Experience</span>
                 </div>
                 <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                 <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                    <span className="font-bold text-slate-600">AI Powered</span>
                 </div>
            </div>
        </div>
    );
}

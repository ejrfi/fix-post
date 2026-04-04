import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, Lock, User, ArrowRight, Zap, ShieldCheck, BarChart3, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Nama pengguna wajib diisi"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    try {
      await login(data);
      setLocation("/pos");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: "Kredensial yang Anda masukkan tidak valid.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white text-slate-900 relative overflow-hidden font-sans selection:bg-primary/10">
      
      {/* LEFT COLUMN: Login Form - Very Minimalist & Clean */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 relative bg-white z-20 order-2 lg:order-1">
        <div className="w-full max-w-[400px] space-y-10">
          
          <div className="space-y-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <img src="/logo-.svg" alt="Logo" className="h-16 w-auto mb-8 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer" />
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Login.</h1>
              <p className="text-slate-500 font-medium text-lg">Kelola operasional bisnis Anda dengan lebih efisien.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Username</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-4.5 w-4.5 text-slate-300 group-focus-within:text-slate-900 transition-colors duration-300" />
                          </div>
                          <Input 
                            className="pl-11 h-12 bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-0 transition-all duration-300 font-medium" 
                            placeholder="Username Anda"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <div className="flex justify-between items-center ml-1">
                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Password</FormLabel>
                        <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-wider">Lupa?</a>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-4.5 w-4.5 text-slate-300 group-focus-within:text-slate-900 transition-colors duration-300" />
                          </div>
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            className="pl-11 pr-11 h-12 bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-0 transition-all duration-300 font-medium" 
                            placeholder="Kata Sandi"
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-900 transition-colors focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-sm font-black tracking-widest uppercase rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group mt-6" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" /> 
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Lanjutkan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </div>
          
          <div className="pt-10 animate-in fade-in duration-1000 delay-500">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-8 h-[1px] bg-slate-100" />
              &copy; {new Date().getFullYear()} G-Jarfy POS
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Modern Branding - Soft, Professional, Minimalist */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 relative bg-[#f8fafc] overflow-hidden order-1 lg:order-2">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] bg-slate-200/30 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] bg-indigo-50/50 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-lg text-center space-y-12 animate-in zoom-in-95 duration-1000">
          <div className="relative inline-block">
             <div className="absolute -inset-4 bg-white/40 rounded-full blur-2xl -z-10" />
             <img 
               src="/logo-.svg" 
               alt="Logo" 
               className="h-40 w-auto mx-auto drop-shadow-sm opacity-90 hover:opacity-100 transition-opacity duration-500" 
             />
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-100 text-slate-400 shadow-sm">
              <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
              <span className="text-[9px] font-black tracking-[0.2em] uppercase">Enterprise Management</span>
            </div>
            
            <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-900">
              Modern.<br />
              Sederhana.<br />
              <span className="text-slate-300">Terintegrasi.</span>
            </h2>
            
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[320px] mx-auto uppercase tracking-wide">
              Solusi POS cerdas untuk bisnis yang terus berkembang di era digital.
            </p>

            <div className="flex items-center justify-center gap-8 pt-8 opacity-50 grayscale">
               <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-5 h-5 text-slate-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Secure</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                  <Zap className="w-5 h-5 text-slate-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Fast</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Insight</span>
               </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

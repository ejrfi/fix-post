import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";

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

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 font-sans selection:bg-cyan-500/30">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background Gradients matching Sidebar (Cyan to Green) */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-green-500/10 rounded-full blur-[120px]" />
        
        {/* Repeating Logo Pattern with low transparency */}
        <div 
          className="absolute inset-0 opacity-[0.03] invert brightness-0"
          style={{ 
            backgroundImage: `url('/logo-.svg')`,
            backgroundSize: '80px 80px',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[450px]"
      >
        <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 sm:p-12">
            <div className="flex flex-col items-center text-center mb-10">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-green-500/20 rounded-3xl flex items-center justify-center mb-6 border border-cyan-500/20"
              >
                <img src="/logo-.svg" alt="Logo" className="h-10 w-auto invert brightness-0" />
              </motion.div>
              <h1 className="text-3xl font-black tracking-tight text-white mb-2">Selamat Datang.</h1>
              <p className="text-slate-400 font-medium text-sm uppercase tracking-[0.2em]">Sistem POS Terintegrasi</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identitas Pengguna</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
                          </div>
                          <Input 
                            className="pl-11 h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-2xl focus:bg-white/10 focus:border-cyan-500/50 focus:ring-0 transition-all duration-300 font-bold" 
                            placeholder="Username"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Kata Sandi</FormLabel>
                        <a href="#" className="text-[10px] font-black text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest">Lupa?</a>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
                          </div>
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            className="pl-11 pr-11 h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-2xl focus:bg-white/10 focus:border-cyan-500/50 focus:ring-0 transition-all duration-300 font-bold" 
                            placeholder="Password"
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-14 text-xs font-black tracking-[0.2em] uppercase rounded-2xl bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300 group mt-4 border-none" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" /> 
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Masuk ke Sistem <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-10 flex items-center justify-center gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
               <ShieldCheck className="w-5 h-5 text-white" />
               <Zap className="w-5 h-5 text-white" />
               <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </CardContent>
        </Card>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]"
        >
          &copy; {new Date().getFullYear()} G-Jarfy POS • V1.0
        </motion.p>
      </motion.div>
    </div>
  );
}

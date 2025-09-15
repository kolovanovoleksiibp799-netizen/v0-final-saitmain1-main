import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Users, Shield, Star, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';
import { useBuggyEffect } from '@/contexts/BuggyEffectContext'; // Import useBuggyEffect
import GlitchText from './GlitchText'; // Import GlitchText

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Введіть пошуковий запит');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select(`
          *,
          users (nickname, role)
        `)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order('is_vip', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Для демонстрації показуємо кількість знайдених результатів
      toast.success(`Знайдено ${data?.length || 0} оголошень`);
      
      // В реальній реалізації тут би був перехід на сторінку результатів пошуку
      console.log('Search results:', data);
    } catch (error: any) {
      toast.error('Помилка пошуку: ' + error.message);
    }
  };

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background-secondary to-background ${isBuggyMode ? 'animate-pulse-slow' : ''}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          initial={{ x: -200, y: -200, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 0.2 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary rounded-full blur-3xl ${isBuggyMode ? 'animate-spin-slow' : ''}`}
        ></motion.div>
        <motion.div 
          initial={{ x: 200, y: 200, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 0.2 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-accent rounded-full blur-3xl ${isBuggyMode ? 'animate-spin-reverse' : ''}`}
        ></motion.div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GlitchText intensity={isBuggyMode ? 1 : 0}>Ласкаво просимо до{' '}</GlitchText>
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              <GlitchText intensity={isBuggyMode ? 1 : 0}>Skoropad</GlitchText>
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Найкраща платформа для розміщення та пошуку оголошень в Україні</GlitchText>
          </motion.p>

          {/* Search Bar */}
          <motion.div
            className="max-w-lg mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <form onSubmit={handleSearch} className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10 ${isBuggyMode ? 'animate-flicker' : ''}`} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук оголошень..."
                className={`pl-12 py-6 text-lg border-0 bg-white/10 dark:bg-background-secondary/50 backdrop-blur-sm rounded-2xl interactive-liquid glow-breathing ${isBuggyMode ? 'animate-pulse border-red-500' : ''}`}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Button
                  type="submit"
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 btn-accent hover:shadow-glow hover:translate-y-0 ${isBuggyMode ? 'animate-button-flicker' : ''}`}
                >
                  <GlitchText intensity={isBuggyMode ? 0.8 : 0}>Пошук</GlitchText>
                </Button>
              </motion.div>
            </form>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link to="/create-ad">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Button 
                  size="lg" 
                  className={`btn-accent rounded-2xl px-8 py-6 text-lg hover:shadow-glow glow-on-hover ${isBuggyMode ? 'animate-button-flicker' : ''}`}
                >
                  <GlitchText intensity={isBuggyMode ? 0.8 : 0}>Створити оголошення</GlitchText>
                </Button>
              </motion.div>
            </Link>
            <Link to="/categories">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={`rounded-2xl px-8 py-6 text-lg border-accent/20 hover:border-accent hover:bg-accent/5 glow-on-hover ${isBuggyMode ? 'animate-card-wobble' : ''}`}
                >
                  <GlitchText intensity={isBuggyMode ? 0.6 : 0}>Переглянути каталог</GlitchText>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.3 }} className={`text-center ${isBuggyMode ? 'rotate-[1deg] scale-[1.01] transition-all duration-100' : ''}`}>
              <TrendingUp className={`w-8 h-8 mx-auto mb-2 text-accent ${isBuggyMode ? 'animate-spin-slow' : ''}`} />
              <div className="text-2xl font-bold"><GlitchText intensity={isBuggyMode ? 0.9 : 0}>1000+</GlitchText></div>
              <div className="text-sm text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Оголошень</GlitchText></div>
            </motion.div>
            <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.3 }} className={`text-center ${isBuggyMode ? 'rotate-[-1deg] scale-[0.99] transition-all duration-100' : ''}`}>
              <Users className={`w-8 h-8 mx-auto mb-2 text-accent ${isBuggyMode ? 'animate-spin-reverse' : ''}`} />
              <div className="text-2xl font-bold"><GlitchText intensity={isBuggyMode ? 0.9 : 0}>500+</GlitchText></div>
              <div className="text-sm text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Користувачів</GlitchText></div>
            </motion.div>
            <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.3 }} className={`text-center ${isBuggyMode ? 'rotate-[0.5deg] scale-[1.005] transition-all duration-100' : ''}`}>
              <Shield className={`w-8 h-8 mx-auto mb-2 text-accent ${isBuggyMode ? 'animate-flicker' : ''}`} />
              <div className="text-2xl font-bold"><GlitchText intensity={isBuggyMode ? 0.9 : 0}>100%</GlitchText></div>
              <div className="text-sm text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Безпека</GlitchText></div>
            </motion.div>
            <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.3 }} className={`text-center ${isBuggyMode ? 'rotate-[-0.5deg] scale-[0.995] transition-all duration-100' : ''}`}>
              <Star className={`w-8 h-8 mx-auto mb-2 text-accent ${isBuggyMode ? 'animate-spin-fast' : ''}`} />
              <div className="text-2xl font-bold"><GlitchText intensity={isBuggyMode ? 0.9 : 0}>24/7</GlitchText></div>
              <div className="text-sm text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Підтримка</GlitchText></div>
            </motion.div>
          </motion.div>

          {/* VIP Banner */}
          <motion.div
            className={`mt-16 p-6 bg-gradient-accent rounded-3xl border border-accent/20 shadow-soft-lg ${isBuggyMode ? 'animate-card-wobble' : ''}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            whileHover={{ y: -5, boxShadow: "0 25px 70px -15px hsl(var(--accent) / 0.4)" }}
          >
            <h3 className="text-xl font-bold mb-2 text-accent-foreground">
              <GlitchText intensity={isBuggyMode ? 0.8 : 0}>Хочете виділити своє оголошення?</GlitchText>
            </h3>
            <p className="text-accent-foreground/80 mb-4">
              <GlitchText intensity={isBuggyMode ? 0.6 : 0}>Отримайте VIP статус та ваші оголошення завжди будуть зверху!</GlitchText>
            </p>
            <p className="text-sm text-accent-foreground/60">
              <GlitchText intensity={isBuggyMode ? 0.5 : 0}>Для купівлі VIP статусу напишіть у телеграм: <strong>@TheDuma</strong></GlitchText>
            </p>
          </motion.div>

          {user && hasPermission(user, ['admin']) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="mt-8"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              <Link to="/admin">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={`rounded-2xl px-8 py-6 text-lg border-red-500/20 hover:border-red-500 text-red-600 hover:text-red-500 hover:bg-red-500/5 glow-on-hover ${isBuggyMode ? 'animate-button-flicker' : ''}`}
                >
                  <Settings className="w-5 h-5 mr-2" />
                  <GlitchText intensity={isBuggyMode ? 0.8 : 0}>Адмін панель</GlitchText>
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
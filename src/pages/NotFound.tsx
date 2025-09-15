import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBuggyEffect } from "@/contexts/BuggyEffectContext"; // Import useBuggyEffect
import GlitchText from "@/components/GlitchText"; // Import GlitchText

const NotFound = () => {
  const location = useLocation();
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className={`pt-24 pb-16 ${isBuggyMode ? 'animate-global-glitch' : ''}`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="mb-8">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                <GlitchText intensity={isBuggyMode ? 1 : 0}>404</GlitchText>
              </h1>
              <h2 className="text-2xl font-bold mb-4"><GlitchText intensity={isBuggyMode ? 0.8 : 0}>Сторінка не знайдена</GlitchText></h2>
              <p className="text-muted-foreground mb-8">
                <GlitchText intensity={isBuggyMode ? 0.6 : 0}>Вибачте, але сторінка яку ви шукаете не існує або була переміщена.</GlitchText>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className={`btn-accent rounded-2xl hover:scale-105 transition-transform ${isBuggyMode ? 'animate-button-flicker' : ''}`}
              >
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  <GlitchText intensity={isBuggyMode ? 0.8 : 0}>На головну</GlitchText>
                </Link>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className={`rounded-2xl hover:scale-105 transition-transform ${isBuggyMode ? 'animate-card-wobble' : ''}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <GlitchText intensity={isBuggyMode ? 0.6 : 0}>Назад</GlitchText>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default NotFound;
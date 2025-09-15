import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useBuggyEffect } from "@/contexts/BuggyEffectContext"; // Import useBuggyEffect
import GlitchText from "@/components/GlitchText"; // Import GlitchText

const TermsOfServicePage = () => {
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className={`pt-24 pb-16 ${isBuggyMode ? 'animate-global-glitch' : ''}`}>
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className={`mb-6 glow-on-hover ${isBuggyMode ? 'animate-card-wobble' : ''}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <GlitchText intensity={isBuggyMode ? 0.6 : 0}>Назад</GlitchText>
              </Button>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold mb-8">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                <GlitchText intensity={isBuggyMode ? 0.9 : 0}>Умови користування</GlitchText>
              </span>
            </h1>

            <div className={`prose dark:prose-invert max-w-none text-muted-foreground ${isBuggyMode ? 'animate-global-glitch' : ''}`}>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ласкаво просимо до Skoropad! Ці Умови користування регулюють ваше використання нашого веб-сайту та послуг. Користуючись нашим сервісом, ви погоджуєтеся з цими умовами.</GlitchText>
              </p>

              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>1. Прийняття Умов</GlitchText></h2>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Користуючись веб-сайтом Skoropad, ви підтверджуєте, що прочитали, зрозуміли та погоджуєтеся дотримуватися цих Умов користування. Якщо ви не згодні з будь-якою частиною цих умов, ви не повинні використовувати наш сервіс.</GlitchText>
              </p>

              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>2. Реєстрація облікового запису</GlitchText></h2>
              <ul>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Ви повинні бути повнолітнім, щоб зареєструвати обліковий запис.</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Ви несете відповідальність за збереження конфіденційності вашого пароля та за всі дії, що відбуваються під вашим обліковим записом.</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Ви погоджуєтеся надавати точну та повну інформацію під час реєстрації.</GlitchText></li>
              </ul>

              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>3. Правила розміщення оголошень</GlitchText></h2>
              <ul>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Всі оголошення повинні відповідати чинному законодавству України.</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Заборонено розміщувати оголошення, що містять незаконний, образливий, дискримінаційний або шахрайський контент.</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Ви несете повну відповідальність за зміст ваших оголошень.</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Skoropad залишає за собою право видаляти або редагувати оголошення, які порушують ці умови, без попереднього повідомлення.</GlitchText></li>
              </ul>

              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>4. Інтелектуальна власність</GlitchText></h2>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Весь контент на веб-сайті Skoropad, включаючи текст, графіку, логотипи, зображення та програмне забезпечення, є власністю Skoropad або його ліцензіарів і захищений законами про авторське право.</GlitchText>
              </p>

              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>5. Обмеження відповідальності</GlitchText></h2>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Skoropad не несе відповідальності за будь-які прямі, непрямі, випадкові, спеціальні або наслідкові збитки, що виникли в результаті використання або неможливості використання нашого сервісу.</GlitchText>
              </p>

              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>6. Зміни до Умов користування</GlitchText></h2>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ми залишаємо за собою право змінювати ці Умови користування в будь-який час. Зміни набувають чинності негайно після їх публікації на цій сторінці. Ваше подальше використання сервісу після таких змін означає вашу згоду з оновленими умовами.</GlitchText>
              </p>

              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>7. Контактна інформація</GlitchText></h2>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Якщо у вас є питання щодо цих Умов користування, будь ласка, зв'яжіться з нами за адресою info@skoropad.ua.</GlitchText>
              </p>

              <p className="mt-8 text-sm">
                <GlitchText intensity={isBuggyMode ? 0.5 : 0}>Остання редакція: 2024-09-12</GlitchText>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
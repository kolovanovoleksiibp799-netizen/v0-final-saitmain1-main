import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useBuggyEffect } from "@/contexts/BuggyEffectContext"; // Import useBuggyEffect
import GlitchText from "@/components/GlitchText"; // Import GlitchText

const PrivacyPolicyPage = () => {
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
                <GlitchText intensity={isBuggyMode ? 0.9 : 0}>Політика конфіденційності</GlitchText>
              </span>
            </h1>

            <div className={`prose dark:prose-invert max-w-none text-muted-foreground ${isBuggyMode ? 'animate-global-glitch' : ''}`}>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ця Політика конфіденційності описує, як Skoropad збирає, використовує та розкриває вашу особисту інформацію, коли ви користуєтеся нашим веб-сайтом.</GlitchText>
              </p>
              
              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>1. Збір інформації</GlitchText></h2>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ми збираємо інформацію, яку ви надаєте нам безпосередньо, коли ви реєструєте обліковий запис, створюєте оголошення, надсилаєте повідомлення або іншим чином взаємодієте з нашим сервісом. Це може включати:</GlitchText>
              </p>
              <ul>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Ваш нікнейм</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Контактні дані (наприклад, Discord, Telegram), які ви вказуєте в оголошеннях</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Інформацію про ваші оголошення (назва, опис, зображення, ціна, категорія)</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Повідомлення, які ви надсилаєте іншим користувачам</GlitchText></li>
              </ul>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ми також автоматично збираємо певну інформацію, коли ви відвідуєте наш веб-сайт, включаючи вашу IP-адресу, тип браузера, операційну систему, сторінки, які ви переглядали, та час доступу.</GlitchText>
              </p>

              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>2. Використання інформації</GlitchText></h2>
              <p><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ми використовуємо зібрану інформацію для:</GlitchText></p>
              <ul>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Надання та підтримки наших послуг</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Обробки ваших оголошень та повідомлень</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Персоналізації вашого досвіду на сайті</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Покращення нашого веб-сайту та послуг</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Забезпечення безпеки та запобігання шахрайству</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Зв'язку з вами щодо оновлень, пропозицій або важливих повідомлень</GlitchText></li>
              </ul>

              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>3. Розкриття інформації</GlitchText></h2>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ми не продаємо та не передаємо вашу особисту інформацію третім особам, за винятком випадків, передбачених цією Політикою конфіденційності або чинним законодавством. Ми можемо розкривати інформацію:</GlitchText>
              </p>
              <ul>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Іншим користувачам, коли ви публікуєте оголошення (наприклад, ваш нікнейм та контактні дані, які ви вказали)</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Постачальникам послуг, які допомагають нам у роботі веб-сайту (наприклад, хостинг, аналітика)</GlitchText></li>
                <li><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Правоохоронним органам або іншим державним установам, якщо це вимагається законом</GlitchText></li>
              </ul>

              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>4. Безпека даних</GlitchText></h2>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ми вживаємо розумних заходів для захисту вашої особистої інформації від несанкціонованого доступу, використання або розкриття. Однак жоден метод передачі даних через Інтернет або метод електронного зберігання не є на 100% безпечним.</GlitchText>
              </p>

              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>5. Ваші права</GlitchText></h2>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ви маєте право на доступ, виправлення або видалення вашої особистої інформації. Для цього, будь ласка, зв'яжіться з нами за адресою info@skoropad.ua.</GlitchText>
              </p>

              <h2><GlitchText intensity={isBuggyMode ? 0.8 : 0}>6. Зміни до Політики конфіденційності</GlitchText></h2>
              <p>
                <GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ми можемо час від часу оновлювати цю Політику конфіденційності. Будь-які зміни будуть опубліковані на цій сторінці. Рекомендуємо періодично переглядати цю сторінку для отримання актуальної інформації.</GlitchText>
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

export default PrivacyPolicyPage;
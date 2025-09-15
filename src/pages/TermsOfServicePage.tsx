import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-16">
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
                className="mb-6 glow-on-hover"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold mb-8">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Умови користування</span>
            </h1>

            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
              <p>
                Ласкаво просимо до Skoropad! Ці Умови користування регулюють ваше використання нашого веб-сайту та послуг. Користуючись нашим сервісом, ви погоджуєтеся з цими умовами.
              </p>

              <h2>1. Прийняття Умов</h2>
              <p>
                Користуючись веб-сайтом Skoropad, ви підтверджуєте, що прочитали, зрозуміли та погоджуєтеся дотримуватися цих Умов користування. Якщо ви не згодні з будь-якою частиною цих умов, ви не повинні використовувати наш сервіс.
              </p>

              <h2>2. Реєстрація облікового запису</h2>
              <ul>
                <li>Ви повинні бути повнолітнім, щоб зареєструвати обліковий запис.</li>
                <li>Ви несете відповідальність за збереження конфіденційності вашого пароля та за всі дії, що відбуваються під вашим обліковим записом.</li>
                <li>Ви погоджуєтеся надавати точну та повну інформацію під час реєстрації.</li>
              </ul>

              <h2>3. Правила розміщення оголошень</h2>
              <ul>
                <li>Всі оголошення повинні відповідати чинному законодавству України.</li>
                <li>Заборонено розміщувати оголошення, що містять незаконний, образливий, дискримінаційний або шахрайський контент.</li>
                <li>Ви несете повну відповідальність за зміст ваших оголошень.</li>
                <li>Skoropad залишає за собою право видаляти або редагувати оголошення, які порушують ці умови, без попереднього повідомлення.</li>
              </ul>

              <h2>4. Інтелектуальна власність</h2>
              <p>
                Весь контент на веб-сайті Skoropad, включаючи текст, графіку, логотипи, зображення та програмне забезпечення, є власністю Skoropad або його ліцензіарів і захищений законами про авторське право.
              </p>

              <h2>5. Обмеження відповідальності</h2>
              <p>
                Skoropad не несе відповідальності за будь-які прямі, непрямі, випадкові, спеціальні або наслідкові збитки, що виникли в результаті використання або неможливості використання нашого сервісу.
              </p>

              <h2>6. Зміни до Умов користування</h2>
              <p>
                Ми залишаємо за собою право змінювати ці Умови користування в будь-який час. Зміни набувають чинності негайно після їх публікації на цій сторінці. Ваше подальше використання сервісу після таких змін означає вашу згоду з оновленими умовами.
              </p>

              <h2>7. Контактна інформація</h2>
              <p>
                Якщо у вас є питання щодо цих Умов користування, будь ласка, зв'яжіться з нами за адресою info@skoropad.ua.
              </p>

              <p className="mt-8 text-sm">
                Остання редакція: 2024-09-12
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
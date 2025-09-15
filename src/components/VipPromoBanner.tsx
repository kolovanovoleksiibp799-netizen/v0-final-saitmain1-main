"use client"

import { motion } from "framer-motion"
import { Crown, Star, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBuggyEffect } from "@/contexts/BuggyEffectContext" // Import useBuggyEffect
import GlitchText from "./GlitchText" // Import GlitchText

export default function VipPromoBanner() {
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <Card className={`bg-gradient-to-r from-yellow-400/10 via-yellow-500/10 to-yellow-600/10 border-yellow-500/20 overflow-hidden relative ${isBuggyMode ? 'animate-card-wobble' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-yellow-600/5 animate-pulse" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                className={`p-3 bg-yellow-500/20 rounded-full ${isBuggyMode ? 'animate-spin-slow' : ''}`}
              >
                <Crown className="w-8 h-8 text-yellow-500" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1"><GlitchText intensity={isBuggyMode ? 0.8 : 0}>Хочете виділити своє оголошення?</GlitchText></h3>
                <p className="text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Отримайте VIP статус та ваші оголошення завжди будуть зверху!</GlitchText></p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className={`w-5 h-5 text-yellow-500 mr-1 ${isBuggyMode ? 'animate-flicker' : ''}`} />
                  <span className="font-semibold"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Пріоритет</GlitchText></span>
                </div>
                <p className="text-sm text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.5 : 0}>Завжди зверху</GlitchText></p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className={`w-5 h-5 text-yellow-500 mr-1 ${isBuggyMode ? 'animate-flicker' : ''}`} />
                  <span className="font-semibold"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Більше переглядів</GlitchText></span>
                </div>
                <p className="text-sm text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.5 : 0}>До 5x більше</GlitchText></p>
              </div>
              <Button className={`bg-yellow-500 hover:bg-yellow-600 text-black font-semibold ${isBuggyMode ? 'animate-button-flicker' : ''}`}><GlitchText intensity={isBuggyMode ? 0.8 : 0}>Отримати VIP</GlitchText></Button>
            </div>
          </div>
          <div className="md:hidden mt-4 text-center">
            <Button className={`bg-yellow-500 hover:bg-yellow-600 text-black font-semibold w-full ${isBuggyMode ? 'animate-button-flicker' : ''}`}>
              <GlitchText intensity={isBuggyMode ? 0.8 : 0}>Отримати VIP статус</GlitchText>
            </Button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              <GlitchText intensity={isBuggyMode ? 0.5 : 0}>Для купівлі VIP статусу напишіть у телеграм:{" "}
              <a href="https://t.me/TheDuma" className={`text-yellow-500 font-medium hover:underline ${isBuggyMode ? 'text-red-500 hover:text-green-500' : ''}`}>
                @TheDuma
              </a></GlitchText>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
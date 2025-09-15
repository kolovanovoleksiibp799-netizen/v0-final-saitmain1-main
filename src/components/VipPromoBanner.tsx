"use client"

import { motion } from "framer-motion"
import { Crown, Star, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VipPromoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-r from-yellow-400/10 via-yellow-500/10 to-yellow-600/10 border-yellow-500/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-yellow-600/5 animate-pulse" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                className="p-3 bg-yellow-500/20 rounded-full"
              >
                <Crown className="w-8 h-8 text-yellow-500" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Хочете виділити своє оголошення?</h3>
                <p className="text-muted-foreground">Отримайте VIP статус та ваші оголошення завжди будуть зверху!</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="font-semibold">Пріоритет</span>
                </div>
                <p className="text-sm text-muted-foreground">Завжди зверху</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="font-semibold">Більше переглядів</span>
                </div>
                <p className="text-sm text-muted-foreground">До 5x більше</p>
              </div>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">Отримати VIP</Button>
            </div>
          </div>
          <div className="md:hidden mt-4 text-center">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold w-full">
              Отримати VIP статус
            </Button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Для купівлі VIP статусу напишіть у телеграм:{" "}
              <a href="https://t.me/TheDuma" className="text-yellow-500 font-medium hover:underline">
                @TheDuma
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import Footer from "@/components/Footer"
import { supabase } from "@/integrations/supabase/client"
import { Users, FileText, Star, TrendingUp } from "lucide-react"
import ProductCard from "@/components/ProductCard"
import { toast } from "sonner" // Corrected import to sonner
import type { Database } from "@/integrations/supabase/types"
import LiquidGrassBackground from "@/components/LiquidGrassBackground"
import FloatingParticles from "@/components/FloatingParticles"
import { useBuggyEffect } from "@/contexts/BuggyEffectContext" // Import useBuggyEffect
import GlitchText from "@/components/GlitchText" // Import GlitchText

type Advertisement = Database["public"]["Tables"]["advertisements"]["Row"] & {
  users?: { nickname: string; role: string } | null
}

const Index = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAds: 0,
    vipAds: 0,
    recentAds: 0,
  })
  const [popularAds, setPopularAds] = useState<Advertisement[]>([])
  const [popularAdsLoading, setPopularAdsLoading] = useState(true)
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  useEffect(() => {
    fetchStats()
    fetchPopularAds()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true })

      // Fetch total ads count
      const { count: adsCount } = await supabase.from("advertisements").select("*", { count: "exact", head: true })

      // Fetch VIP ads count
      const { count: vipCount } = await supabase
        .from("advertisements")
        .select("*", { count: "exact", head: true })
        .eq("is_vip", true)

      // Fetch recent ads (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { count: recentCount } = await supabase
        .from("advertisements")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString())

      setStats({
        totalUsers: usersCount || 0,
        totalAds: adsCount || 0,
        vipAds: vipCount || 0,
        recentAds: recentCount || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchPopularAds = async () => {
    try {
      setPopularAdsLoading(true)
      const { data, error } = await supabase
        .from("advertisements")
        .select(`
          *,
          users (nickname, role)
        `)
        .order("is_vip", { ascending: false }) // Prioritize VIP ads
        .order("created_at", { ascending: false }) // Then by newest
        .limit(8) // Fetch a reasonable number for the home page

      if (error) throw error

      setPopularAds(data || [])
    } catch (error: any) {
      toast.error("Помилка завантаження популярних оголошень: " + error.message)
    } finally {
      setPopularAdsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <LiquidGrassBackground />
      <FloatingParticles />

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <Hero />

        {/* About Section */}
        <section className={`py-16 bg-background-secondary/80 backdrop-blur-sm ${isBuggyMode ? 'animate-global-glitch' : ''}`}>
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <GlitchText intensity={isBuggyMode ? 0.8 : 0}>Про </GlitchText>
                <span className="bg-gradient-primary bg-clip-text text-transparent glow-text">
                  <GlitchText intensity={isBuggyMode ? 0.8 : 0}>Skoropad</GlitchText>
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                <GlitchText intensity={isBuggyMode ? 0.6 : 0}>Ваш надійний партнер у світі онлайн оголошень та торгівлі</GlitchText>
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border/50 hover:shadow-soft-lg hover:border-accent/20 transition-all duration-300 transform-gpu glow-card ${isBuggyMode ? 'animate-card-wobble' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className={`w-8 h-8 text-accent glow-icon ${isBuggyMode ? 'animate-spin-slow' : ''}`} />
                  <div className="text-2xl font-bold"><GlitchText intensity={isBuggyMode ? 0.9 : 0}>{stats.totalUsers}</GlitchText></div>
                </div>
                <h3 className="text-lg font-semibold mb-2"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Користувачі</GlitchText></h3>
                <p className="text-muted-foreground text-sm"><GlitchText intensity={isBuggyMode ? 0.5 : 0}>Зареєстровані користувачі</GlitchText></p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border/50 hover:shadow-soft-lg hover:border-accent/20 transition-all duration-300 transform-gpu glow-card ${isBuggyMode ? 'animate-card-wobble' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <FileText className={`w-8 h-8 text-primary glow-icon ${isBuggyMode ? 'animate-spin-reverse' : ''}`} />
                  <div className="text-2xl font-bold"><GlitchText intensity={isBuggyMode ? 0.9 : 0}>{stats.totalAds}</GlitchText></div>
                </div>
                <h3 className="text-lg font-semibold mb-2"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Оголошення</GlitchText></h3>
                <p className="text-muted-foreground text-sm"><GlitchText intensity={isBuggyMode ? 0.5 : 0}>Всього оголошень</GlitchText></p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border/50 hover:shadow-soft-lg hover:border-accent/20 transition-all duration-300 transform-gpu glow-card ${isBuggyMode ? 'animate-card-wobble' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Star className={`w-8 h-8 text-yellow-500 glow-icon ${isBuggyMode ? 'animate-flicker' : ''}`} />
                  <div className="text-2xl font-bold"><GlitchText intensity={isBuggyMode ? 0.9 : 0}>{stats.vipAds}</GlitchText></div>
                </div>
                <h3 className="text-lg font-semibold mb-2"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>VIP оголошення</GlitchText></h3>
                <p className="text-muted-foreground text-sm"><GlitchText intensity={isBuggyMode ? 0.5 : 0}>Преміум оголошення</GlitchText></p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border/50 hover:shadow-soft-lg hover:border-accent/20 transition-all duration-300 transform-gpu glow-card ${isBuggyMode ? 'animate-card-wobble' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className={`w-8 h-8 text-green-500 glow-icon ${isBuggyMode ? 'animate-spin-fast' : ''}`} />
                  <div className="text-2xl font-bold"><GlitchText intensity={isBuggyMode ? 0.9 : 0}>{stats.recentAds}</GlitchText></div>
                </div>
                <h3 className="text-lg font-semibold mb-2"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>За тиждень</GlitchText></h3>
                <p className="text-muted-foreground text-sm"><GlitchText intensity={isBuggyMode ? 0.5 : 0}>Нових оголошень</GlitchText></p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className={`py-16 bg-background/80 backdrop-blur-sm ${isBuggyMode ? 'animate-global-glitch' : ''}`}>
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <GlitchText intensity={isBuggyMode ? 0.8 : 0}>Популярні </GlitchText>
                <span className="bg-gradient-accent bg-clip-text text-transparent glow-text">
                  <GlitchText intensity={isBuggyMode ? 0.8 : 0}>оголошення</GlitchText>
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                <GlitchText intensity={isBuggyMode ? 0.6 : 0}>Ознайомтеся з нашими найкращими пропозиціями</GlitchText>
              </p>
            </motion.div>

            {popularAdsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className={`bg-background-secondary/80 backdrop-blur-sm rounded-3xl h-80 w-full glow-card ${isBuggyMode ? 'animate-card-wobble' : ''}`}></div>
                  </div>
                ))}
              </div>
            ) : popularAds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {popularAds.map((ad, index) => (
                  <ProductCard
                    key={ad.id}
                    id={ad.id}
                    title={ad.title} // Changed from name to title
                    description={ad.description}
                    price={ad.price || 0}
                    images={ad.images} // Pass images array
                    is_vip={ad.is_vip || false} // Pass is_vip
                    views_count={ad.views_count || 0} // Pass views_count
                    location={ad.location || ''} // Pass location
                    created_at={ad.created_at} // Pass created_at
                    users={ad.users} // Pass users
                    condition={ad.condition || ''} // Pass condition
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <h3 className="text-xl font-semibold mb-2"><GlitchText intensity={isBuggyMode ? 0.8 : 0}>Поки що немає популярних оголошень</GlitchText></h3>
                <p className="text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Створіть перше оголошення, щоб воно з'явилося тут!</GlitchText></p>
              </motion.div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}

export default Index
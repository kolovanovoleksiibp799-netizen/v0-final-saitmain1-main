"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Menu, X, User, LogOut, Plus, Settings, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { logoutUser, hasPermission } from "@/lib/auth"
import AuthModal from "./AuthModal"
import { toast } from "sonner"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom"
import { useTheme } from "next-themes"
import MessagesButton from "./MessagesButton"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, setUser } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    const { error } = await logoutUser()
    if (error) {
      toast.error("Помилка виходу: " + error)
    } else {
      setUser(null)
      toast.success("Ви вийшли з акаунту")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      toast.info(`Пошук: ${searchQuery}`)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const categoriesData = [
    {
      title: "Автомобілі",
      items: [
        { title: "Продаж Автомобілі", href: "/automobiles/sale" },
        { title: "Продаж вантажівок", href: "/automobiles/trucks" },
        { title: "Продаж Вініли", href: "/automobiles/vinyls" },
        { title: "Продаж Деталі", href: "/automobiles/parts" },
        { title: "Продаж Номера", href: "/automobiles/numbers" },
        { title: "Оренда автомобіля", href: "/automobiles/car-rental" },
        { title: "Оренда вантажівок", href: "/automobiles/truck-rental" },
      ],
    },
    {
      title: "Одяг",
      items: [
        { title: "Продаж одягу", href: "/clothing/sale" },
        { title: "Продаж аксесуарів", href: "/clothing/accessories" },
        { title: "Продаж рюкзаків", href: "/clothing/backpacks" },
      ],
    },
    {
      title: "Нерухомість",
      items: [
        { title: "Продаж бізнесу", href: "/real-estate/business" },
        { title: "Продаж квартир", href: "/real-estate/apartments" },
        { title: "Продаж приватних будинків", href: "/real-estate/houses" },
        { title: "Оренда теплиць", href: "/real-estate/greenhouses" },
      ],
    },
    {
      title: "Інше",
      items: [{ title: "Різне", href: "/other/misc" }],
    },
  ]

  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.8,
      },
    },
  }

  const menuItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  }

  const mobileMenuVariants = {
    hidden: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        staggerChildren: 0.1,
      },
    },
  }

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  }

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/80 dark:bg-background/60 backdrop-blur-xl shadow-soft-lg border-b border-border/50"
          : "bg-transparent"
      }`}
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="absolute inset-0 liquid-grass-bg opacity-30 pointer-events-none" />

      <div className="container mx-auto px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.div
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer glow-text"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Skoropad
            </motion.div>
          </Link>

          {/* Desktop Search */}
          <motion.div
            className="hidden md:flex items-center flex-1 max-w-lg mx-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук оголошень..."
                className="pl-10 border-0 bg-background-secondary/70 dark:bg-background-secondary/50 backdrop-blur-sm rounded-2xl interactive-liquid"
              />
            </form>
          </motion.div>

          {/* Desktop Navigation Menu */}
          <div className="hidden lg:flex items-center gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="text-muted-foreground hover:text-foreground bg-transparent hover:bg-background-secondary/50 transition-all duration-300 rounded-lg interactive-liquid glow-on-hover"
                  >
                    Категорії
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-soft-lg z-50 overflow-hidden">
                    <ul className="grid w-[600px] gap-3 p-4 md:w-[800px] md:grid-cols-4">
                      {categoriesData.map((group) => (
                        <li key={group.title} className="row-span-3">
                          <p className="text-lg font-semibold mb-2 text-foreground">{group.title}</p>
                          <ul className="space-y-1">
                            {group.items.map((item) => (
                              <li key={item.href}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to={item.href}
                                    className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/10 hover:text-accent focus:bg-accent/10 focus:text-accent text-muted-foreground"
                                  >
                                    <div className="text-sm leading-none">{item.title}</div>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Auth Section */}
            {user ? (
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <MessagesButton />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => (window.location.href = "/create-ad")}
                    className="rounded-2xl interactive-liquid glow-emerald"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Створити оголошення
                  </Button>
                </motion.div>

                {hasPermission(user, ["admin", "moderator"]) && (
                  <Link to="/admin">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-2xl interactive-liquid glow-emerald"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Адмін панель
                      </Button>
                    </motion.div>
                  </Link>
                )}

                <motion.span
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Привіт, <span className="font-medium text-foreground glow-pulse">{user.nickname}</span>
                  {user.role !== "user" && (
                    <motion.span
                      className={`ml-1 px-2 py-1 text-xs rounded-full ${
                        user.role === "admin"
                          ? "bg-red-600 text-white"
                          : user.role === "vip"
                            ? "bg-yellow-500 text-black"
                            : "bg-accent text-accent-foreground"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                    >
                      {user.role.toUpperCase()}
                    </motion.span>
                  )}
                </motion.span>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="rounded-full interactive-liquid glow-emerald"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-accent rounded-2xl interactive-liquid glow-emerald-intense"
                >
                  <User className="w-4 h-4 mr-2" />
                  Вхід
                </Button>
              </motion.div>
            )}

            {/* Theme Toggle */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full interactive-liquid glow-emerald"
              >
                <motion.div animate={{ rotate: theme === "dark" ? 0 : 180 }} transition={{ duration: 0.5 }}>
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.div>
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            {/* Theme Toggle for Mobile */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="mr-2 rounded-full interactive-liquid glow-emerald"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                size="icon"
                className="interactive-liquid glow-emerald"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden overflow-hidden"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="pt-4 pb-2 space-y-3">
                {/* Mobile Search */}
                <motion.form onSubmit={handleSearch} className="relative" variants={mobileItemVariants}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Пошук оголошень..."
                    className="pl-10 border-0 bg-background-secondary/70 dark:bg-background-secondary/50 backdrop-blur-sm rounded-2xl interactive-liquid"
                  />
                </motion.form>

                {/* Mobile Auth */}
                {user ? (
                  <motion.div className="space-y-3" variants={mobileItemVariants}>
                    <div className="flex items-center justify-between bg-background-secondary rounded-2xl px-4 py-3 interactive-liquid glow-emerald">
                      <span className="text-sm">
                        {user.nickname}
                        {user.role !== "user" && (
                          <span
                            className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              user.role === "admin"
                                ? "bg-red-600 text-white"
                                : user.role === "vip"
                                  ? "bg-yellow-500 text-black"
                                  : "bg-accent text-accent-foreground"
                            }`}
                          >
                            {user.role.toUpperCase()}
                          </span>
                        )}
                      </span>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="glow-on-hover">
                          Вийти
                        </Button>
                      </motion.div>
                    </div>

                    <MessagesButton />

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                      <Button
                        onClick={() => {
                          setIsMenuOpen(false)
                          window.location.href = "/create-ad"
                        }}
                        className="w-full btn-accent rounded-2xl interactive-liquid glow-emerald-intense"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Створити оголошення
                      </Button>
                    </motion.div>

                    {hasPermission(user, ["admin", "moderator"]) && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            variant="outline"
                            className="w-full rounded-2xl interactive-liquid glow-emerald bg-transparent"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Адмін панель
                          </Button>
                        </motion.div>
                      </Link>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    variants={mobileItemVariants}
                  >
                    <Button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="w-full btn-accent rounded-2xl interactive-liquid glow-emerald-intense"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Вхід
                    </Button>
                  </motion.div>
                )}

                {/* Mobile Categories */}
                <motion.div className="space-y-2" variants={mobileItemVariants}>
                  {categoriesData.map((menu, index) => (
                    <motion.div
                      key={menu.title}
                      className="space-y-1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="font-medium text-foreground px-4 py-2 glow-pulse">{menu.title}</div>
                      {menu.items.map((item, itemIndex) => (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + itemIndex * 0.05 }}
                        >
                          <Link
                            to={item.href}
                            className="block py-2 px-6 text-muted-foreground hover:text-foreground hover:bg-background-secondary rounded-xl transition-all duration-300 hover:scale-[1.02] transform-gpu interactive-liquid glow-on-hover"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {item.title}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </motion.nav>
  )
}

export default Navbar
"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, FileText, MessageSquare, Crown, UserCheck, UserX, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { hasPermission, updateUserRole, banUser, giveVipStatus } from "@/lib/auth"
import { getUsers, getAdvertisements, getAdminStats } from "@/lib/supabase/optimized-queries"
import { usePagination } from "@/hooks/use-pagination"
import type { User } from "@/lib/auth"

interface Advertisement {
  id: string
  title: string
  description: string
  price: number
  category: string
  subcategory: string
  status: string
  is_vip: boolean
  views_count: number
  created_at: string
  user_id: string
  users?: {
    nickname: string
    role: string
  }
}

interface AdminStats {
  totalUsers: number
  totalAds: number
  activeAds: number
  vipUsers: number
  bannedUsers: number
  todayRegistrations: number
  todayAds: number
  totalMessages: number
}

export default function OptimizedAdminPanel() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // State management
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAds: 0,
    activeAds: 0,
    vipUsers: 0,
    bannedUsers: 0,
    todayRegistrations: 0,
    todayAds: 0,
    totalMessages: 0,
  })

  const [users, setUsers] = useState<User[]>([])
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalAds, setTotalAds] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Search and filter states
  const [userSearch, setUserSearch] = useState("")
  const [userRoleFilter, setUserRoleFilter] = useState("all") // Updated default value
  const [adSearch, setAdSearch] = useState("")
  const [adStatusFilter, setAdStatusFilter] = useState("all") // Updated default value

  // Pagination hooks
  const userPagination = usePagination({
    totalItems: totalUsers,
    itemsPerPage: 20,
    initialPage: 1,
  })

  const adPagination = usePagination({
    totalItems: totalAds,
    itemsPerPage: 20,
    initialPage: 1,
  })

  // Memoized filter options
  const userFilters = useMemo(
    () => ({
      search: userSearch,
      role: userRoleFilter === "all" ? undefined : userRoleFilter,
    }),
    [userSearch, userRoleFilter],
  )

  const adFilters = useMemo(
    () => ({
      search: adSearch,
      status: adStatusFilter === "all" ? undefined : adStatusFilter,
    }),
    [adSearch, adStatusFilter],
  )

  // Debounced search function
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }, [])

  // Fetch functions with optimization
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getAdminStats()
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити статистику",
        variant: "destructive",
      })
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error, count } = await getUsers({
        page: userPagination.currentPage,
        limit: 20,
        ...userFilters,
      })

      if (error) throw error

      setUsers(data || [])
      setTotalUsers(count || 0)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити користувачів",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [userPagination.currentPage, userFilters])

  const fetchAdvertisements = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error, count } = await getAdvertisements({
        page: adPagination.currentPage,
        limit: 20,
        ...adFilters,
      })

      if (error) throw error

      setAdvertisements(data || [])
      setTotalAds(count || 0)
    } catch (error) {
      console.error("Error fetching advertisements:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити оголошення",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [adPagination.currentPage, adFilters])

  // Debounced search handlers
  const debouncedUserSearch = useMemo(
    () =>
      debounce(() => {
        userPagination.goToPage(1)
        fetchUsers()
      }, 500),
    [fetchUsers, userPagination],
  )

  const debouncedAdSearch = useMemo(
    () =>
      debounce(() => {
        adPagination.goToPage(1)
        fetchAdvertisements()
      }, 500),
    [fetchAdvertisements, adPagination],
  )

  // Effects
  useEffect(() => {
    if (!loading && (!user || !hasPermission(user, ["admin", "moderator"]))) {
      router.push("/")
      return
    }

    if (user && hasPermission(user, ["admin", "moderator"])) {
      fetchStats()
    }
  }, [user, loading, router, fetchStats])

  useEffect(() => {
    if (user && hasPermission(user, ["admin", "moderator"])) {
      fetchUsers()
    }
  }, [user, userPagination.currentPage, fetchUsers])

  useEffect(() => {
    if (user && hasPermission(user, ["admin", "moderator"])) {
      fetchAdvertisements()
    }
  }, [user, adPagination.currentPage, fetchAdvertisements])

  // Search effect handlers
  useEffect(() => {
    debouncedUserSearch()
  }, [userSearch, userRoleFilter, debouncedUserSearch])

  useEffect(() => {
    debouncedAdSearch()
  }, [adSearch, adStatusFilter, debouncedAdSearch])

  // Action handlers
  const handleUserAction = async (userId: string, action: string, value?: any) => {
    try {
      let result
      switch (action) {
        case "ban":
          result = await banUser(userId, value)
          break
        case "role":
          result = await updateUserRole(userId, value)
          break
        case "vip":
          result = await giveVipStatus(userId, value || 30)
          break
        default:
          return
      }

      if (result.error) {
        throw new Error(result.error.message)
      }

      toast({
        title: "Успішно",
        description: "Дію виконано успішно",
        variant: "default",
      })

      fetchUsers()
      fetchStats()
    } catch (error: any) {
      toast({
        title: "Помилка",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!user || !hasPermission(user, ["admin", "moderator"])) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Адміністративна панель
          </h1>
          <p className="text-muted-foreground">Управління користувачами та оголошеннями Skoropad</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всього користувачів</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">+{stats.todayRegistrations} сьогодні</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всього оголошень</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAds}</div>
              <p className="text-xs text-muted-foreground">+{stats.todayAds} сьогодні</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VIP користувачі</CardTitle>
              <Crown className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.vipUsers}</div>
              <p className="text-xs text-muted-foreground">Активні VIP</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Повідомлення</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">Всього повідомлень</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content with Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="users">Користувачі</TabsTrigger>
              <TabsTrigger value="ads">Оголошення</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Управління користувачами</CardTitle>
                  <CardDescription>Перегляд та управління користувачами платформи</CardDescription>

                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Пошук користувачів..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Фільтр за роллю" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всі ролі</SelectItem>
                        <SelectItem value="user">Користувач</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="moderator">Модератор</SelectItem>
                        <SelectItem value="admin">Адміністратор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Нікнейм</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Роль</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Дата реєстрації</TableHead>
                            <TableHead>Дії</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.nickname}</TableCell>
                              <TableCell>{user.email || "Не вказано"}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.role === "admin"
                                      ? "destructive"
                                      : user.role === "vip"
                                        ? "default"
                                        : user.role === "moderator"
                                          ? "secondary"
                                          : "outline"
                                  }
                                >
                                  {user.role.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.is_banned ? "destructive" : "default"}>
                                  {user.is_banned ? "Заблокований" : "Активний"}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(user.created_at).toLocaleDateString("uk-UA")}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant={user.is_banned ? "default" : "destructive"}
                                    size="sm"
                                    onClick={() => handleUserAction(user.id, "ban", !user.is_banned)}
                                  >
                                    {user.is_banned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUserAction(user.id, "vip", 30)}
                                  >
                                    <Crown className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      <div className="mt-6">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => userPagination.goToPreviousPage()}
                                className={
                                  !userPagination.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"
                                }
                              />
                            </PaginationItem>

                            {userPagination.getPageNumbers().map((pageNumber) => (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  onClick={() => userPagination.goToPage(pageNumber)}
                                  isActive={pageNumber === userPagination.currentPage}
                                  className="cursor-pointer"
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => userPagination.goToNextPage()}
                                className={
                                  !userPagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ads" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Управління оголошеннями</CardTitle>
                  <CardDescription>Перегляд та модерація оголошень</CardDescription>

                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Пошук оголошень..."
                        value={adSearch}
                        onChange={(e) => setAdSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={adStatusFilter} onValueChange={setAdStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Фільтр за статусом" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всі статуси</SelectItem>
                        <SelectItem value="active">Активне</SelectItem>
                        <SelectItem value="pending">На розгляді</SelectItem>
                        <SelectItem value="rejected">Відхилено</SelectItem>
                        <SelectItem value="inactive">Неактивне</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Назва</TableHead>
                            <TableHead>Автор</TableHead>
                            <TableHead>Категорія</TableHead>
                            <TableHead>Ціна</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>VIP</TableHead>
                            <TableHead>Дата</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {advertisements.map((ad) => (
                            <TableRow key={ad.id}>
                              <TableCell className="font-medium max-w-[200px] truncate">{ad.title}</TableCell>
                              <TableCell>
                                {ad.users?.nickname}
                                {ad.users?.role !== "user" && (
                                  <Badge variant="outline" className="ml-1 text-xs">
                                    {ad.users?.role}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {ad.category}/{ad.subcategory}
                              </TableCell>
                              <TableCell>₴{ad.price?.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    ad.status === "active"
                                      ? "default"
                                      : ad.status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {ad.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {ad.is_vip && (
                                  <Badge variant="default" className="bg-yellow-500">
                                    VIP
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{new Date(ad.created_at).toLocaleDateString("uk-UA")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      <div className="mt-6">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => adPagination.goToPreviousPage()}
                                className={
                                  !adPagination.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"
                                }
                              />
                            </PaginationItem>

                            {adPagination.getPageNumbers().map((pageNumber) => (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  onClick={() => adPagination.goToPage(pageNumber)}
                                  isActive={pageNumber === adPagination.currentPage}
                                  className="cursor-pointer"
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => adPagination.goToNextPage()}
                                className={
                                  !adPagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

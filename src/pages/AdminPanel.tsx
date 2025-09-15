import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Ban, Shield, Crown, Trash2, Eye, Users, FileText, BarChart3, Download, ExternalLink, UserCheck, UserX, MessageSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner'; // Corrected import to sonner
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, updateUserRole, banUser, giveVipStatus } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { usePagination } from '@/hooks/use-pagination'; // Assuming this hook is correct and available
import { useBuggyEffect } from "@/contexts/BuggyEffectContext"; // Import useBuggyEffect
import GlitchText from "@/components/GlitchText"; // Import GlitchText
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Import Table components

interface UserProfile {
  id: string;
  nickname: string;
  email: string;
  role: 'user' | 'vip' | 'moderator' | 'admin';
  is_banned: boolean;
  created_at: string;
}

interface Advertisement {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  status: string;
  is_vip: boolean;
  views_count: number;
  created_at: string;
  user_id: string;
  users?: {
    nickname: string;
    role: string;
  };
}

interface AdminLog {
  id: string;
  admin_id: string | null;
  action: string;
  target_user_id: string | null;
  details: any | null;
  created_at: string;
  users?: { nickname: string } | null;
  target_user?: { nickname: string } | null;
}

interface AdminStats {
  totalUsers: number;
  totalAds: number;
  activeAds: number;
  vipUsers: number;
  bannedUsers: number;
  todayRegistrations: number;
  todayAds: number;
  totalMessages: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

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
  });

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalAdsCount, setTotalAdsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [adSearch, setAdSearch] = useState("");
  const [adStatusFilter, setAdStatusFilter] = useState("all");

  // Pagination hooks
  const userPagination = usePagination({
    totalItems: totalUsersCount,
    itemsPerPage: 20,
    initialPage: 1,
  });

  const adPagination = usePagination({
    totalItems: totalAdsCount,
    itemsPerPage: 20,
    initialPage: 1,
  });

  // Memoized filter options
  const userFilters = useMemo(
    () => ({
      search: userSearch,
      role: userRoleFilter === "all" ? undefined : userRoleFilter,
    }),
    [userSearch, userRoleFilter],
  );

  const adFilters = useMemo(
    () => ({
      search: adSearch,
      status: adStatusFilter === "all" ? undefined : adStatusFilter,
    }),
    [adSearch, adStatusFilter],
  );

  // Fetch functions with optimization
  const fetchAdminStats = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const [
        { count: totalUsers },
        { count: totalAds },
        { count: activeAds },
        { count: vipUsers },
        { count: bannedUsers },
        { count: todayRegistrations },
        { count: todayAds },
        { count: totalMessages },
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("advertisements").select("*", { count: "exact", head: true }),
        supabase.from("advertisements").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "vip"),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("is_banned", true),
        supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("advertisements").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("messages").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        totalAds: totalAds || 0,
        activeAds: activeAds || 0,
        vipUsers: vipUsers || 0,
        bannedUsers: bannedUsers || 0,
        todayRegistrations: todayRegistrations || 0,
        todayAds: todayAds || 0,
        totalMessages: totalMessages || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Не вдалося завантажити статистику");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from("users")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((userPagination.currentPage - 1) * userPagination.itemsPerPage, userPagination.currentPage * userPagination.itemsPerPage - 1);

      if (userFilters.search) {
        query = query.or(`nickname.ilike.%${userFilters.search}%,email.ilike.%${userFilters.search}%`);
      }
      if (userFilters.role) {
        query = query.eq("role", userFilters.role);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setUsers(data || []);
      setTotalUsersCount(count || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Не вдалося завантажити користувачів");
    } finally {
      setIsLoading(false);
    }
  }, [userPagination.currentPage, userPagination.itemsPerPage, userFilters]);

  const fetchAdvertisements = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from("advertisements")
        .select(`*, users (nickname, role)`)
        .order("created_at", { ascending: false })
        .range((adPagination.currentPage - 1) * adPagination.itemsPerPage, adPagination.currentPage * adPagination.itemsPerPage - 1);

      if (adFilters.search) {
        query = query.or(`title.ilike.%${adFilters.search}%,description.ilike.%${adFilters.search}%`);
      }
      if (adFilters.status) {
        query = query.eq("status", adFilters.status);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setAdvertisements(data || []);
      setTotalAdsCount(count || 0);
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      toast.error("Не вдалося завантажити оголошення");
    } finally {
      setIsLoading(false);
    }
  }, [adPagination.currentPage, adPagination.itemsPerPage, adFilters]);

  const fetchLogs = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select(`
          *,
          users!admin_logs_admin_id_fkey (nickname),
          target_user:users!admin_logs_target_user_id_fkey (nickname)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Не вдалося завантажити логи');
    }
  }, [user]);

  // Debounced search function (simple version for demonstration)
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  const debouncedUserSearch = useMemo(
    () =>
      debounce(() => {
        userPagination.goToPage(1);
        fetchUsers();
      }, 500),
    [fetchUsers, userPagination],
  );

  const debouncedAdSearch = useMemo(
    () =>
      debounce(() => {
        adPagination.goToPage(1);
        fetchAdvertisements();
      }, 500),
    [fetchAdvertisements, adPagination],
  );

  // Effects
  useEffect(() => {
    if (!authLoading && (!user || !hasPermission(user, ["admin", "moderator"]))) {
      navigate("/");
      return;
    }

    if (user && hasPermission(user, ["admin", "moderator"])) {
      fetchAdminStats();
      fetchUsers();
      fetchAdvertisements();
      if (user.role === 'admin') {
        fetchLogs();
      }
    }
  }, [user, authLoading, navigate, fetchAdminStats, fetchUsers, fetchAdvertisements, fetchLogs]);

  useEffect(() => {
    debouncedUserSearch();
  }, [userSearch, userRoleFilter, debouncedUserSearch]);

  useEffect(() => {
    debouncedAdSearch();
  }, [adSearch, adStatusFilter, debouncedAdSearch]);

  const logAction = async (action: string, targetUserId?: string, details?: any) => {
    try {
      await supabase
        .from('admin_logs')
        .insert([{
          admin_id: user?.id,
          action,
          target_user_id: targetUserId || null,
          details: details || {}
        }]);
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  const handleUserAction = async (targetUserId: string, action: string, value?: any) => {
    try {
      let result;
      switch (action) {
        case "ban":
          result = await banUser(targetUserId, value);
          break;
        case "role":
          result = await updateUserRole(targetUserId, value);
          break;
        case "vip":
          result = await giveVipStatus(targetUserId, value || 30);
          break;
        default:
          return;
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Дію виконано успішно");
      await logAction(`${action}${value ? `_${value}` : ''}`, targetUserId, { action, value });
      fetchUsers();
      fetchAdminStats();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePromoteAd = async (adId: string, isVip: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_vip: !isVip })
        .eq('id', adId);

      if (error) throw error;

      toast.success(isVip ? 'VIP статус знято' : 'Надано VIP статус');
      await logAction(isVip ? 'demote_advertisement' : 'promote_advertisement', undefined, { advertisement_id: adId });
      fetchAdvertisements();
    } catch (error: any) {
      toast.error('Помилка зміни статусу: ' + error.message);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити це оголошення?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      toast.success('Оголошення видалено');
      await logAction('delete_advertisement', undefined, { advertisement_id: adId });
      fetchAdvertisements();
    } catch (error: any) {
      toast.error('Помилка видалення оголошення: ' + error.message);
    }
  };

  const exportData = async () => {
    try {
      const data = {
        users: users,
        advertisements: advertisements,
        logs: logs,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skoropad-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Дані експортовано успішно');
    } catch (error: any) {
      toast.error('Помилка експорту: ' + error.message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user || !hasPermission(user, ['admin', 'moderator'])) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4"><GlitchText intensity={isBuggyMode ? 0.8 : 0}>Доступ заборонено</GlitchText></h1>
          <p className="text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>У вас немає прав для доступу до адмін панелі</GlitchText></p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-6 ${isBuggyMode ? 'animate-global-glitch' : ''}`}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            <GlitchText intensity={isBuggyMode ? 0.9 : 0}>Адміністративна панель</GlitchText>
          </h1>
          <p className="text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Управління користувачами та оголошеннями Skoropad</GlitchText></p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className={`glass-card ${isBuggyMode ? 'animate-card-wobble' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Всього користувачів</GlitchText></CardTitle>
              <Users className={`h-4 w-4 text-muted-foreground ${isBuggyMode ? 'animate-spin-slow' : ''}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><GlitchText intensity={isBuggyMode ? 0.9 : 0}>{stats.totalUsers}</GlitchText></div>
              <p className="text-xs text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.5 : 0}>+{stats.todayRegistrations} сьогодні</GlitchText></p>
            </CardContent>
          </Card>

          <Card className={`glass-card ${isBuggyMode ? 'animate-card-wobble' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Всього оголошень</GlitchText></CardTitle>
              <FileText className={`h-4 w-4 text-muted-foreground ${isBuggyMode ? 'animate-spin-reverse' : ''}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><GlitchText intensity={isBuggyMode ? 0.9 : 0}>{stats.totalAds}</GlitchText></div>
              <p className="text-xs text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.5 : 0}>+{stats.todayAds} сьогодні</GlitchText></p>
            </CardContent>
          </Card>

          <Card className={`glass-card ${isBuggyMode ? 'animate-card-wobble' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>VIP користувачі</GlitchText></CardTitle>
              <Crown className={`h-4 w-4 text-yellow-500 ${isBuggyMode ? 'animate-flicker' : ''}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><GlitchText intensity={isBuggyMode ? 0.9 : 0}>{stats.vipUsers}</GlitchText></div>
              <p className="text-xs text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.5 : 0}>Активні VIP</GlitchText></p>
            </CardContent>
          </Card>

          <Card className={`glass-card ${isBuggyMode ? 'animate-card-wobble' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Повідомлення</GlitchText></CardTitle>
              <MessageSquare className={`h-4 w-4 text-muted-foreground ${isBuggyMode ? 'animate-spin-fast' : ''}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><GlitchText intensity={isBuggyMode ? 0.9 : 0}>{stats.totalMessages}</GlitchText></div>
              <p className="text-xs text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.5 : 0}>Всього повідомлень</GlitchText></p>
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
            <TabsList className={`grid w-full grid-cols-2 lg:w-[400px] ${isBuggyMode ? 'animate-button-flicker' : ''}`}>
              <TabsTrigger value="users"><GlitchText intensity={isBuggyMode ? 0.8 : 0}>Користувачі</GlitchText></TabsTrigger>
              <TabsTrigger value="ads"><GlitchText intensity={isBuggyMode ? 0.8 : 0}>Оголошення</GlitchText></TabsTrigger>
              {user?.role === 'admin' && (
                <TabsTrigger value="logs"><GlitchText intensity={isBuggyMode ? 0.8 : 0}>Логи</GlitchText></TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card className={`glass-card ${isBuggyMode ? 'animate-card-wobble' : ''}`}>
                <CardHeader>
                  <CardTitle><GlitchText intensity={isBuggyMode ? 0.8 : 0}>Управління користувачами</GlitchText></CardTitle>
                  <CardDescription><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Перегляд та управління користувачами платформи</GlitchText></CardDescription>

                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <div className="relative flex-1">
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 ${isBuggyMode ? 'animate-flicker' : ''}`} />
                      <Input
                        placeholder="Пошук користувачів..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className={`pl-10 ${isBuggyMode ? 'animate-pulse border-red-500' : ''}`}
                      />
                    </div>
                    <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                      <SelectTrigger className={`w-[180px] ${isBuggyMode ? 'animate-button-flicker' : ''}`}>
                        <SelectValue placeholder={<GlitchText intensity={isBuggyMode ? 0.7 : 0}>Фільтр за роллю</GlitchText>} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Всі ролі</GlitchText></SelectItem>
                        <SelectItem value="user"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Користувач</GlitchText></SelectItem>
                        <SelectItem value="vip"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>VIP</GlitchText></SelectItem>
                        <SelectItem value="moderator"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Модератор</GlitchText></SelectItem>
                        <SelectItem value="admin"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Адміністратор</GlitchText></SelectItem>
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
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Нікнейм</GlitchText></TableHead>
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Email</GlitchText></TableHead>
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Роль</GlitchText></TableHead>
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Статус</GlitchText></TableHead>
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Дата реєстрації</GlitchText></TableHead>
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Дії</GlitchText></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((targetUser) => (
                            <TableRow key={targetUser.id} className={`${isBuggyMode ? 'animate-global-glitch' : ''}`}>
                              <TableCell className="font-medium"><GlitchText intensity={isBuggyMode ? 0.8 : 0}>{targetUser.nickname}</GlitchText></TableCell>
                              <TableCell><GlitchText intensity={isBuggyMode ? 0.6 : 0}>{targetUser.email || "Не вказано"}</GlitchText></TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    targetUser.role === "admin"
                                      ? "destructive"
                                      : targetUser.role === "vip"
                                        ? "default"
                                        : targetUser.role === "moderator"
                                          ? "secondary"
                                          : "outline"
                                  }
                                  className={`${isBuggyMode ? 'animate-flicker' : ''}`}
                                >
                                  <GlitchText intensity={isBuggyMode ? 0.7 : 0}>{targetUser.role.toUpperCase()}</GlitchText>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={targetUser.is_banned ? "destructive" : "default"} className={`${isBuggyMode ? 'animate-flicker' : ''}`}>
                                  <GlitchText intensity={isBuggyMode ? 0.7 : 0}>{targetUser.is_banned ? "Заблокований" : "Активний"}</GlitchText>
                                </Badge>
                              </TableCell>
                              <TableCell><GlitchText intensity={isBuggyMode ? 0.6 : 0}>{new Date(targetUser.created_at).toLocaleDateString("uk-UA")}</GlitchText></TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant={targetUser.is_banned ? "default" : "destructive"}
                                    size="sm"
                                    onClick={() => handleUserAction(targetUser.id, "ban", !targetUser.is_banned)}
                                    className={`${isBuggyMode ? 'animate-button-flicker' : ''}`}
                                  >
                                    {targetUser.is_banned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUserAction(targetUser.id, "vip", 30)}
                                    className={`${isBuggyMode ? 'animate-button-flicker' : ''}`}
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
                                  !userPagination.hasPreviousPage ? "pointer-events-none opacity-50" : `cursor-pointer ${isBuggyMode ? 'animate-spin-slow' : ''}`
                                }
                              />
                            </PaginationItem>

                            {userPagination.getPageNumbers().map((pageNumber) => (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  onClick={() => userPagination.goToPage(pageNumber)}
                                  isActive={pageNumber === userPagination.currentPage}
                                  className={`cursor-pointer ${isBuggyMode ? 'animate-flicker' : ''}`}
                                >
                                  <GlitchText intensity={isBuggyMode ? 0.5 : 0}>{pageNumber}</GlitchText>
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => userPagination.goToNextPage()}
                                className={
                                  !userPagination.hasNextPage ? "pointer-events-none opacity-50" : `cursor-pointer ${isBuggyMode ? 'animate-spin-reverse' : ''}`
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
              <Card className={`glass-card ${isBuggyMode ? 'animate-card-wobble' : ''}`}>
                <CardHeader>
                  <CardTitle><GlitchText intensity={isBuggyMode ? 0.8 : 0}>Управління оголошеннями</GlitchText></CardTitle>
                  <CardDescription><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Перегляд та модерація оголошень</GlitchText></CardDescription>

                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <div className="relative flex-1">
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 ${isBuggyMode ? 'animate-flicker' : ''}`} />
                      <Input
                        placeholder="Пошук оголошень..."
                        value={adSearch}
                        onChange={(e) => setAdSearch(e.target.value)}
                        className={`pl-10 ${isBuggyMode ? 'animate-pulse border-red-500' : ''}`}
                      />
                    </div>
                    <Select value={adStatusFilter} onValueChange={setAdStatusFilter}>
                      <SelectTrigger className={`w-[180px] ${isBuggyMode ? 'animate-button-flicker' : ''}`}>
                        <SelectValue placeholder={<GlitchText intensity={isBuggyMode ? 0.7 : 0}>Фільтр за статусом</GlitchText>} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Всі статуси</GlitchText></SelectItem>
                        <SelectItem value="active"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Активне</GlitchText></SelectItem>
                        <SelectItem value="pending"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>На розгляді</GlitchText></SelectItem>
                        <SelectItem value="rejected"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Відхилено</GlitchText></SelectItem>
                        <SelectItem value="inactive"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Неактивне</GlitchText></SelectItem>
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
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Назва</GlitchText></TableHead>
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Автор</GlitchText></TableHead>
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Категорія</GlitchText></TableHead>
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ціна</GlitchText></TableHead>
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Статус</GlitchText></TableHead>
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>VIP</GlitchText></TableHead>
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Дата</GlitchText></TableHead>
                            <TableHead><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Дії</GlitchText></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {advertisements.map((ad) => (
                            <TableRow key={ad.id} className={`${isBuggyMode ? 'animate-global-glitch' : ''}`}>
                              <TableCell className="font-medium max-w-[200px] truncate"><GlitchText intensity={isBuggyMode ? 0.8 : 0}>{ad.title}</GlitchText></TableCell>
                              <TableCell>
                                <GlitchText intensity={isBuggyMode ? 0.6 : 0}>{ad.users?.nickname}</GlitchText>
                                {ad.users?.role !== "user" && (
                                  <Badge variant="outline" className={`ml-1 text-xs ${isBuggyMode ? 'animate-flicker' : ''}`}>
                                    <GlitchText intensity={isBuggyMode ? 0.5 : 0}>{ad.users?.role}</GlitchText>
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <GlitchText intensity={isBuggyMode ? 0.6 : 0}>{ad.category}/{ad.subcategory}</GlitchText>
                              </TableCell>
                              <TableCell><GlitchText intensity={isBuggyMode ? 0.8 : 0}>₴{ad.price?.toLocaleString()}</GlitchText></TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    ad.status === "active"
                                      ? "default"
                                      : ad.status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className={`${isBuggyMode ? 'animate-flicker' : ''}`}
                                >
                                  <GlitchText intensity={isBuggyMode ? 0.7 : 0}>{ad.status}</GlitchText>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {ad.is_vip && (
                                  <Badge variant="default" className={`bg-yellow-500 ${isBuggyMode ? 'animate-flicker' : ''}`}>
                                    <GlitchText intensity={isBuggyMode ? 0.7 : 0}>VIP</GlitchText>
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell><GlitchText intensity={isBuggyMode ? 0.6 : 0}>{new Date(ad.created_at).toLocaleDateString("uk-UA")}</GlitchText></TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePromoteAd(ad.id, ad.is_vip)}
                                    title={ad.is_vip ? 'Зняти VIP статус' : 'Надати VIP статус'}
                                    className={`${isBuggyMode ? 'animate-button-flicker' : ''}`}
                                  >
                                    <Crown className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteAd(ad.id)}
                                    title="Видалити оголошення"
                                    className={`${isBuggyMode ? 'animate-button-flicker' : ''}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
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
                                onClick={() => adPagination.goToPreviousPage()}
                                className={
                                  !adPagination.hasPreviousPage ? "pointer-events-none opacity-50" : `cursor-pointer ${isBuggyMode ? 'animate-spin-slow' : ''}`
                                }
                              />
                            </PaginationItem>

                            {adPagination.getPageNumbers().map((pageNumber) => (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  onClick={() => adPagination.goToPage(pageNumber)}
                                  isActive={pageNumber === adPagination.currentPage}
                                  className={`cursor-pointer ${isBuggyMode ? 'animate-flicker' : ''}`}
                                >
                                  <GlitchText intensity={isBuggyMode ? 0.5 : 0}>{pageNumber}</GlitchText>
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => adPagination.goToNextPage()}
                                className={
                                  !adPagination.hasNextPage ? "pointer-events-none opacity-50" : `cursor-pointer ${isBuggyMode ? 'animate-spin-reverse' : ''}`
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

            {user?.role === 'admin' && (
              <TabsContent value="logs" className="space-y-4">
                <Card className={`glass-card ${isBuggyMode ? 'animate-card-wobble' : ''}`}>
                  <CardHeader>
                    <CardTitle><GlitchText intensity={isBuggyMode ? 0.8 : 0}>Логи дій</GlitchText></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {logs.map((log) => (
                        <motion.div 
                          key={log.id} 
                          className={`p-4 border rounded-2xl hover:shadow-md transition-shadow bg-background-secondary glow-on-hover ${isBuggyMode ? 'rotate-[0.5deg] scale-[1.01] transition-all duration-100' : ''}`}
                          whileHover={{ scale: 1.01 }}
                        >
                          <p className="font-medium text-foreground">
                            <span className="font-bold"><GlitchText intensity={isBuggyMode ? 0.8 : 0}>{log.users?.nickname || 'Невідомий'}</GlitchText></span> виконав дію: <Badge variant="outline" className={`${isBuggyMode ? 'animate-flicker' : ''}`}><GlitchText intensity={isBuggyMode ? 0.7 : 0}>{log.action}</GlitchText></Badge>
                          </p>
                          {log.target_user && (
                            <p className="text-sm text-muted-foreground">
                              <GlitchText intensity={isBuggyMode ? 0.6 : 0}>Цільовий користувач: <span className="font-medium">{log.target_user.nickname}</span></GlitchText>
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            <GlitchText intensity={isBuggyMode ? 0.5 : 0}>{new Date(log.created_at).toLocaleString('uk-UA')}</GlitchText>
                          </p>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <GlitchText intensity={isBuggyMode ? 0.5 : 0}>Деталі: {JSON.stringify(log.details)}</GlitchText>
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;
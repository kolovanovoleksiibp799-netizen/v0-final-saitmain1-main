import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner'; // Corrected import to sonner
import { useBuggyEffect } from "@/contexts/BuggyEffectContext"; // Import useBuggyEffect
import GlitchText from "@/components/GlitchText"; // Import GlitchText

const CreateAdPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([]);
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    title: '',
    description: '',
    discord_contact: '',
    telegram_contact: '',
    price: ''
  });
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  const categories = {
    'automobiles': {
      name: 'Автомобілі',
      subcategories: [
        { value: 'sale', name: 'Продаж Автомобілі' },
        { value: 'trucks', name: 'Продаж вантажівок' },
        { value: 'vinyls', name: 'Продаж Вініли' },
        { value: 'parts', name: 'Продаж Деталі' },
        { value: 'numbers', name: 'Продаж Номера' },
        { value: 'car-rental', name: 'Оренда автомобіля' },
        { value: 'truck-rental', name: 'Оренда вантажівок' }
      ]
    },
    'clothing': {
      name: 'Одяг',
      subcategories: [
        { value: 'sale', name: 'Продаж одягу' },
        { value: 'accessories', name: 'Продаж аксесуарів' },
        { value: 'backpacks', name: 'Продаж рюкзаків' }
      ]
    },
    'real-estate': {
      name: 'Нерухомість',
      subcategories: [
        { value: 'business', name: 'Продаж бізнесу' },
        { value: 'apartments', name: 'Продаж квартир' },
        { value: 'houses', name: 'Продаж приватних будинків' },
        { value: 'greenhouses', name: 'Оренда теплиць' }
      ]
    },
    'other': {
      name: 'Інше',
      subcategories: [
        { value: 'misc', name: 'Різне' }
      ]
    }
  };

  const handleFileUpload = async (file: File) => {
    if (images.length >= 10) {
      toast.error('Максимум 10 зображень');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Можна завантажувати лише зображення');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Розмір файлу не повинен перевищувати 5MB');
      return;
    }

    const newUploadingImages = [...uploadingImages];
    newUploadingImages.push(true);
    setUploadingImages(newUploadingImages);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('advertisement-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('advertisement-images')
        .getPublicUrl(fileName);

      setImages([...images, publicUrl]);
      toast.success('Зображення завантажено успішно!');
    } catch (error: any) {
      toast.error('Помилка завантаження: ' + error.message);
    } finally {
      const newUploadingImages = [...uploadingImages];
      newUploadingImages.pop();
      setUploadingImages(newUploadingImages);
    }
  };

  const handleImageAdd = () => {
    if (images.length < 10) {
      const imageUrl = prompt('Введіть URL зображення:');
      if (imageUrl && imageUrl.trim()) {
        setImages([...images, imageUrl.trim()]);
      }
    } else {
      toast.error('Максимум 10 зображень');
    }
  };

  const handleImageRemove = async (index: number) => {
    const imageUrl = images[index];
    // If it's a Supabase storage URL, try to delete it
    if (imageUrl.includes('supabase.co/storage')) {
      try {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        await supabase.storage
          .from('advertisement-images')
          .remove([fileName]);
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
      }
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Увійдіть в акаунт для створення оголошення');
      return;
    }

    if (!formData.category || !formData.subcategory || !formData.title || !formData.description) {
      toast.error('Заповніть всі обов\'язкові поля');
      return;
    }

    if (!formData.discord_contact && !formData.telegram_contact) {
      toast.error('Вкажіть хоча б один контакт (Discord або Telegram)');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_advertisement', {
        p_user_id: user.id,
        p_category: formData.category,
        p_subcategory: formData.subcategory,
        p_title: formData.title,
        p_description: formData.description,
        p_images: images,
        p_discord: formData.discord_contact || null,
        p_telegram: formData.telegram_contact || null,
        p_is_vip: user.role === 'vip' || user.role === 'admin' || user.role === 'moderator',
        p_price: formData.price ? parseFloat(formData.price) : null
      });

      if (error) throw error;

      toast.success('Оголошення створено успішно!');
      navigate('/');
    } catch (error: any) {
      toast.error('Помилка при створенні оголошення: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4"><GlitchText intensity={isBuggyMode ? 0.8 : 0}>Увійдіть в акаунт</GlitchText></h1>
          <p className="text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>Для створення оголошення потрібно увійти в акаунт</GlitchText></p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className={`pt-24 pb-16 ${isBuggyMode ? 'animate-global-glitch' : ''}`}>
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className={`mb-6 glow-on-hover ${isBuggyMode ? 'animate-card-wobble' : ''}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <GlitchText intensity={isBuggyMode ? 0.6 : 0}>Назад</GlitchText>
              </Button>
            </motion.div>

            <h1 className="text-3xl font-bold mb-8">
              <GlitchText intensity={isBuggyMode ? 0.9 : 0}>Створити </GlitchText>
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                <GlitchText intensity={isBuggyMode ? 0.9 : 0}>оголошення</GlitchText>
              </span>
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Категорія *</GlitchText></Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: '' })}
                  >
                    <SelectTrigger className={`rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${isBuggyMode ? 'animate-button-flicker' : ''}`}>
                      <SelectValue placeholder={<GlitchText intensity={isBuggyMode ? 0.6 : 0}>Оберіть категорію</GlitchText>} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-soft">
                      {Object.entries(categories).map(([key, cat]) => (
                        <SelectItem key={key} value={key}><GlitchText intensity={isBuggyMode ? 0.5 : 0}>{cat.name}</GlitchText></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Підкатегорія *</GlitchText></Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                    disabled={!formData.category}
                  >
                    <SelectTrigger className={`rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${isBuggyMode ? 'animate-button-flicker' : ''}`}>
                      <SelectValue placeholder={<GlitchText intensity={isBuggyMode ? 0.6 : 0}>Оберіть підкатегорію</GlitchText>} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-soft">
                      {formData.category && categories[formData.category as keyof typeof categories]?.subcategories.map((sub) => (
                        <SelectItem key={sub.value} value={sub.value}><GlitchText intensity={isBuggyMode ? 0.5 : 0}>{sub.name}</GlitchText></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ваш нікнейм</GlitchText></Label>
                <Input
                  value={user.nickname}
                  disabled
                  className={`rounded-2xl bg-muted ${isBuggyMode ? 'animate-pulse border-red-500' : ''}`}
                />
                {user.role === 'vip' && (
                  <p className={`text-sm text-accent ${isBuggyMode ? 'animate-flicker' : ''}`}><GlitchText intensity={isBuggyMode ? 0.5 : 0}>⭐ VIP статус - ваше оголошення буде виділено</GlitchText></p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Назва оголошення *</GlitchText></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${isBuggyMode ? 'animate-pulse border-red-500' : ''}`}
                  placeholder="Введіть назву оголошення"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Опис оголошення *</GlitchText></Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`rounded-2xl min-h-32 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${isBuggyMode ? 'animate-pulse border-red-500' : ''}`}
                  placeholder="Детальний опис вашого оголошення"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Ціна (грн)</GlitchText></Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={`rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${isBuggyMode ? 'animate-pulse border-red-500' : ''}`}
                  placeholder="Вкажіть ціну (необов'язково)"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="discord"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Discord контакт</GlitchText></Label>
                  <Input
                    id="discord"
                    value={formData.discord_contact}
                    onChange={(e) => setFormData({ ...formData, discord_contact: e.target.value })}
                    className={`rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${isBuggyMode ? 'animate-pulse border-red-500' : ''}`}
                    placeholder="username#1234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram"><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Telegram контакт</GlitchText></Label>
                  <Input
                    id="telegram"
                    value={formData.telegram_contact}
                    onChange={(e) => setFormData({ ...formData, telegram_contact: e.target.value })}
                    className={`rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${isBuggyMode ? 'animate-pulse border-red-500' : ''}`}
                    placeholder="@username"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label><GlitchText intensity={isBuggyMode ? 0.7 : 0}>Зображення (до 10 штук)</GlitchText></Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Зображення ${index + 1}`}
                        className={`w-full h-24 object-cover rounded-xl border ${isBuggyMode ? 'animate-image-distort' : ''}`}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150x100?text=Помилка';
                        }}
                      />
                      <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity glow-on-hover ${isBuggyMode ? 'animate-button-flicker' : ''}`}
                          onClick={() => handleImageRemove(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    </div>
                  ))}
                  
                  {/* Loading placeholders for uploading images */}
                  {uploadingImages.map((_, index) => (
                    <div key={`uploading-${index}`} className="relative">
                      <div className={`w-full h-24 bg-muted rounded-xl border animate-pulse flex items-center justify-center ${isBuggyMode ? 'animate-card-wobble' : ''}`}>
                        <Upload className={`w-6 h-6 text-muted-foreground animate-spin ${isBuggyMode ? 'animate-spin-slow' : ''}`} />
                      </div>
                    </div>
                  ))}
                  
                  {(images.length + uploadingImages.length) < 10 && (
                    <>
                      {/* File upload button */}
                      <motion.label 
                        className="cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file);
                              e.target.value = '';
                            }
                          }}
                        />
                        <div className={`h-24 rounded-xl border-dashed border-2 border-border hover:border-accent flex flex-col items-center justify-center transition-transform bg-background hover:bg-muted glow-on-hover ${isBuggyMode ? 'animate-card-wobble' : ''}`}>
                          <Upload className={`w-5 h-5 mb-1 text-muted-foreground ${isBuggyMode ? 'animate-spin-reverse' : ''}`} />
                          <span className="text-xs text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.5 : 0}>Завантажити</GlitchText></span>
                        </div>
                      </motion.label>
                      
                      {/* URL input button */}
                      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <Button
                          type="button"
                          variant="outline"
                          className={`h-24 rounded-xl border-dashed flex flex-col w-full glow-on-hover ${isBuggyMode ? 'animate-button-flicker' : ''}`}
                          onClick={handleImageAdd}
                        >
                          <Plus className="w-5 h-5 mb-1" />
                          <span className="text-xs"><GlitchText intensity={isBuggyMode ? 0.5 : 0}>URL</GlitchText></span>
                        </Button>
                      </motion.div>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  <GlitchText intensity={isBuggyMode ? 0.5 : 0}>Завантажте зображення з комп'ютера або введіть URL. Максимальний розмір файлу: 5MB</GlitchText>
                </p>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Button
                  type="submit"
                  className={`w-full btn-accent rounded-2xl glow-on-hover ${isBuggyMode ? 'animate-button-flicker' : ''}`}
                  disabled={loading}
                >
                  {loading ? <GlitchText intensity={isBuggyMode ? 0.8 : 0}>Створення...</GlitchText> : <GlitchText intensity={isBuggyMode ? 0.8 : 0}>Створити оголошення</GlitchText>}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CreateAdPage;
// Turkish translations for TemSafy Pro
export const translations = {
  // Common terms
  common: {
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    add: 'Ekle',
    create: 'Oluştur',
    update: 'Güncelle',
    search: 'Ara',
    filter: 'Filtrele',
    loading: 'Yükleniyor...',
    success: 'Başarılı',
    error: 'Hata',
    warning: 'Uyarı',
    info: 'Bilgi',
    confirm: 'Onayla',
    close: 'Kapat',
    back: 'Geri',
    next: 'İleri',
    previous: 'Önceki',
    submit: 'Gönder',
    reset: 'Sıfırla',
    clear: 'Temizle',
    view: 'Görüntüle',
    download: 'İndir',
    upload: 'Yükle',
    yes: 'Evet',
    no: 'Hayır',
    none: 'Yok',
    actions: 'İşlemler',
    options: 'Seçenekler',
    settings: 'Ayarlar',
    created: 'Oluşturuldu'
  },

  // Authentication
  auth: {
    login: 'Giriş Yap',
    logout: 'Çıkış Yap',
    email: 'E-posta',
    password: 'Şifre',
    forgotPassword: 'Şifremi Unuttum',
    signIn: 'Oturum Aç',
    signOut: 'Oturum Kapat',
    welcome: 'Hoş Geldiniz',
    unauthorized: 'Yetkisiz Erişim',
    invalidCredentials: 'Geçersiz giriş bilgileri',
    sessionExpired: 'Oturum süresi doldu'
  },

  // User roles
  roles: {
    ADMIN: 'Yönetici',
    MANAGER: 'Müdür',
    DEPARTMENT: 'Departman Sorumlusu',
    FIELD: 'Saha Çalışanı',
    // Alternative naming
    DEPARTMENT_HEAD: 'Departman Sorumlusu',
    FIELD_WORKER: 'Saha Çalışanı'
  },

  // User management
  users: {
    title: 'Kullanıcı Yönetimi',
    user: 'Kullanıcı',
    users: 'Kullanıcılar',
    addUser: 'Kullanıcı Ekle',
    editUser: 'Kullanıcı Düzenle',
    deleteUser: 'Kullanıcı Sil',
    userDetails: 'Kullanıcı Detayları',
    createUser: 'Yeni Kullanıcı Oluştur',
    name: 'Ad Soyad',
    email: 'E-posta',
    role: 'Rol',
    department: 'Departman',
    capacity: 'Kapasite',
    createdAt: 'Oluşturulma Tarihi',
    updatedAt: 'Güncellenme Tarihi',
    status: 'Durum',
    active: 'Aktif',
    inactive: 'Pasif',
    userCreated: 'Kullanıcı başarıyla oluşturuldu',
    userUpdated: 'Kullanıcı başarıyla güncellendi',
    userDeleted: 'Kullanıcı başarıyla silindi',
    userExists: 'Bu e-posta adresi zaten kullanımda',
    selectDepartment: 'Departman Seçin',
    selectRole: 'Rol Seçin'
  },

  // Projects
  projects: {
    title: 'Proje Yönetimi',
    description: 'Projeleri yönetin ve ilerlemeyi takip edin',
    project: 'Proje',
    projects: 'Projeler',
    addProject: 'Proje Ekle',
    editProject: 'Proje Düzenle',
    deleteProject: 'Proje Sil',
    createProject: 'Yeni Proje Oluştur',
    projectDetails: 'Proje Detayları',
    name: 'Proje Adı',
    projectDescription: 'Açıklama',
    status: 'Durum',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    estimatedStartDate: 'Tahmini Başlangıç Tarihi',
    estimatedEndDate: 'Tahmini Bitiş Tarihi',
    actualStartDate: 'Gerçek Başlangıç Tarihi',
    actualEndDate: 'Gerçek Bitiş Tarihi',
    creator: 'Oluşturan',
    departments: 'Departmanlar',
    participants: 'Katılımcılar',
    tasks: 'Görevler',
    phases: 'Aşamalar',
    noProjects: 'Proje bulunamadı',
    createFirstProject: 'İlk projenizi oluşturarak başlayın.',
    confirmDelete: 'Bu projeyi silmek istediğinizden emin misiniz?',
    calculateDeadline: 'Tarih Hesapla',
    deadlineCalculator: 'Tarih Hesaplayıcısı',
    projectCreated: 'Proje başarıyla oluşturuldu',
    projectUpdated: 'Proje başarıyla güncellendi',
    projectDeleted: 'Proje başarıyla silindi'
  },

  // Project status
  projectStatus: {
    DRAFT: 'Taslak',
    PLANNING: 'Planlama',
    ACTIVE: 'Aktif',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal Edildi'
  },

  // Tasks
  tasks: {
    title: 'Görev Yönetimi',
    task: 'Görev',
    tasks: 'Görevler',
    addTask: 'Görev Ekle',
    editTask: 'Görev Düzenle',
    deleteTask: 'Görev Sil',
    createTask: 'Yeni Görev Oluştur',
    taskDetails: 'Görev Detayları',
    taskTitle: 'Görev Başlığı',
    description: 'Açıklama',
    status: 'Durum',
    priority: 'Öncelik',
    assignee: 'Atanan Kişi',
    estimatedHours: 'Tahmini Süre (Saat)',
    actualHours: 'Gerçek Süre (Saat)',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    project: 'Proje',
    department: 'Departman',
    phases: 'Aşamalar',
    taskCreated: 'Görev başarıyla oluşturuldu',
    taskUpdated: 'Görev başarıyla güncellendi',
    taskDeleted: 'Görev başarıyla silindi'
  },

  // Task status
  taskStatus: {
    PENDING: 'Beklemede',
    IN_PROGRESS: 'Devam Ediyor',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal Edildi'
  },

  // Task priority
  taskPriority: {
    LOW: 'Düşük',
    MEDIUM: 'Orta',
    HIGH: 'Yüksek',
    URGENT: 'Acil'
  },

  // Departments
  departments: {
    title: 'Departman Yönetimi',
    description: 'Organizasyonel departmanları yönetin',
    department: 'Departman',
    departments: 'Departmanlar',
    addDepartment: 'Departman Ekle',
    editDepartment: 'Departman Düzenle',
    deleteDepartment: 'Departman Sil',
    createDepartment: 'Yeni Departman Oluştur',
    departmentDetails: 'Departman Detayları',
    name: 'Departman Adı',
    departmentDescription: 'Açıklama',
    head: 'Departman Sorumlusu',
    employees: 'Çalışanlar',
    members: 'üyeler',
    projects: 'projeler',
    tasks: 'Görevler',
    selectHead: 'Departman sorumlusu seçin',
    noHeadAssigned: 'Atanmış sorumlu yok',
    noDepartments: 'Departman bulunamadı',
    createFirstDepartment: 'İlk departmanınızı oluşturarak başlayın.',
    confirmDelete: 'Bu departmanı silmek istediğinizden emin misiniz?',
    departmentCreated: 'Departman başarıyla oluşturuldu',
    departmentUpdated: 'Departman başarıyla güncellendi',
    departmentDeleted: 'Departman başarıyla silindi'
  },

  // Dashboard
  dashboard: {
    title: 'Kontrol Paneli',
    overview: 'Genel Bakış',
    analytics: 'Analitik',
    statistics: 'İstatistikler',
    recentActivity: 'Son Aktiviteler',
    quickActions: 'Hızlı İşlemler',
    notifications: 'Bildirimler',
    calendar: 'Takvim',
    workload: 'İş Yükü',
    performance: 'Performans',
    reports: 'Raporlar'
  },

  // Navigation
  navigation: {
    home: 'Ana Sayfa',
    dashboard: 'Kontrol Paneli',
    projects: 'Projeler',
    tasks: 'Görevler',
    users: 'Kullanıcılar',
    departments: 'Departmanlar',
    calendar: 'Takvim',
    analytics: 'Analitik',
    settings: 'Ayarlar',
    profile: 'Profil',
    help: 'Yardım',
    about: 'Hakkında'
  },

  // Forms
  forms: {
    required: 'Bu alan zorunludur',
    optional: 'İsteğe bağlı',
    invalidEmail: 'Geçersiz e-posta adresi',
    passwordTooShort: 'Şifre en az 6 karakter olmalıdır',
    confirmPassword: 'Şifre Onayı',
    passwordsDoNotMatch: 'Şifreler eşleşmiyor',
    pleaseSelect: 'Lütfen seçin',
    noOptionsAvailable: 'Seçenek bulunmuyor',
    selectOption: 'Seçenek seçin'
  },

  // Notifications
  notifications: {
    title: 'Bildirimler',
    noNotifications: 'Bildirim bulunmuyor',
    markAsRead: 'Okundu olarak işaretle',
    markAllAsRead: 'Tümünü okundu olarak işaretle',
    deleteNotification: 'Bildirimi sil',
    newNotification: 'Yeni bildirim'
  },

  // Error messages
  errors: {
    generic: 'Bir hata oluştu',
    networkError: 'Ağ bağlantı hatası',
    serverError: 'Sunucu hatası',
    unauthorized: 'Bu işlem için yetkiniz bulunmuyor',
    notFound: 'Sayfa bulunamadı',
    forbidden: 'Erişim engellendi',
    validationError: 'Doğrulama hatası',
    requiredField: 'Bu alan zorunludur',
    invalidInput: 'Geçersiz veri girişi'
  },

  // Success messages
  success: {
    created: 'Başarıyla oluşturuldu',
    updated: 'Başarıyla güncellendi',
    deleted: 'Başarıyla silindi',
    saved: 'Başarıyla kaydedildi',
    sent: 'Başarıyla gönderildi',
    uploaded: 'Başarıyla yüklendi',
    downloaded: 'Başarıyla indirildi'
  },

  // Date and time
  dateTime: {
    today: 'Bugün',
    yesterday: 'Dün',
    tomorrow: 'Yarın',
    thisWeek: 'Bu Hafta',
    thisMonth: 'Bu Ay',
    thisYear: 'Bu Yıl',
    date: 'Tarih',
    time: 'Saat',
    dateTime: 'Tarih/Saat',
    selectDate: 'Tarih Seçin',
    selectTime: 'Saat Seçin'
  },

  // Calendar
  calendar: {
    title: 'Takvim',
    description: 'Görevleri ve son tarihleri tarihe göre görüntüleyin',
    selectDate: 'Bir tarih seçin',
    noTasksForDate: 'Bu tarih için görev bulunmuyor',
    clickDateToView: 'Görevleri görüntülemek için bir tarihe tıklayın',
    phases: 'Aşamalar',
    progress: 'İlerleme',
  },

  // Workload
  workload: {
    title: 'Takım İş Yükü Yönetimi',
    description: 'Takım kapasitesini izleyin, müsaitliği kontrol edin ve görevleri verimli şekilde atayın',
    exportReport: 'Rapor Dışa Aktar',
    filters: 'Filtreler',
    department: 'Departman',
    allDepartments: 'Tüm Departmanlar',
    searchUsers: 'Kullanıcı Ara',
    searchPlaceholder: 'İsim veya e-posta ile ara...',
    clearFilters: 'Filtreleri Temizle',
    analysis: 'İş Yükü Analizi',
    available: 'Müsait (0-50%)',
    moderate: 'Orta (50-70%)',
    busy: 'Meşgul (70-90%)',
    critical: 'Kritik (90-100%)',
    overloaded: 'Aşırı Yüklenmiş (100%+)',
    stats: {
      totalUsers: 'Toplam Kullanıcılar',
      avgUtilization: 'Ortalama Kullanım',
      available: 'Müsait',
      availableDesc: 'Yeni görevler için hazır',
      busy: 'Meşgul',
      busyDesc: 'Yüksek iş yükü (70-90%)',
      overloaded: 'Aşırı Yüklenmiş',
      overloadedDesc: 'Kritik iş yükü (>90%)',
    }
  }
}

export function t(key: string): string {
  const keys = key.split('.')
  let value: any = translations
  
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
  }
  
  return value
}

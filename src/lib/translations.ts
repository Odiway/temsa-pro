<<<<<<< HEAD
// Turkish translations for TemSafy Pro
export const translations = {
  // Common terms
  common: {
=======
const translations = {
  // General
  general: {
    loading: 'Yükleniyor...',
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    add: 'Ekle',
<<<<<<< HEAD
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
    created: 'Oluşturuldu',
    viewCalendar: 'Takvimi Görüntüle'
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

  // Real-time synchronization
  sync: {
    title: 'Senkronizasyon Durumu',
    status: 'Durum',
    connected: 'Bağlı',
    disconnected: 'Bağlantı Kesildi',
    syncing: 'Senkronize Ediliyor',
    error: 'Hata',
    justNow: 'Şimdi',
    minutesAgo: 'dakika önce',
    hoursAgo: 'saat önce',
    lastUpdate: 'Son Güncelleme',
    errorMessage: 'Hata Mesajı',
    connectedDetails: 'Sistem gerçek zamanlı olarak senkronize ediliyor',
    disconnectedDetails: 'Bağlantı kesildi, lütfen sayfayı yenileyin',
    syncingDetails: 'Veriler güncelleniyor...',
    errorDetails: 'Senkronizasyon hatası oluştu',
  },

  // Notifications
  notifications: {
    title: 'Bildirimler',
    noNotifications: 'Bildirim bulunmuyor',
    markAsRead: 'Okundu olarak işaretle',
    markAllAsRead: 'Tümünü okundu olarak işaretle',
    deleteNotification: 'Bildirimi sil',
    newNotification: 'Yeni bildirim',
    projectCreated: 'Yeni proje oluşturuldu',
    projectUpdated: 'Proje güncellendi',
    projectDeleted: 'Proje silindi',
    projectAssigned: 'Projeye atandınız',
    taskCreated: 'Yeni görev oluşturuldu',
    taskUpdated: 'Görev güncellendi',
    taskDeleted: 'Görev silindi',
    taskAssigned: 'Size yeni görev atandı',
    userCreated: 'Yeni kullanıcı eklendi',
    userUpdated: 'Kullanıcı güncellendi',
    userDeleted: 'Kullanıcı silindi',
    userAssigned: 'Kullanıcı atandı',
    departmentCreated: 'Yeni departman oluşturuldu',
    departmentUpdated: 'Departman güncellendi',
    departmentDeleted: 'Departman silindi',
    departmentAssigned: 'Departmana atandınız'
  },

  // Teams
  teams: {
    title: 'Takım Yönetimi',
    team: 'Takım',
    teams: 'Takımlar',
    manage: 'Takımı Yönet',
    teamMembers: 'Takım Üyeleri',
    addMember: 'Üye Ekle',
    removeMember: 'Üye Çıkar'
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
=======
    update: 'Güncelle',
    create: 'Oluştur',
    view: 'Görüntüle',
    back: 'Geri',
    search: 'Ara',
    filter: 'Filtrele',
    clear: 'Temizle',
    close: 'Kapat',
    yes: 'Evet',
    no: 'Hayır',
    confirm: 'Onayla',
    warning: 'Uyarı',
    error: 'Hata',
    success: 'Başarılı',
    name: 'Ad',
    description: 'Açıklama',
    title: 'Başlık',
    status: 'Durum',
    priority: 'Öncelik',
    type: 'Tür'
  },

  // Auth
  auth: {
    signIn: 'Giriş Yap',
    signOut: 'Çıkış Yap',
    email: 'E-posta',
    password: 'Şifre',
    login: 'Giriş',
    welcome: 'Hoş geldiniz'
  },

  // Users
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
  users: {
    title: 'Kullanıcı Yönetimi',
    user: 'Kullanıcı',
    users: 'Kullanıcılar',
    addUser: 'Kullanıcı Ekle',
    editUser: 'Kullanıcı Düzenle',
    deleteUser: 'Kullanıcı Sil',
<<<<<<< HEAD
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
=======
    firstName: 'Ad',
    lastName: 'Soyad',
    email: 'E-posta',
    phone: 'Telefon',
    role: 'Rol',
    department: 'Departman'
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
  },

  // Projects
  projects: {
    title: 'Proje Yönetimi',
<<<<<<< HEAD
    description: 'Projeleri yönetin ve ilerlemeyi takip edin',
=======
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
    project: 'Proje',
    projects: 'Projeler',
    addProject: 'Proje Ekle',
    editProject: 'Proje Düzenle',
    deleteProject: 'Proje Sil',
    createProject: 'Yeni Proje Oluştur',
<<<<<<< HEAD
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
=======
    projectName: 'Proje Adı',
    projectDescription: 'Proje Açıklaması',
    projectManager: 'Proje Yöneticisi',
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
    projectCreated: 'Proje başarıyla oluşturuldu',
    projectUpdated: 'Proje başarıyla güncellendi',
    projectDeleted: 'Proje başarıyla silindi'
  },

<<<<<<< HEAD
  // Project status
  projectStatus: {
    DRAFT: 'Taslak',
    PLANNING: 'Planlama',
    ACTIVE: 'Aktif',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal Edildi'
  },

=======
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
  // Tasks
  tasks: {
    title: 'Görev Yönetimi',
    task: 'Görev',
    tasks: 'Görevler',
<<<<<<< HEAD
    myTasks: 'Görevlerim',
    fieldDescription: 'Atanmış görev aşamalarınız ve mevcut ilerleme',
=======
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
    addTask: 'Görev Ekle',
    editTask: 'Görev Düzenle',
    deleteTask: 'Görev Sil',
    createTask: 'Yeni Görev Oluştur',
<<<<<<< HEAD
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
=======
    taskTitle: 'Görev Başlığı',
    taskDescription: 'Görev Açıklaması',
    assignedTo: 'Atanan',
    dueDate: 'Son Tarih',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    estimatedHours: 'Tahmini Süre (Saat)',
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
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

<<<<<<< HEAD
=======
  // Task phase status
  taskPhaseStatus: {
    PENDING: 'Beklemede',
    IN_PROGRESS: 'Devam Ediyor',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal Edildi'
  },

  // Feedback types
  feedbackType: {
    GENERAL: 'Genel',
    ISSUE: 'Sorun',
    SUGGESTION: 'Öneri',
    PROGRESS_UPDATE: 'İlerleme Güncellemesi'
  },

  // Feedback status
  feedbackStatus: {
    PENDING: 'Beklemede',
    REVIEWED: 'İncelendi',
    RESOLVED: 'Çözüldü'
  },

  // Feedback priority
  feedbackPriority: {
    LOW: 'Düşük',
    MEDIUM: 'Orta',
    HIGH: 'Yüksek'
  },

>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
  // Task priority
  taskPriority: {
    LOW: 'Düşük',
    MEDIUM: 'Orta',
    HIGH: 'Yüksek',
<<<<<<< HEAD
    URGENT: 'Acil'
=======
    CRITICAL: 'Kritik'
  },

  // Task phases
  taskPhases: {
    title: 'Görev Aşamaları',
    phase: 'Aşama',
    phases: 'Aşamalar',
    addPhase: 'Aşama Ekle',
    editPhase: 'Aşama Düzenle',
    deletePhase: 'Aşama Sil',
    phaseName: 'Aşama Adı',
    phaseDescription: 'Aşama Açıklaması',
    phaseOrder: 'Sıra',
    estimatedDuration: 'Tahmini Süre',
    actualDuration: 'Gerçek Süre',
    phaseStatus: 'Aşama Durumu',
    startPhase: 'Aşamayı Başlat',
    completePhase: 'Aşamayı Tamamla',
    phaseProgress: 'Aşama İlerlemesi'
  },

  // Feedback system
  feedback: {
    title: 'Geri Bildirim',
    addFeedback: 'Geri Bildirim Ekle',
    sendFeedback: 'Geri Bildirim Gönder',
    feedbackMessage: 'Geri Bildirim Mesajı',
    feedbackType: 'Geri Bildirim Türü',
    progress: 'İlerleme',
    issue: 'Sorun',
    question: 'Soru',
    suggestion: 'Öneri',
    urgent: 'Acil',
    feedbackSent: 'Geri bildirim başarıyla gönderildi',
    noFeedback: 'Henüz geri bildirim bulunmuyor',
    replyToFeedback: 'Geri Bildirime Yanıt Ver',
    feedbackHistory: 'Geri Bildirim Geçmişi',
    feedbackSubmitted: 'Geri bildirim başarıyla gönderildi',
    feedbackPriority: 'Geri Bildirim Önceliği',
    enterMessage: 'Mesajınızı girin...',
    type: 'Tür'
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
  },

  // Departments
  departments: {
    title: 'Departman Yönetimi',
    description: 'Organizasyonel departmanları yönetin',
    department: 'Departman',
    departments: 'Departmanlar',
    dashboard: 'Departman Panosu',
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
<<<<<<< HEAD
    invalidInput: 'Geçersiz veri girişi'
=======
    invalidInput: 'Geçersiz veri girişi',
    noDepartmentSelected: 'Departman seçilmedi - lütfen proje seçin veya departman bilginizi kontrol edin'
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
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
<<<<<<< HEAD
    progress: 'İlerleme',
=======
    progress: 'İlerleme'
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
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
<<<<<<< HEAD
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
=======
      overloadedDesc: 'Kritik iş yükü (>90%)'
    }
  }
};

export function t(key: string): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

export { translations };
export default translations;
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425

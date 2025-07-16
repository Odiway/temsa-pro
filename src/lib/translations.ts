const translations = {
  // General
  general: {
    loading: 'Yükleniyor...',
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    add: 'Ekle',
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
  users: {
    title: 'Kullanıcı Yönetimi',
    user: 'Kullanıcı',
    users: 'Kullanıcılar',
    addUser: 'Kullanıcı Ekle',
    editUser: 'Kullanıcı Düzenle',
    deleteUser: 'Kullanıcı Sil',
    firstName: 'Ad',
    lastName: 'Soyad',
    email: 'E-posta',
    phone: 'Telefon',
    role: 'Rol',
    department: 'Departman'
  },

  // Projects
  projects: {
    title: 'Proje Yönetimi',
    project: 'Proje',
    projects: 'Projeler',
    addProject: 'Proje Ekle',
    editProject: 'Proje Düzenle',
    deleteProject: 'Proje Sil',
    createProject: 'Yeni Proje Oluştur',
    projectName: 'Proje Adı',
    projectDescription: 'Proje Açıklaması',
    projectManager: 'Proje Yöneticisi',
    projectCreated: 'Proje başarıyla oluşturuldu',
    projectUpdated: 'Proje başarıyla güncellendi',
    projectDeleted: 'Proje başarıyla silindi'
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
    taskTitle: 'Görev Başlığı',
    taskDescription: 'Görev Açıklaması',
    assignedTo: 'Atanan',
    dueDate: 'Son Tarih',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    estimatedHours: 'Tahmini Süre (Saat)',
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

  // Task priority
  taskPriority: {
    LOW: 'Düşük',
    MEDIUM: 'Orta',
    HIGH: 'Yüksek',
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
    invalidInput: 'Geçersiz veri girişi',
    noDepartmentSelected: 'Departman seçilmedi - lütfen proje seçin veya departman bilginizi kontrol edin'
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
    progress: 'İlerleme'
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

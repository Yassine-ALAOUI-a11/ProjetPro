import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  FR: {
    translation: {
      "header": {
        "agency": "Agence de Développement du Digital",
        "participation": "Participation Citoyenne",
        "home": "Accueil",
        "consultations": "Contributions",
        "petitions": "e-Pétitions",
        "surveys": "Sondages",
        "notifications": "Actualités & Notifications",
        "no_news": "Aucune nouvelle actualité.",
        "login": "Contribuer"
      },
      "home": {
        "official_platform": "Plateforme officielle de l'ADD — Maroc",
        "hero_title": "Votre voix compte",
        "hero_highlight": "dans le digital",
        "hero_subtitle": "Soumettez vos idées, suggestions et feedback sur les services numériques de l'ADD. Ensemble, façonnons une administration digitale plus efficace et proche des citoyens.",
        "btn_submit": "Soumettre ma contribution",
        "btn_view": "Voir les consultations",
        "citizens_count": "+4 200 citoyens",
        "already_contributed": "ont déjà contribué",
        "stat_total": "Contributions totales",
        "stat_processed": "Dossiers traités",
        "stat_rate": "Taux de réponse",
        "news_title": "Dernières actualités",
        "news_subtitle": "Découvrez les récentes contributions traitées par nos équipes.",
        "see_all": "Voir tout",
        "processed": "Traité",
        "days_ago": "Il y a 2 jours",
        "news_card_title": "Simplification de la procédure de demande de signature électronique",
        "news_card_desc": "Suite à de nombreuses requêtes, l'ADD a simplifié le processus en ligne pour l'obtention de la signature électronique pour les TPE/PME.",
        "read_more": "Lire la suite"
      },
      "dashboard": {
        "title": "Mes Contributions",
        "subtitle": "Suivez l'état de vos requêtes et soumettez de nouvelles idées.",
        "create_btn": "Créer une contribution",
        "history": "Historique",
        "no_contrib": "Aucune contribution pour le moment.",
        "status_waiting": "En attente",
        "status_process": "En cours",
        "status_done": "Traité"
      },
      "auth": {
        "login_title": "Contribuer",
        "register_title": "Créer un compte",
        "email": "Adresse e-mail",
        "password": "Mot de passe",
        "firstname": "Prénom",
        "lastname": "Nom",
        "btn_login": "Se connecter",
        "btn_register": "S'inscrire",
        "no_account": "Pas de compte ?",
        "already_account": "Déjà un compte ?"
      },
      "footer": {
        "description": "La plateforme citoyenne officielle de l'Agence de Développement du Digital du Maroc. Ensemble, façonnons l'administration digitale de demain.",
        "platform": "Plateforme",
        "home": "Accueil",
        "consultations": "Contributions",
        "petitions": "e-Pétitions",
        "surveys": "Sondages",
        "participate": "Participer",
        "submit_idea": "Soumettre une idée",
        "my_space": "Mon espace",
        "guide": "Guide d'utilisation",
        "legal": "Légal & Contact",
        "contact_us": "Nous contacter",
        "terms": "Conditions d'utilisation",
        "privacy": "Confidentialité & CNDP",
        "copyright": "© 2026 e-participation — ADD Maroc. Tous droits réservés."
      }
    }
  },
  EN: {
    translation: {
      "header": {
        "agency": "Digital Development Agency",
        "participation": "Citizen Participation",
        "home": "Home",
        "consultations": "Contributions",
        "petitions": "e-Petitions",
        "surveys": "Surveys",
        "notifications": "News & Notifications",
        "no_news": "No recent news.",
        "login": "Contribute"
      },
      "home": {
        "official_platform": "Official Platform of ADD — Morocco",
        "hero_title": "Your voice matters",
        "hero_highlight": "in digital",
        "hero_subtitle": "Submit your ideas, suggestions, and feedback on ADD's digital services. Together, let's shape a more efficient digital administration closer to citizens.",
        "btn_submit": "Submit my contribution",
        "btn_view": "View consultations",
        "citizens_count": "+4,200 citizens",
        "already_contributed": "have already contributed",
        "stat_total": "Total Contributions",
        "stat_processed": "Processed Cases",
        "stat_rate": "Response Rate",
        "news_title": "Latest News",
        "news_subtitle": "Discover recent contributions processed by our teams.",
        "see_all": "See all",
        "processed": "Processed",
        "days_ago": "2 days ago",
        "news_card_title": "Simplification of electronic signature procedure",
        "news_card_desc": "Following numerous requests, ADD has simplified the online process for obtaining electronic signatures.",
        "read_more": "Read more"
      },
      "dashboard": {
        "title": "My Contributions",
        "subtitle": "Track your requests and submit new ideas.",
        "create_btn": "Create Contribution",
        "history": "History",
        "no_contrib": "No contributions yet.",
        "status_waiting": "Pending",
        "status_process": "In Progress",
        "status_done": "Processed"
      },
      "auth": {
        "login_title": "Contribute",
        "register_title": "Create Account",
        "email": "Email Address",
        "password": "Password",
        "firstname": "First Name",
        "lastname": "Last Name",
        "btn_login": "Login",
        "btn_register": "Sign Up",
        "no_account": "No account?",
        "already_account": "Already have an account?"
      },
      "footer": {
        "description": "The official citizen platform of the Digital Development Agency of Morocco. Together, let's shape the digital administration of tomorrow.",
        "platform": "Platform",
        "home": "Home",
        "consultations": "Contributions",
        "petitions": "e-Petitions",
        "surveys": "Surveys",
        "participate": "Participate",
        "submit_idea": "Submit an idea",
        "my_space": "My space",
        "guide": "User Guide",
        "legal": "Legal & Contact",
        "contact_us": "Contact us",
        "terms": "Terms of use",
        "privacy": "Privacy & CNDP",
        "copyright": "© 2026 e-participation — ADD Morocco. All rights reserved."
      }
    }
  },
  AR: {
    translation: {
      "header": {
        "agency": "وكالة التنمية الرقمية",
        "participation": "المشاركة المواطنة",
        "home": "الرئيسية",
        "consultations": "المساهمات",
        "petitions": "العرائض الإلكترونية",
        "surveys": "الاستطلاعات",
        "notifications": "الأخبار والإشعارات",
        "no_news": "لا توجد أخبار حديثة.",
        "login": "مساهمة"
      },
      "home": {
        "official_platform": "المنصة الرسمية لوكالة التنمية الرقمية — المغرب",
        "hero_title": "صوتك مهم",
        "hero_highlight": "في المجال الرقمي",
        "hero_subtitle": "قدم أفكارك واقتراحاتك وملاحظاتك حول الخدمات الرقمية لوكالة التنمية الرقمية. معًا، لنشكل إدارة رقمية أكثر كفاءة وقربًا من المواطنين.",
        "btn_submit": "تقديم مساهمتي",
        "btn_view": "عرض الاستشارات",
        "citizens_count": "+4,200 مواطن",
        "already_contributed": "ساهموا بالفعل",
        "stat_total": "إجمالي المساهمات",
        "stat_processed": "الملفات المعالجة",
        "stat_rate": "معدل الاستجابة",
        "news_title": "آخر الأخبار",
        "news_subtitle": "اكتشف المساهمات الأخيرة التي عالجتها فرقنا.",
        "see_all": "عرض الكل",
        "processed": "تمت المعالجة",
        "days_ago": "منذ يومين",
        "news_card_title": "تبسيط إجراءات طلب التوقيع الإلكتروني",
        "news_card_desc": "استجابة للعديد من الطلبات، قامت وكالة التنمية الرقمية بتبسيط العملية عبر الإنترنت.",
        "read_more": "اقرأ المزيد"
      },
      "dashboard": {
        "title": "مساهماتي",
        "subtitle": "تتبع حالة طلباتك وقدم أفكارًا جديدة.",
        "create_btn": "إنشاء مساهمة",
        "history": "السجل",
        "no_contrib": "لا توجد مساهمات حاليا.",
        "status_waiting": "في الانتظار",
        "status_process": "قيد المعالجة",
        "status_done": "تمت المعالجة"
      },
      "auth": {
        "login_title": "مساهمة",
        "register_title": "إنشاء حساب",
        "email": "البريد الإلكتروني",
        "password": "كلمة المرور",
        "firstname": "الاسم الشخصي",
        "lastname": "الاسم العائلي",
        "btn_login": "دخول",
        "btn_register": "تسجيل",
        "no_account": "ليس لديك حساب؟",
        "already_account": "لديك حساب بالفعل؟"
      },
      "footer": {
        "description": "المنصة الرسمية للمواطنين التابعة لوكالة التنمية الرقمية بالمغرب. معًا، لنشكل الإدارة الرقمية لغد أفضل.",
        "platform": "المنصة",
        "home": "الرئيسية",
        "consultations": "المساهمات",
        "petitions": "العرائض الإلكترونية",
        "surveys": "الاستطلاعات",
        "participate": "شارك",
        "submit_idea": "تقديم فكرة",
        "my_space": "فضائي",
        "guide": "دليل الاستخدام",
        "legal": "قانوني واتصال",
        "contact_us": "اتصل بنا",
        "terms": "شروط الاستخدام",
        "privacy": "الخصوصية واللجنة الوطنية",
        "copyright": "© 2026 المشاركة الإلكترونية — وكالة التنمية الرقمية. جميع الحقوق محفوظة."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'FR',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

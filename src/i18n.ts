import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      header: {
        subtitle: "PvP Arena",
        archive: "Архив Знаний",
        leaderboard: "Рейтинг",
        guest: "Гость",
        home_title: "На главную",
        login_btn: "Войти"
      },
      landing: {
        badge: "MathLab PvP v1.0",
        title_1: "Подготовка к ЕНТ",
        title_2: "нового поколения",
        desc: "Забудь про скучные учебники. Прокачивай своего персонажа, сражайся с друзьями на PvP-арене и участвуй в школьных турнирах.",
        btn_demo: "Попробовать Демо",
        btn_login: "Войти в аккаунт",
        feat1_title: "PvP Битвы",
        feat1_desc: "Вызывай друзей на дуэль и докажи, кто лучше знает математику.",
        feat2_title: "Живой Питомец",
        feat2_desc: "Найди суриката, ухаживай за ним и получай подсказки в решении.",
        feat3_title: "Турниры",
        feat3_desc: "Участвуй в классных и школьных турнирах с реальной сеткой.",
        copied: "Скопировано!"
      },
      auth: {
        login_title: "Вход в систему",
        register_title: "Регистрация нового сотрудника",
        username: "Имя пользователя",
        email: "Email",
        password: "Пароль",
        agree_text: "Я соглашаюсь с",
        terms: "Правилами использования",
        and: "и",
        privacy: "Политикой конфиденциальности",
        btn_login: "Войти в систему",
        btn_register: "Зарегистрироваться",
        btn_loading: "Обработка...",
        switch_to_reg: "Нет аккаунта? Зарегистрируйтесь",
        switch_to_login: "Уже есть аккаунт? Войдите",
        footer: "Научный центр математических исследований",
        error_agree: "Необходимо принять условия соглашения",
        error_name: "Имя пользователя обязательно"
      }
    }
  },
  kk: {
    translation: {
      header: {
        subtitle: "PvP Аренасы",
        archive: "Білім мұрағаты",
        leaderboard: "Рейтинг",
        guest: "Қонақ",
        home_title: "Басты бетке",
        login_btn: "Кіру"
      },
      landing: {
        badge: "MathLab PvP v1.0",
        title_1: "ҰБТ-ға дайындық",
        title_2: "жаңа форматта",
        desc: "Іш пыстыратын оқулықтарды ұмыт. Кейіпкеріңді дамыт, достарыңмен PvP-аренада шайқас және мектеп турнирлеріне қатыс.",
        btn_demo: "Демо нұсқасын көру",
        btn_login: "Аккаунтқа кіру",
        feat1_title: "PvP Шайқастар",
        feat1_desc: "Достарыңды дуэльге шақыр және математиканы кім жақсы білетінін дәлелде.",
        feat2_title: "Тірі Үй Жануары",
        feat2_desc: "Сурикатты тап, оған қамқор бол және есеп шығаруда көмек ал.",
        feat3_title: "Турнирлер",
        feat3_desc: "Нақты турнирлік кестесі бар сынып және мектеп турнирлеріне қатыс.",
        copied: "Көшірілді!"
      },
      auth: {
        login_title: "Жүйеге кіру",
        register_title: "Жаңа қызметкерді тіркеу",
        username: "Қолданушы аты",
        email: "Email",
        password: "Құпия сөз",
        agree_text: "Мен келісемін",
        terms: "Қолдану ережелерімен",
        and: "және",
        privacy: "Құпиялылық саясатымен",
        btn_login: "Жүйеге кіру",
        btn_register: "Тіркелу",
        btn_loading: "Өңделуде...",
        switch_to_reg: "Аккаунтыңыз жоқ па? Тіркеліңіз",
        switch_to_login: "Аккаунтыңыз бар ма? Кіріңіз",
        footer: "Математикалық зерттеулердің ғылыми орталығы",
        error_agree: "Келісім шарттарын қабылдау қажет",
        error_name: "Қолданушы аты міндетті"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('app_lang') || 'ru',
    fallbackLng: 'ru',
    interpolation: { escapeValue: false }
  });

export default i18n;
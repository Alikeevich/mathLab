import { evaluate } from 'mathjs';

/**
 * Превращает математическую строку (LaTeX или человеческую) в формат, понятный mathjs
 * Пример: "8\sqrt{3}" -> "8*sqrt(3)"
 */
function normalizeForCalculation(str: string): string {
  if (!str) return '';
  let s = str.toLowerCase().trim();
  
  // 1. Предварительная очистка
  s = s.replace(/\s+/g, ''); // Убираем пробелы
  s = s.replace(/,/g, '.');  // Запятые в точки

  // 2. Замена символов
  s = s.replace(/√/g, 'sqrt');
  s = s.replace(/π/g, 'pi');
  s = s.replace(/°/g, 'deg');
  s = s.replace(/×/g, '*');
  s = s.replace(/⋅/g, '*');
  s = s.replace(/:/g, '/'); // Двоеточие как деление

  // 3. Обработка LaTeX
  // Дроби: \frac{a}{b} -> (a)/(b)
  s = s.replace(/\\frac\{(.+?)\}\{(.+?)\}/g, '(($1)/($2))');
  // Корни: \sqrt{3} -> sqrt(3), \sqrt[3]{8} -> nthRoot(8, 3) (если mathjs поддерживает) или просто sqrt
  s = s.replace(/\\sqrt\{(.+?)\}/g, 'sqrt($1)');
  s = s.replace(/\\sqrt/g, 'sqrt');
  // Пи, умножение
  s = s.replace(/\\pi/g, 'pi');
  s = s.replace(/\\cdot/g, '*');
  // Убираем LaTeX скобки { }
  s = s.replace(/\{/g, '(').replace(/\}/g, ')');
  // Убираем слеши
  s = s.replace(/\\/g, '');

  // 4. Неявное умножение (Implicit Multiplication)
  // Если цифра стоит перед буквой, скобкой или sqrt (2x, 2(x), 2sqrt) -> 2*...
  s = s.replace(/(\d)(?=[a-z\(]|sqrt|pi)/g, '$1*');
  
  // Если закрывающая скобка перед цифрой/буквой )2 -> )*2
  s = s.replace(/\)(?=[\d a-z])/g, ')*');

  // Если sqrt3 (без скобок) -> sqrt(3)
  s = s.replace(/sqrt(\d+(\.\d+)?)/g, 'sqrt($1)');

  return s;
}

/**
 * Разворачивает строку с вариантами ответов в массив строк для вычисления.
 * Обрабатывает ";" (список) и "±" (плюс-минус).
 * Пример: "2; 5 ± 1" -> ["2", "5+1", "5-1"]
 */
function expandOptions(str: string): string[] {
  // 1. Сначала разбиваем по точке с запятой (независимые ответы)
  const parts = str.split(';');
  const results: string[] = [];

  for (let part of parts) {
    part = part.trim();
    if (!part) continue;

    // Нормализуем символы +- в ±
    part = part.replace(/\+-/g, '±');

    // 2. Обрабатываем ±
    if (part.includes('±')) {
      // Ищем позицию знака. 
      // Поддерживаем только один ± на выражение (для ЕНТ этого достаточно)
      // Пример: "2 ± sqrt(3)"
      const [left, right] = part.split('±');
      
      if (left === '') {
         // Случай "±5" -> "+5", "-5"
         results.push(right);
         results.push(`-${right}`);
      } else {
         // Случай "2 ± 3" -> "2 + 3", "2 - 3"
         results.push(`${left}+(${right})`);
         results.push(`${left}-(${right})`);
      }
    } else {
      results.push(part);
    }
  }
  return results;
}

export function checkAnswer(userAnswer: string, dbAnswer: string): boolean {
  if (!userAnswer) return false;

  try {
    // 1. Разворачиваем ответы (превращаем ± в два числа, ; в список)
    const userExprs = expandOptions(userAnswer);
    const dbExprs = expandOptions(dbAnswer);

    // Функция для безопасного вычисления
    const calculate = (expr: string): number => {
      try {
        const norm = normalizeForCalculation(expr);
        const res = evaluate(norm);
        // Проверяем, что результат - число (не комплексное, не матрица)
        if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
          return res;
        }
        return NaN;
      } catch (e) {
        return NaN;
      }
    };

    // 2. Вычисляем значения
    const userValues = userExprs.map(calculate).filter(n => !isNaN(n)).sort((a, b) => a - b);
    const dbValues = dbExprs.map(calculate).filter(n => !isNaN(n)).sort((a, b) => a - b);

    // Если удалось вычислить числа — сравниваем математически
    if (userValues.length > 0 && dbValues.length > 0) {
      // Если количество чисел не совпадает — сразу нет (например, уравнение имеет 2 корня, а ввели 1)
      if (userValues.length !== dbValues.length) return false;

      // Сравниваем каждое число с погрешностью
      return userValues.every((uVal, i) => {
        const dVal = dbValues[i];
        // Относительная погрешность для больших чисел или фикс. 0.05 для малых
        const tolerance = Math.max(0.05, Math.abs(dVal * 0.001)); 
        return Math.abs(uVal - dVal) <= tolerance;
      });
    }

    // 3. Fallback: Текстовое сравнение
    // Если mathjs не смог посчитать (например "x > 5" или текст), 
    // нормализуем строки и сравниваем их как текст.
    const normUser = userExprs.map(normalizeForCalculation).sort().join(';');
    const normDb = dbExprs.map(normalizeForCalculation).sort().join(';');
    
    return normUser === normDb;

  } catch (e) {
    console.error("Check error:", e);
    // Самый последний фоллбэк - тупое сравнение очищенных строк
    const clean = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
    return clean(userAnswer) === clean(dbAnswer);
  }
}
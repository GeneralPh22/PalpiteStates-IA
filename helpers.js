export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randF(min, max, d = 1) {
  return parseFloat(
    (Math.random() * (max - min) + min).toFixed(d)
  );
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function todayPT() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

export function isLiveS(s) {
  return ["1H", "2H", "HT", "LIVE"].includes(s);
}

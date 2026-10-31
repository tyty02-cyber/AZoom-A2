/* ==========================================================
   AZoom Car Rental - shared logic
   ========================================================== */

const KEY = "azoom_bookings";
const FLOW = ["Reserved", "Rented", "Returned", "Inspected", "Paid"];

function load() {
  let saved = JSON.parse(localStorage.getItem(KEY) || "null");
  if (!saved) {
    saved = JSON.parse(JSON.stringify(SEED));
    localStorage.setItem(KEY, JSON.stringify(saved));
  }
  return saved;
}

let bookings = load();

function save() {
  localStorage.setItem(KEY, JSON.stringify(bookings));
}

const car = id => CARS.find(c => c.id === id);
const money = n => "$" + Number(n).toFixed(2);
const findBooking = id => bookings.find(b => b.id === id.trim().toUpperCase());
const isBusy = carId => bookings.some(b => b.carId === carId && b.status !== "Paid");

/* ---------- NEW: dates and pick-up location ---------- */

// Add n days to a date written as "YYYY-MM-DD", and give back the same format
function addDays(dateText, n) {
  const d = new Date(dateText + "T00:00:00");
  d.setDate(d.getDate() + n);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// Number of days from one "YYYY-MM-DD" date to another
function daysBetween(startText, endText) {
  const ms = new Date(endText + "T00:00:00") - new Date(startText + "T00:00:00");
  return Math.round(ms / 86400000);
}

// Where a booking is collected. Older bookings have no pick-up, so they use the first location.
const pickupOf = b => b.pickup || CAR_PARKS[0];

function bill(b) {
  const rent = car(b.carId).rate * b.days;
  const damage = b.damageFee || 0;
  return { rent, damage, total: rent + damage };
}

function newId() {
  let id;
  do {
    id = "AZ" + Math.floor(1000 + Math.random() * 9000);
  } while (findBooking(id));
  return id;
}

function luhn(number) {
  number = number.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(number)) return false;
  let sum = 0, double = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = +number[i];
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function validExpiry(value) {
  const match = value.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);

  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);

  const expiryDate = new Date(year, month, 0, 23, 59, 59);

  return expiryDate >= new Date();
}

function progress(status) {
  const current = FLOW.indexOf(status);
  const steps = FLOW.map((step, i) =>
    `<div class="step ${i <= current ? "done" : ""}">${step}</div>`
  ).join("");
  return `<div class="steps" aria-label="Booking progress">${steps}</div>`;
}

function toast(text) {
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

const esc = s => String(s).replace(/[&<>"']/g, ch =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

/* ---------- Accounts ---------- */
const USERS_KEY = "azoom_users";
const CUSTOMER_KEY = "azoom_customer";
const STAFF_KEY = "azoom_staff";

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const saveUsers = users => localStorage.setItem(USERS_KEY, JSON.stringify(users));

function currentCustomer() {
  const email = sessionStorage.getItem(CUSTOMER_KEY);
  return getUsers().find(u => u.email === email) || null;
}

function currentStaff() {
  return sessionStorage.getItem(STAFF_KEY) || null;
}

const bookingsFor = email => bookings.filter(b => (b.email || "").toLowerCase() === email.toLowerCase());

async function hashPassword(password, salt) {
  if (!window.crypto || !crypto.subtle) return "plain:" + salt + password;
  const bytes = new TextEncoder().encode(salt + password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function createAccount(name, email, password) {
  const users = getUsers();
  email = email.trim().toLowerCase();
  if (users.some(u => u.email === email)) return null;
  const salt = Math.random().toString(36).slice(2);
  const user = { name: name.trim(), email, salt, hash: await hashPassword(password, salt) };
  users.push(user);
  saveUsers(users);
  sessionStorage.setItem(CUSTOMER_KEY, email);
  return user;
}

async function logInCustomer(email, password) {
  email = email.trim().toLowerCase();
  const user = getUsers().find(u => u.email === email);
  if (!user) return null;
  if (user.hash !== await hashPassword(password, user.salt)) return null;
  sessionStorage.setItem(CUSTOMER_KEY, email);
  return user;
}

function logInStaff(username, password) {
  const user = STAFF.find(s => s.username === username.trim() && s.password === password);
  if (!user) return null;
  sessionStorage.setItem(STAFF_KEY, user.name);
  return user;
}

function logOut() {
  sessionStorage.removeItem(CUSTOMER_KEY);
  sessionStorage.removeItem(STAFF_KEY);
}

/* ---------- Theme + Nav ---------- */
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("azoom_theme", theme);
}

const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(localStorage.getItem("azoom_theme") || (prefersDark ? "dark" : "light"));

document.addEventListener("DOMContentLoaded", () => {
  const themeButton = document.getElementById("theme");
  if (themeButton) {
    themeButton.onclick = () => {
      const dark = document.documentElement.dataset.theme === "dark";
      setTheme(dark ? "light" : "dark");
    };
  }

  // Dynamic account link + Staff visibility
  const accountLink = document.getElementById("accountLink");
  const staffNav = document.getElementById("staffNav");
  const me = currentCustomer();
  const staff = currentStaff();

  if (accountLink) {
    if (staff) {
      accountLink.textContent = "Log out (" + staff.split(" ")[0] + ")";
      accountLink.href = "#";
      accountLink.onclick = e => {
        e.preventDefault();
        logOut();
        location.href = "index.html";
      };
    } else if (me) {
      accountLink.textContent = "Log out (" + me.name.split(" ")[0] + ")";
      accountLink.href = "#";
      accountLink.onclick = e => {
        e.preventDefault();
        logOut();
        location.href = "index.html";
      };
    } else {
      accountLink.textContent = "Log in";
      accountLink.href = "login.html";
    }
  }

  // Only show Staff link when actually logged in as staff
  if (staffNav) {
    staffNav.style.display = staff ? "" : "none";
  }

  // Highlight current page
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("header nav a").forEach(link => {
    if (link.getAttribute("href") === page) link.classList.add("on");
  });
});

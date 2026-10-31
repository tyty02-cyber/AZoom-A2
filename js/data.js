/* ==========================================================
   AZoom Car Rental - pre-stored data (no database needed)
   ========================================================== */

// Cars available to rent – all electric
const CARS = [
  { id: 1, name: "Tesla Model 3",     type: "Sedan",   seats: 5, rate: 120, icon: "⚡", img: "images/model3.png" },
  { id: 2, name: "BYD Seal",          type: "Sedan",   seats: 5, rate: 105, icon: "⚡", img: "images/seal.png" },
  { id: 3, name: "Tesla Model Y",     type: "SUV",     seats: 5, rate: 155, icon: "⚡", img: "images/modely.png" },
  { id: 4, name: "Hyundai Ioniq 5",   type: "SUV",     seats: 5, rate: 145, icon: "⚡", img: "images/ioniq.avif" },
  { id: 5, name: "Kia EV9",           type: "SUV",     seats: 7, rate: 220, icon: "⚡", img: "images/ev9.avif" },
  { id: 6, name: "Mini Cooper SE",    type: "Compact", seats: 4, rate: 110, icon: "⚡", img: "images/cooper.avif" }
];

// Designated car parks where customers can return cars
const CAR_PARKS = [
  "AZoom Orchard Car Park",
  "AZoom Marina Bay Car Park",
];

// Damage types an employee can tick during inspection, and the fee for each
const DAMAGE_FEES = {
  "Scratches": 100,
  "Dents": 250,
  "Interior stains": 60,
  "Missing charge (below 80%)": 50,
  "Broken lights or mirrors": 150
};

// Demo bookings the site starts with
const SEED = [
  {
    id: "AZ1001",
    carId: 3,
    name: "Demo Customer",
    email: "demo@mail.com",
    days: 2,
    start: "2026-10-27",
    status: "Reserved",
    carPark: "",
    damageFee: 0,
    damages: []
  },
  {
    id: "AZ1002",
    carId: 5,
    name: "Sample Renter",
    email: "sample@mail.com",
    days: 3,
    start: "2026-10-24",
    status: "Rented",
    carPark: "",
    damageFee: 0,
    damages: []
  }
];

// Staff accounts for the Staff page.
// Demo only: a real site would check logins on a server and never keep passwords in the page.
const STAFF = [
  { username: "staff", password: "azoom123", name: "AZoom Staff" }
];
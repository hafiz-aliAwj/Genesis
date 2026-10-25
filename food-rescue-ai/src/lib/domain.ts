export type Role = "restaurant" | "ngo" | "volunteer";
export type Profile = {
  id: string;
  name: string;
  role: Role;
  location: string;
  lat: number;
  lng: number;
  capacity: number;
};
export type Donation = {
  id: string;
  restaurant_id: string;
  food_name: string;
  category: string;
  image_url: string;
  quantity: number;
  pickup_at: string;
  expires_at: string;
  location: string;
  lat: number;
  lng: number;
  description: string;
  status: "available" | "reserved" | "collected" | "completed";
  created_at: string;
};
export type Reservation = {
  id: string;
  donation_id: string;
  ngo_id: string;
  status: "reserved" | "completed";
};
export type Task = {
  id: string;
  donation_id: string;
  volunteer_id: string | null;
  status: "open" | "accepted" | "collected" | "delivered";
};
export type Point = {
  id: string;
  user_id: string;
  donation_id: string;
  amount: number;
  reason: string;
};
export type Notice = {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
};
export type Data = {
  users: Profile[];
  donations: Donation[];
  reservations: Reservation[];
  volunteer_tasks: Task[];
  points: Point[];
  notifications: Notice[];
};
export const categories = [
  "Prepared meals",
  "Bakery",
  "Produce",
  "Dairy",
  "Packaged food",
];
export function urgency(expiry: string, now = Date.now()) {
  const h = (+new Date(expiry) - now) / 3600000;
  return h <= 0 ? "Expired" : h <= 2 ? "High" : h <= 6 ? "Medium" : "Low";
}
export function distance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const r = Math.PI / 180,
    dlat = (b.lat - a.lat) * r,
    dlng = (b.lng - a.lng) * r;
  const x =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dlng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
export function match(d: Donation, n: Profile) {
  const km = distance(d, n);
  const distanceScore = Math.max(0, 1 - km / 30);
  const quantityScore = Math.min(n.capacity / d.quantity, 1);
  const urgencyScore =
    urgency(d.expires_at) === "High" ? Math.max(0, 1 - km / 10) : 0.8;
  return {
    km,
    score: Math.round(
      (distanceScore * 0.5 + quantityScore * 0.3 + urgencyScore * 0.2) * 100,
    ),
    distanceScore,
    quantityScore,
    urgencyScore,
  };
}
export const donationPoints = (q: number) => (q < 10 ? 10 : q < 30 ? 25 : 50);
export function impact(ds: Donation[]) {
  const meals = ds
    .filter((d) => d.status === "completed")
    .reduce((a, d) => a + d.quantity, 0);
  return {
    meals,
    kg: meals * 0.4,
    co2: meals * 0.4 * 2.5,
    score: Math.min(100, Math.round(meals / 5)),
  };
}
export function badge(role: Role, points: number) {
  if (role === "ngo") return "Community partner";
  return role === "restaurant"
    ? points >= 500
      ? "Platinum Donor"
      : points >= 150
        ? "Community Hero"
        : points >= 10
          ? "Food Saver"
          : "New partner"
    : points >= 300
      ? "Champion"
      : points >= 100
        ? "Rescuer"
        : points >= 10
          ? "Helper"
          : "New volunteer";
}
export function demoData(): Data {
  const now = Date.now(),
    date = (h: number) => new Date(now + h * 3600000).toISOString();
  const users: Profile[] = [
    {
      id: "demo-restaurant",
      name: "The Daily Table",
      role: "restaurant",
      location: "Clifton, Karachi",
      lat: 24.8138,
      lng: 67.0304,
      capacity: 50,
    },
    {
      id: "demo-ngo",
      name: "Dastarkhwan Collective",
      role: "ngo",
      location: "Saddar, Karachi",
      lat: 24.855,
      lng: 67.025,
      capacity: 80,
    },
    {
      id: "demo-volunteer",
      name: "Ayesha Khan",
      role: "volunteer",
      location: "DHA, Karachi",
      lat: 24.807,
      lng: 67.055,
      capacity: 20,
    },
    {
      id: "demo-restaurant-2",
      name: "Bread & Butter",
      role: "restaurant",
      location: "Bath Island, Karachi",
      lat: 24.829,
      lng: 67.032,
      capacity: 30,
    },
    {
      id: "demo-ngo-2",
      name: "Neighbourhood Kitchen",
      role: "ngo",
      location: "Clifton, Karachi",
      lat: 24.82,
      lng: 67.04,
      capacity: 30,
    },
  ];
  const rows = [
    [
      "Vegetable biryani",
      "Prepared meals",
      32,
      1.8,
      "Freshly prepared vegetable biryani, packed in individual containers. Contains dairy.",
      "demo-restaurant",
      "photo-1563379091339-03246963d96c",
    ],
    [
      "Sourdough & pastries",
      "Bakery",
      18,
      5,
      "Today’s bake: sourdough loaves and assorted pastries. Contains wheat, dairy and eggs.",
      "demo-restaurant-2",
      "photo-1509440159596-0249088772ff",
    ],
    [
      "Seasonal produce boxes",
      "Produce",
      24,
      14,
      "Mixed seasonal vegetables and fruit. Please bring reusable crates.",
      "demo-restaurant",
      "photo-1542838132-92c53300491e",
    ],
    [
      "Lunch bowls",
      "Prepared meals",
      42,
      -2,
      "Balanced rice and vegetable bowls.",
      "demo-restaurant",
      "photo-1512621776951-a57141f2eefd",
    ],
  ] as const;
  const donations: Donation[] = rows.map((r, i) => ({
    id: `demo-donation-${i}`,
    restaurant_id: r[5],
    food_name: r[0],
    category: r[1],
    quantity: r[2],
    expires_at: date(r[3]),
    pickup_at: date(-0.2),
    description: r[4],
    image_url: [
      "/images/biryani.jpg",
      "/images/bread.jpg",
      "/images/produce.jpg",
      "/images/bowls.jpg",
    ][i],
    location: users.find((u) => u.id === r[5])!.location,
    lat: users.find((u) => u.id === r[5])!.lat,
    lng: users.find((u) => u.id === r[5])!.lng,
    status: i === 3 ? "completed" : "available",
    created_at: date(-6),
  }));
  return {
    users,
    donations,
    reservations: [
      {
        id: "demo-reservation",
        donation_id: "demo-donation-3",
        ngo_id: "demo-ngo",
        status: "completed",
      },
    ],
    volunteer_tasks: [
      {
        id: "demo-task",
        donation_id: "demo-donation-3",
        volunteer_id: "demo-volunteer",
        status: "delivered",
      },
    ],
    points: [
      {
        id: "demo-point-1",
        user_id: "demo-restaurant",
        donation_id: "demo-donation-3",
        amount: 50,
        reason: "Donation completed",
      },
      {
        id: "demo-point-2",
        user_id: "demo-volunteer",
        donation_id: "demo-donation-3",
        amount: 25,
        reason: "Pickup and delivery",
      },
    ],
    notifications: [],
  };
}

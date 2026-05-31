// User credentials for Nebulist Platform
// In production, this should be stored in a secure database with hashed passwords

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: "admin" | "manager" | "staff";
  email: string;
}

export const users: User[] = [
  {
    id: "1",
    username: "admin@nebulist",
    password: "Nebulist2024!",
    name: "Admin Nebulist",
    role: "admin",
    email: "admin@nebulist.com"
  },
  {
    id: "2",
    username: "manager@nebulist",
    password: "Manager2024!",
    name: "Manager Nebulist",
    role: "manager",
    email: "manager@nebulist.com"
  },
  {
    id: "3",
    username: "staff@nebulist",
    password: "Staff2024!",
    name: "Staff Nebulist",
    role: "staff",
    email: "staff@nebulist.com"
  }
];

export const validateCredentials = (username: string, password: string): User | null => {
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

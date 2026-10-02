/**
 * AgriOptima AI - Lightweight Embedded Storage Service
 * Provides persistent database operations for Users, Farms, Plans, Scenarios, and Crops.
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { CropData } from './optimizer.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'agrioptima_db.json');
const CROPS_FILE = path.join(DATA_DIR, 'crops_knowledge.json');

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  location: string;
  land_area_ha: number;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  soil: {
    soil_type: string;
    pH: number;
    N: number;
    P: number;
    K: number;
    organic_matter?: number;
  };
  resources: {
    water_m3: number;
    fertilizer_kg: number;
    budget_usd: number;
  };
  weather: {
    temperature: number;
    rainfall: number;
    humidity: number;
  };
  created_at: string;
  updated_at: string;
}

export interface SavedPlan {
  id: string;
  farm_id: string;
  user_id: string;
  farm_name: string;
  plan_name: string;
  strategy: string;
  allocations: any[];
  summary: any;
  scenario_note?: string;
  created_at: string;
}

interface DatabaseSchema {
  users: User[];
  farms: Farm[];
  farm_plans: SavedPlan[];
  model_info: any;
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    farms: [],
    farm_plans: [],
    model_info: {
      version: 'v1.2.0-Production',
      trained_at: '2026-10-02T10:48:00Z',
      crop_accuracy: '80.8%',
      yield_r2: '0.9309'
    }
  };

  private cropsCache: CropData[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Load crops knowledge base
    if (fs.existsSync(CROPS_FILE)) {
      try {
        const raw = fs.readFileSync(CROPS_FILE, 'utf-8');
        this.cropsCache = JSON.parse(raw);
      } catch (err) {
        console.error('Error loading crops file:', err);
      }
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Error reading DB, re-seeding:', err);
      }
    }

    // Seed default demo user and farm
    this.seedDemoData();
    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save DB file:', err);
    }
  }

  private seedDemoData() {
    const demoPasswordHash = bcrypt.hashSync('demo123', 10);
    const demoUser: User = {
      id: 'usr_demo_01',
      email: 'farmer@agrioptima.ai',
      name: 'Ramesh Patel',
      password_hash: demoPasswordHash,
      created_at: new Date().toISOString()
    };

    const demoFarm1: Farm = {
      id: 'farm_greenacres_01',
      user_id: 'usr_demo_01',
      name: 'GreenAcres Sustainable Farm',
      location: 'Central Valley, Agro-Zone 4',
      land_area_ha: 15.0,
      season: 'Kharif',
      soil: {
        soil_type: 'Loam',
        pH: 6.6,
        N: 140,
        P: 45,
        K: 55,
        organic_matter: 1.8
      },
      resources: {
        water_m3: 85000,
        fertilizer_kg: 2200,
        budget_usd: 12000
      },
      weather: {
        temperature: 28.5,
        rainfall: 720,
        humidity: 68
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const demoFarm2: Farm = {
      id: 'farm_drylands_02',
      user_id: 'usr_demo_01',
      name: 'Dryland Sunshine Holding',
      location: 'Semi-Arid Basin, Sector 9',
      land_area_ha: 8.0,
      season: 'Rabi',
      soil: {
        soil_type: 'Sandy Loam',
        pH: 7.2,
        N: 90,
        P: 30,
        K: 40,
        organic_matter: 1.1
      },
      resources: {
        water_m3: 28000,
        fertilizer_kg: 850,
        budget_usd: 4800
      },
      weather: {
        temperature: 21.0,
        rainfall: 320,
        humidity: 50
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.data.users.push(demoUser);
    this.data.farms.push(demoFarm1, demoFarm2);
  }

  // Crops
  getCrops(): CropData[] {
    return this.cropsCache;
  }

  getCropById(id: string): CropData | undefined {
    return this.cropsCache.find(c => c.id === id);
  }

  // Users
  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(email: string, password: string, name: string): User {
    const existing = this.getUserByEmail(email);
    if (existing) {
      throw new Error('User with this email already exists.');
    }
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email,
      name,
      password_hash: bcrypt.hashSync(password, 10),
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // Farms
  getFarmsByUser(userId: string): Farm[] {
    return this.data.farms.filter(f => f.user_id === userId);
  }

  getFarmById(id: string): Farm | undefined {
    return this.data.farms.find(f => f.id === id);
  }

  createFarm(userId: string, farmData: Omit<Farm, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Farm {
    const newFarm: Farm = {
      id: `farm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      ...farmData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.farms.unshift(newFarm);
    this.save();
    return newFarm;
  }

  updateFarm(id: string, updates: Partial<Omit<Farm, 'id' | 'user_id' | 'created_at'>>): Farm | null {
    const idx = this.data.farms.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.data.farms[idx] = {
      ...this.data.farms[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.farms[idx];
  }

  deleteFarm(id: string): boolean {
    const prevLen = this.data.farms.length;
    this.data.farms = this.data.farms.filter(f => f.id !== id);
    // Also remove associated plans
    this.data.farm_plans = this.data.farm_plans.filter(p => p.farm_id !== id);
    this.save();
    return this.data.farms.length < prevLen;
  }

  // Farm Plans
  savePlan(userId: string, plan: Omit<SavedPlan, 'id' | 'user_id' | 'created_at'>): SavedPlan {
    const newPlan: SavedPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      ...plan,
      created_at: new Date().toISOString()
    };
    this.data.farm_plans.unshift(newPlan);
    this.save();
    return newPlan;
  }

  getPlansByUser(userId: string): SavedPlan[] {
    return this.data.farm_plans.filter(p => p.user_id === userId);
  }

  getPlanById(id: string): SavedPlan | undefined {
    return this.data.farm_plans.find(p => p.id === id);
  }

  deletePlan(id: string): boolean {
    const prev = this.data.farm_plans.length;
    this.data.farm_plans = this.data.farm_plans.filter(p => p.id !== id);
    this.save();
    return this.data.farm_plans.length < prev;
  }

  getModelInfo() {
    return this.data.model_info;
  }
}

export const db = new Database();

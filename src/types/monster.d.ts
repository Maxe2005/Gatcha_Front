export type MonsterStats = {
  hp: number;
  atk: number;
  def: number;
  vit: number;
};

export type MonsterSkillRatio = {
  stat: string;
  percent: number;
};

export type MonsterSkill = {
  name: string;
  description: string;
  damage?: number;
  ratio?: MonsterSkillRatio;
  cooldown?: number;
  cost?: number;
  level?: number;
  lvlMax?: number;
  rank?: string;
  icon?: string;
};

export type MonsterData = {
  id: string | number;
  nom: string;
  element: string;
  rang: string;
  level: number;
  experience?: number;
  stats: MonsterStats;
  description: string;
  skills: MonsterSkill[];
  invokedAt?: string;
};

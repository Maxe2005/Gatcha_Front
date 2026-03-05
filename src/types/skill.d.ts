import { Rank } from "../enums/ranks.enum";

export type MonsterSkillRatio = {
  stat: string;
  percent: number;
};

export type MonsterSkill = {
  name: string;
  description: string;
  damage: number;
  ratio: MonsterSkillRatio;
  cooldown: number;
  cost?: number;
  level?: number;
  lvlMax: number;
  rank: Rank;
  icon?: string;
  imageUrl?: string;
};

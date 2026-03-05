import { Element } from "../enums/elements.enum";
import { Rank } from "../enums/ranks.enum";
import { MonsterSkill } from "./skill";

export type MonsterStats = {
  hp: number;
  atk: number;
  def: number;
  vit: number;
};

export type MonsterData = {
  id: string | number;
  name: string;
  element: Element;
  rank: Rank;
  level: number;
  stats: MonsterStats;
  description: string;
  skills: MonsterSkill[];
  imageUrl: string;
};

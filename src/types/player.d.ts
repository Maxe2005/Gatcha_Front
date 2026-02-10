export type PlayerData = {
  username: string;
  userId?: string | number;
  level: number;
  experience: number;
  gold: number;
  gems: number;
  tickets: number;
  monsterIds: Array<string | number>;
};

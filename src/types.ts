export type TowerType = 'J' | 'K';

export interface Tower {
  id: string;
  type: TowerType;
  maxHp: number;
  damage: number;
  destroyed: boolean;
  destroyedAtTurn?: number;
}

export interface PlayerTowers {
  leftJ: Tower;
  king: Tower;
  rightJ: Tower;
}

export type PlayerId = 'p1' | 'p2';

export interface GameState {
  p1: PlayerTowers;
  p2: PlayerTowers;
}

export type TThemeId = 'cozy' | 'textbook';

export type TModeId = 'intrusion' | 'network' | 'system';

export type TGameStatus = 'idle' | 'running' | 'finished';

export interface ISessionLine {
  prompt: string; // auto-rendered, never typed. "$ " command, "> " script body (typed), "" output
  text: string; // what the user types
}

export type TSession = ISessionLine[];

export interface ISessionScript {
  id: string;
  mode: TModeId;
  lines: TSession;
}

export interface IThemeConfig {
  id: TThemeId;
  name: string;
  description: string;
}

export interface ISessionResult {
  wpm: number;
  accuracy: number;
  linesCleared: number;
  errors: number;
  breachScore: number;
}

export interface IClearanceRank {
  name: string;
  blurb: string;
}

import Joi from "joi";

export const systemsSchema = Joi.string().valid(
  "D&D 5e",
  "Pathfinder 2e",
  "Call of Cthulhu",
  "Shadowrun",
  "Vampire: The Masquerade",
  "Cyberpunk 2077",
  "Blades in the Dark",
  "Starfinder",
  "Savage Worlds"
);

export const playstylesSchema = Joi.string().valid(
  "Roleplay-heavy",
  "Combat-focused",
  "Casual",
  "Narrative-driven",
  "Mechanics-heavy"
);

export const likesSchema = Joi.string().valid(
  "Dungeons",
  "Exploration",
  "Combat",
  "Roleplay",
  "Puzzles"
);

export const dislikesSchema = Joi.string().valid(
  "Violence",
  "Meta-gaming",
  "Railroading",
  "Long Sessions"
);

export const experience = Joi.string().valid(
  "Rookie: Getting to know P&P",
  "Adventurer: I know my game",
  "Hero: P&P is my life"
);

export const playingRole = Joi.string().valid("Game Master", "Player");

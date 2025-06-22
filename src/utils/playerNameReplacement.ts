/**
 * Player Name Replacement Utility
 * Replaces {{PLAYER_NAME}} placeholders with actual player name in game content
 */

export interface GameContentWithPlayerName {
  [key: string]: Record<string, unknown>;
}

/**
 * Replace {{PLAYER_NAME}} placeholders in any string
 */
  if (!text || !playerName) return text;
  return text.replace(/\{\{PLAYER_NAME\}\}/g, playerName);
};

/**
 * Recursively replace {{PLAYER_NAME}} placeholders in any object
 * This handles nested objects, arrays, and strings throughout the game manifest
 */
  obj: T, 
  playerName: string
): T => {
  if (!playerName) return obj;
  
  if (typeof obj === 'string') {
    return replacePlayerName(obj, playerName) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => replacePlayerNameInObject(item, playerName)) as unknown as T;
  }
  
  if (obj && typeof obj === 'object') {
    const result: GameContentWithPlayerName = {};
    
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replacePlayerNameInObject(value, playerName);
    }
    
    return result as T;
  }
  
  return obj;
};

/**
 * Process dialogue scene data to replace player name placeholders
 */
  sceneData: Record<string, unknown>,
  playerName: string
) => {
  if (!playerName) return sceneData;
  
  return replacePlayerNameInObject(sceneData, playerName);
};

/**
 * Process quiz scene data to replace player name placeholders
 */
  sceneData: Record<string, unknown>,
  playerName: string
) => {
  if (!playerName) return sceneData;
  
  return replacePlayerNameInObject(sceneData, playerName);
};

/**
 * Process entire game manifest to replace player name placeholders
 */
  gameManifest: Record<string, unknown>,
  playerName: string
) => {
  if (!playerName) return gameManifest;
  
  return replacePlayerNameInObject(gameManifest, playerName);
};
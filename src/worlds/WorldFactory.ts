/**
 * World Factory
 * Factory pattern for creating Q3 multi-world instances
 * Building on Q2 patterns with Q3 multi-world architecture
 */

import React from 'react';
import { WorldTheme, WorldDefinition, getWorldDefinition } from '../types/q3-multi-world';

// World component imports
import { MunicipalFoundationsWorld } from './MunicipalFoundationsWorld';
import { CitizenServiceWorld } from './CitizenServiceWorld';
import { EmergencyResponseWorld } from './EmergencyResponseWorld';
import { LeadershipDevelopmentWorld } from './LeadershipDevelopmentWorld';
import { InnovationImplementationWorld } from './InnovationImplementationWorld';

export interface WorldComponentProps {
  hubSessionId: string;
  uniqueCode: string;
  culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal';
  worldDefinition: WorldDefinition;
}

export type WorldComponent = React.ComponentType<WorldComponentProps>;

/**
 * World Factory for creating Q3 multi-world instances
 */
export class WorldFactory {
  private static worldComponents: Map<WorldTheme, WorldComponent> = new Map([
    ['municipal_foundations', MunicipalFoundationsWorld as WorldComponent],
    ['citizen_service', CitizenServiceWorld as WorldComponent],
    ['emergency_response', EmergencyResponseWorld as WorldComponent],
    ['leadership_development', LeadershipDevelopmentWorld as WorldComponent],
    ['innovation_implementation', InnovationImplementationWorld as WorldComponent]
  ]);

  /**
   * Create world component by world index
   */
  static createWorldByIndex(
    worldIndex: number,
    hubSessionId: string,
    uniqueCode: string,
    culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal'
  ): React.ReactElement | null {
    const worldDefinition = getWorldDefinition(worldIndex);
    if (!worldDefinition) {
      console.error(`No world definition found for index ${worldIndex}`);
      return null;
    }

    return this.createWorld(worldDefinition.theme, hubSessionId, uniqueCode, culturalContext);
  }

  /**
   * Create world component by theme
   */
  static createWorld(
    theme: WorldTheme,
    hubSessionId: string,
    uniqueCode: string,
    culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal'
  ): React.ReactElement | null {
    const WorldComponent = this.worldComponents.get(theme);
    
    if (!WorldComponent) {
      console.error(`No world component found for theme: ${theme}`);
      return null;
    }

    const worldDefinition = this.getWorldDefinitionByTheme(theme);
    if (!worldDefinition) {
      console.error(`No world definition found for theme: ${theme}`);
      return null;
    }

    return React.createElement(WorldComponent, {
      hubSessionId,
      uniqueCode,
      culturalContext,
      worldDefinition
    });
  }

  /**
   * Get all available world themes
   */
  static getAvailableWorldThemes(): WorldTheme[] {
    return Array.from(this.worldComponents.keys());
  }

  /**
   * Check if world theme is implemented
   */
  static isWorldImplemented(theme: WorldTheme): boolean {
    return this.worldComponents.has(theme);
  }

  /**
   * Get world component class by theme
   */
  static getWorldComponent(theme: WorldTheme): WorldComponent | null {
    return this.worldComponents.get(theme) || null;
  }

  /**
   * Register new world component
   */
  static registerWorldComponent(theme: WorldTheme, component: WorldComponent): void {
    this.worldComponents.set(theme, component);
  }

  /**
   * Get world definition by theme
   */
  private static getWorldDefinitionByTheme(theme: WorldTheme): WorldDefinition | null {
    // Find world definition by theme
    for (let i = 1; i <= 5; i++) {
      const definition = getWorldDefinition(i);
      if (definition && definition.theme === theme) {
        return definition;
      }
    }
    return null;
  }

  /**
   * Get world display information
   */
  static getWorldDisplayInfo(theme: WorldTheme, culturalContext: string) {
    const definition = this.getWorldDefinitionByTheme(theme);
    if (!definition) return null;

    const culturalKey = culturalContext as keyof typeof definition.title;
    
    return {
      title: definition.title[culturalKey] || definition.title.swedish,
      description: definition.description[culturalKey] || definition.description.swedish,
      difficulty: definition.difficulty,
      estimatedDuration: definition.estimatedDuration,
      worldIndex: definition.worldIndex,
      worldId: definition.worldId,
      theme: definition.theme
    };
  }

  /**
   * Get world icon by theme
   */
  static getWorldIcon(theme: WorldTheme): string {
    const icons: Record<WorldTheme, string> = {
      'municipal_foundations': '🏛️',
      'citizen_service': '👥',
      'emergency_response': '🚨',
      'leadership_development': '👔',
      'innovation_implementation': '💡'
    };
    return icons[theme] || '🌍';
  }

  /**
   * Get world color scheme by theme
   */
  static getWorldColorScheme(theme: WorldTheme) {
    const colorSchemes: Record<WorldTheme, { primary: string; secondary: string; accent: string }> = {
      'municipal_foundations': {
        primary: '#3b82f6',
        secondary: '#dbeafe',
        accent: '#1d4ed8'
      },
      'citizen_service': {
        primary: '#10b981',
        secondary: '#d1fae5',
        accent: '#059669'
      },
      'emergency_response': {
        primary: '#ef4444',
        secondary: '#fee2e2',
        accent: '#dc2626'
      },
      'leadership_development': {
        primary: '#8b5cf6',
        secondary: '#ede9fe',
        accent: '#7c3aed'
      },
      'innovation_implementation': {
        primary: '#f59e0b',
        secondary: '#fef3c7',
        accent: '#d97706'
      }
    };
    return colorSchemes[theme] || colorSchemes.municipal_foundations;
  }

  /**
   * Validate world prerequisites
   */
  static validateWorldPrerequisites(
    worldIndex: number,
    completedWorlds: number[]
  ): { canAccess: boolean; missingPrerequisites: number[] } {
    const definition = getWorldDefinition(worldIndex);
    if (!definition) {
      return { canAccess: false, missingPrerequisites: [] };
    }

    const missingPrerequisites = definition.prerequisiteWorlds.filter(
      prereq => !completedWorlds.includes(prereq)
    );

    return {
      canAccess: missingPrerequisites.length === 0,
      missingPrerequisites
    };
  }

  /**
   * Get recommended next worlds based on completion
   */
  static getRecommendedNextWorlds(
    completedWorlds: number[]
  ): { worldIndex: number; theme: WorldTheme; priority: 'high' | 'medium' | 'low' }[] {
    const recommendations: { worldIndex: number; theme: WorldTheme; priority: 'high' | 'medium' | 'low' }[] = [];

    for (let i = 1; i <= 5; i++) {
      if (completedWorlds.includes(i)) continue;

      const { canAccess } = this.validateWorldPrerequisites(i, completedWorlds);
      if (canAccess) {
        const definition = getWorldDefinition(i);
        if (definition) {
          // Prioritize by difficulty and natural progression
          let priority: 'high' | 'medium' | 'low' = 'medium';
          
          if (completedWorlds.length === 0 && i === 1) priority = 'high';
          else if (completedWorlds.length === i - 1) priority = 'high';
          else if (definition.difficulty <= 2) priority = 'medium';
          else priority = 'low';

          recommendations.push({
            worldIndex: i,
            theme: definition.theme,
            priority
          });
        }
      }
    }

    // Sort by priority and world index
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.worldIndex - b.worldIndex;
    });
  }
}